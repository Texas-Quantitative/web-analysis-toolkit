#!/usr/bin/env node

/**
 * Media Query Extractor
 * 
 * Extracts actual CSS media query breakpoints and rules from website stylesheets.
 * Shows exactly when CSS properties change at specific viewport widths.
 * 
 * Usage:
 *   node src/extractors/media-queries.mjs <url> [options]
 * 
 * Options:
 *   --property <prop>    Filter by specific CSS property (e.g., margin-left, width)
 *   --selector <sel>     Filter by specific CSS selector (e.g., .hero-section)
 *   --output <file>      Save results to JSON file (default: analysis/media-queries/)
 *   --force              Force fresh fetch (ignore cache)
 * 
 * Examples:
 *   node src/extractors/media-queries.mjs https://example.com
 *   node src/extractors/media-queries.mjs https://example.com --property margin-left
 *   node src/extractors/media-queries.mjs https://example.com --selector .hero-section
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const url = args[0];
const propertyFilter = args.includes('--property') ? args[args.indexOf('--property') + 1] : null;
const selectorFilter = args.includes('--selector') ? args[args.indexOf('--selector') + 1] : null;
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
const forceRefresh = args.includes('--force');

if (!url) {
    console.error('❌ Error: URL is required');
    console.log('\nUsage: node src/extractors/media-queries.mjs <url> [options]');
    console.log('\nOptions:');
    console.log('  --property <prop>    Filter by CSS property (e.g., margin-left)');
    console.log('  --selector <sel>     Filter by CSS selector (e.g., .hero-section)');
    console.log('  --output <file>      Save to JSON file');
    console.log('  --force              Force fresh fetch (ignore cache)');
    process.exit(1);
}

// Cache configuration
const CACHE_DIR = path.join(__dirname, '..', '..', '.cache', 'media-queries');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(url) {
    return crypto.createHash('md5').update(url).digest('hex');
}

function getCachePath(url) {
    const cacheKey = getCacheKey(url);
    return path.join(CACHE_DIR, `${cacheKey}.json`);
}

function loadFromCache(url) {
    if (forceRefresh) {
        console.log('⚡ Force refresh enabled - skipping cache');
        return null;
    }

    const cachePath = getCachePath(url);
    if (!fs.existsSync(cachePath)) {
        return null;
    }

    const stats = fs.statSync(cachePath);
    const age = Date.now() - stats.mtime.getTime();

    if (age > CACHE_DURATION) {
        console.log('⏰ Cache expired - fetching fresh data');
        return null;
    }

    console.log(`✅ Loading from cache (${Math.round(age / 1000 / 60)} minutes old)`);
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
}

function saveToCache(url, data) {
    const cachePath = getCachePath(url);
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
    console.log(`💾 Cached results for future use`);
}

async function extractMediaQueries(url) {
    console.log(`\n🔍 Extracting media queries from: ${url}\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        console.log('📊 Analyzing stylesheets...');

        const mediaQueryData = await page.evaluate(() => {
            const results = {
                breakpoints: new Map(),
                mediaQueries: [],
                summary: {
                    totalMediaQueries: 0,
                    uniqueBreakpoints: new Set(),
                    mostCommonBreakpoints: []
                }
            };

            // Iterate through all stylesheets
            for (const sheet of document.styleSheets) {
                try {
                    // Skip external stylesheets from different origins
                    if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
                        continue;
                    }

                    const rules = sheet.cssRules || sheet.rules;
                    if (!rules) continue;

                    for (const rule of rules) {
                        // Check if it's a media rule
                        if (rule.type === CSSRule.MEDIA_RULE) {
                            const mediaText = rule.media.mediaText;
                            const cssText = rule.cssText;

                            results.summary.totalMediaQueries++;

                            // Parse the media query
                            const mediaQuery = {
                                condition: mediaText,
                                rules: [],
                                breakpoint: null,
                                type: null // min-width, max-width, etc.
                            };

                            // Extract breakpoint value
                            const minWidthMatch = mediaText.match(/min-width:\s*(\d+)px/);
                            const maxWidthMatch = mediaText.match(/max-width:\s*(\d+)px/);

                            if (minWidthMatch) {
                                mediaQuery.breakpoint = parseInt(minWidthMatch[1]);
                                mediaQuery.type = 'min-width';
                                results.summary.uniqueBreakpoints.add(mediaQuery.breakpoint);
                            } else if (maxWidthMatch) {
                                mediaQuery.breakpoint = parseInt(maxWidthMatch[1]);
                                mediaQuery.type = 'max-width';
                                results.summary.uniqueBreakpoints.add(mediaQuery.breakpoint);
                            }

                            // Extract individual CSS rules within the media query
                            for (const innerRule of rule.cssRules) {
                                if (innerRule.type === CSSRule.STYLE_RULE) {
                                    const selector = innerRule.selectorText;
                                    const style = innerRule.style;

                                    const properties = {};
                                    for (let i = 0; i < style.length; i++) {
                                        const prop = style[i];
                                        properties[prop] = style.getPropertyValue(prop);
                                    }

                                    mediaQuery.rules.push({
                                        selector: selector,
                                        properties: properties
                                    });
                                }
                            }

                            results.mediaQueries.push(mediaQuery);

                            // Group by breakpoint
                            if (mediaQuery.breakpoint) {
                                const key = `${mediaQuery.type}-${mediaQuery.breakpoint}`;
                                if (!results.breakpoints.has(key)) {
                                    results.breakpoints.set(key, []);
                                }
                                results.breakpoints.get(key).push(mediaQuery);
                            }
                        }
                    }
                } catch (err) {
                    // Skip stylesheets we can't access (CORS)
                    console.warn('Could not access stylesheet:', err.message);
                }
            }

            // Convert Sets and Maps to arrays for JSON serialization
            results.summary.uniqueBreakpoints = Array.from(results.summary.uniqueBreakpoints).sort((a, b) => a - b);
            results.breakpoints = Object.fromEntries(results.breakpoints);

            return results;
        });

        console.log(`✅ Found ${mediaQueryData.summary.totalMediaQueries} media queries`);
        console.log(`✅ Identified ${mediaQueryData.summary.uniqueBreakpoints.length} unique breakpoints\n`);

        return mediaQueryData;

    } finally {
        await browser.close();
    }
}

function applyFilters(data) {
    if (!propertyFilter && !selectorFilter) {
        return data;
    }

    console.log('\n🔍 Applying filters...');
    if (propertyFilter) console.log(`   Property: ${propertyFilter}`);
    if (selectorFilter) console.log(`   Selector: ${selectorFilter}`);

    const filtered = {
        ...data,
        mediaQueries: data.mediaQueries.map(mq => {
            const filteredRules = mq.rules.filter(rule => {
                let matchesProperty = !propertyFilter;
                let matchesSelector = !selectorFilter;

                if (propertyFilter) {
                    matchesProperty = Object.keys(rule.properties).some(prop => 
                        prop.includes(propertyFilter) || propertyFilter.includes(prop)
                    );
                }

                if (selectorFilter) {
                    matchesSelector = rule.selector.includes(selectorFilter);
                }

                return matchesProperty && matchesSelector;
            });

            return {
                ...mq,
                rules: filteredRules,
                matchCount: filteredRules.length
            };
        }).filter(mq => mq.rules.length > 0)
    };

    console.log(`✅ Filtered to ${filtered.mediaQueries.length} relevant media queries\n`);
    return filtered;
}

function displayResults(data) {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    MEDIA QUERY ANALYSIS');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📊 SUMMARY:');
    console.log(`   Total Media Queries: ${data.summary.totalMediaQueries}`);
    console.log(`   Unique Breakpoints: ${data.summary.uniqueBreakpoints.join(', ')}px\n`);

    console.log('📐 BREAKPOINT BREAKDOWN:\n');

    // Group and display by breakpoint
    const breakpointGroups = {};
    data.mediaQueries.forEach(mq => {
        if (mq.breakpoint) {
            const key = `${mq.type} ${mq.breakpoint}px`;
            if (!breakpointGroups[key]) {
                breakpointGroups[key] = [];
            }
            breakpointGroups[key].push(mq);
        }
    });

    // Sort breakpoints
    const sortedBreakpoints = Object.keys(breakpointGroups).sort((a, b) => {
        const aVal = parseInt(a.match(/\d+/)[0]);
        const bVal = parseInt(b.match(/\d+/)[0]);
        return aVal - bVal;
    });

    sortedBreakpoints.forEach(breakpoint => {
        const queries = breakpointGroups[breakpoint];
        console.log(`\n🔹 @media (${breakpoint}):`);
        console.log(`   ${queries.length} rule(s)\n`);

        queries.forEach(mq => {
            mq.rules.forEach(rule => {
                console.log(`   ${rule.selector} {`);
                Object.entries(rule.properties).forEach(([prop, value]) => {
                    console.log(`      ${prop}: ${value};`);
                });
                console.log(`   }\n`);
            });
        });
    });

    // Display unbreakpointed media queries (e.g., print, orientation)
    const otherQueries = data.mediaQueries.filter(mq => !mq.breakpoint);
    if (otherQueries.length > 0) {
        console.log('\n🔹 OTHER MEDIA QUERIES:\n');
        otherQueries.forEach(mq => {
            console.log(`   @media ${mq.condition}`);
            console.log(`   ${mq.rules.length} rule(s)\n`);
        });
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
}

function saveResults(data, url) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const domain = new URL(url).hostname.replace(/[^a-z0-9]/gi, '-');
    
    let filename;
    if (outputFile) {
        filename = outputFile;
    } else {
        const baseDir = path.join(process.cwd(), 'analysis', 'media-queries', timestamp);
        fs.mkdirSync(baseDir, { recursive: true });
        filename = path.join(baseDir, `${domain}-media-queries.json`);
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Results saved to: ${filename}\n`);
    return filename;
}

// Main execution
(async () => {
    try {
        // Check cache first
        let data = loadFromCache(url);

        if (!data) {
            // Fresh extraction
            data = await extractMediaQueries(url);
            saveToCache(url, data);
        }

        // Apply filters
        const filteredData = applyFilters(data);

        // Display results
        displayResults(filteredData);

        // Save results
        const savedPath = saveResults(filteredData, url);

        console.log('✅ Media query extraction complete!\n');
        console.log('💡 TIP: Use --property or --selector to filter specific CSS changes');
        console.log('💡 TIP: Use --force to bypass cache and fetch fresh data\n');

    } catch (error) {
        console.error('\n❌ Error extracting media queries:', error.message);
        process.exit(1);
    }
})();
