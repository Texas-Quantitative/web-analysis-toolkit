#!/usr/bin/env node
/**
 * Computed Styles Analyzer
 * Gets actual computed styles applied to elements (not just raw CSS)
 * 
 * Usage: node tools/audit-computed.mjs <url>
 * Example: node tools/audit-computed.mjs https://example.com
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Ensure orig directory exists
if (!existsSync('orig')) {
    mkdirSync('orig');
}

async function auditComputedStyles(url) {
    console.log(`🔍 Analyzing computed styles on ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for consistent results
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log(`📥 Loading page...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait a bit more for dynamic content
        await page.waitForTimeout(2000);
        
        console.log(`🔍 Extracting computed styles...`);
        
        const computedStylesData = await page.evaluate(() => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                elements: [],
                inventory: {
                    colors: new Set(),
                    fonts: new Set(),
                    fontSizes: new Set(),
                    fontWeights: new Set(),
                    backgroundColors: new Set(),
                    borderColors: new Set()
                }
            };
            
            // Get all visible elements
            const allElements = document.querySelectorAll('*');
            const visibleElements = Array.from(allElements).filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
            });
            
            console.log(`Found ${visibleElements.length} visible elements`);
            
            visibleElements.forEach((element, index) => {
                if (index % 100 === 0) {
                    console.log(`Processing element ${index + 1}/${visibleElements.length}`);
                }
                
                const computed = window.getComputedStyle(element);
                
                // Extract key style properties
                const elementData = {
                    tagName: element.tagName.toLowerCase(),
                    className: element.className || '',
                    id: element.id || '',
                    textContent: element.textContent?.trim().substring(0, 100) || '',
                    styles: {
                        // Typography
                        color: computed.color,
                        fontSize: computed.fontSize,
                        fontFamily: computed.fontFamily,
                        fontWeight: computed.fontWeight,
                        lineHeight: computed.lineHeight,
                        textAlign: computed.textAlign,
                        
                        // Background
                        backgroundColor: computed.backgroundColor,
                        backgroundImage: computed.backgroundImage,
                        
                        // Layout
                        display: computed.display,
                        position: computed.position,
                        width: computed.width,
                        height: computed.height,
                        
                        // Spacing
                        margin: computed.margin,
                        padding: computed.padding,
                        
                        // Borders
                        border: computed.border,
                        borderColor: computed.borderColor,
                        borderRadius: computed.borderRadius,
                        
                        // Effects
                        boxShadow: computed.boxShadow,
                        opacity: computed.opacity,
                        zIndex: computed.zIndex
                    }
                };
                
                // Add to inventory
                if (computed.color && computed.color !== 'rgba(0, 0, 0, 0)') {
                    results.inventory.colors.add(computed.color);
                }
                if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    results.inventory.backgroundColors.add(computed.backgroundColor);
                }
                if (computed.borderColor && computed.borderColor !== 'rgba(0, 0, 0, 0)') {
                    results.inventory.borderColors.add(computed.borderColor);
                }
                if (computed.fontFamily) {
                    results.inventory.fonts.add(computed.fontFamily);
                }
                if (computed.fontSize) {
                    results.inventory.fontSizes.add(computed.fontSize);
                }
                if (computed.fontWeight) {
                    results.inventory.fontWeights.add(computed.fontWeight);
                }
                
                results.elements.push(elementData);
            });
            
            // Convert Sets to Arrays for JSON serialization
            results.inventory.colors = Array.from(results.inventory.colors).sort();
            results.inventory.fonts = Array.from(results.inventory.fonts).sort();
            results.inventory.fontSizes = Array.from(results.inventory.fontSizes).sort();
            results.inventory.fontWeights = Array.from(results.inventory.fontWeights).sort();
            results.inventory.backgroundColors = Array.from(results.inventory.backgroundColors).sort();
            results.inventory.borderColors = Array.from(results.inventory.borderColors).sort();
            
            return results;
        });
        
        // Add summary statistics
        computedStylesData.summary = {
            totalElements: computedStylesData.elements.length,
            uniqueColors: computedStylesData.inventory.colors.length,
            uniqueFonts: computedStylesData.inventory.fonts.length,
            uniqueFontSizes: computedStylesData.inventory.fontSizes.length,
            uniqueFontWeights: computedStylesData.inventory.fontWeights.length,
            uniqueBackgroundColors: computedStylesData.inventory.backgroundColors.length,
            uniqueBorderColors: computedStylesData.inventory.borderColors.length,
            
            // Most common values
            mostCommonFontSizes: getMostCommon(computedStylesData.inventory.fontSizes.slice(0, 10)),
            mostCommonFontWeights: getMostCommon(computedStylesData.inventory.fontWeights.slice(0, 5)),
            mostCommonColors: getMostCommon(computedStylesData.inventory.colors.slice(0, 10))
        };
        
        // Save complete data
        writeFileSync('orig/_computed-style-inventory.json', JSON.stringify(computedStylesData, null, 2));
        
        // Create simplified inventory for quick reference
        const quickInventory = {
            url: computedStylesData.url,
            extractedAt: computedStylesData.extractedAt,
            summary: computedStylesData.summary,
            inventory: computedStylesData.inventory
        };
        
        writeFileSync('orig/_computed-styles-quick.json', JSON.stringify(quickInventory, null, 2));
        
        console.log(`✅ Computed styles analysis complete!`);
        console.log(`📊 Summary:`);
        console.log(`   • Elements analyzed: ${computedStylesData.summary.totalElements}`);
        console.log(`   • Unique colors: ${computedStylesData.summary.uniqueColors}`);
        console.log(`   • Unique fonts: ${computedStylesData.summary.uniqueFonts}`);
        console.log(`   • Font sizes: ${computedStylesData.summary.uniqueFontSizes}`);
        console.log(`📄 Full results: orig/_computed-style-inventory.json`);
        console.log(`📄 Quick reference: orig/_computed-styles-quick.json`);
        
        return computedStylesData;
        
    } catch (error) {
        console.error('❌ Error during computed styles analysis:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function getMostCommon(array) {
    if (!array || array.length === 0) return [];
    
    const frequency = {};
    array.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([item, count]) => ({ value: item, count }));
}

// Command line usage
const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: node audit-computed.mjs <url>');
    console.error('   Example: node audit-computed.mjs https://example.com');
    process.exit(1);
}

// Validate URL
try {
    new URL(url);
} catch (error) {
    console.error('❌ Invalid URL provided');
    process.exit(1);
}

auditComputedStyles(url).catch(error => {
    console.error('❌ Failed to analyze computed styles:', error.message);
    process.exit(1);
});