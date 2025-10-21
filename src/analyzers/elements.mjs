#!/usr/bin/env node
/**
 * Element-Specific Analyzer
 * Deep analysis of specific components and elements
 * 
 * Usage: node tools/analyze-specific-elements.mjs <url> [selector]
 * Example: node tools/analyze-specific-elements.mjs https://example.com ".navbar"
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Ensure orig directory exists
if (!existsSync('orig')) {
    mkdirSync('orig');
}

async function analyzeSpecificElements(url, selector = '*') {
    console.log(`🔍 Analyzing specific elements on ${url}`);
    console.log(`🎯 Selector: ${selector}`);
    
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
        
        // Wait for dynamic content
        await page.waitForTimeout(2000);
        
        // Scroll to reveal lazy-loaded content
        await page.evaluate(() => {
            return new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
        
        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1000);
        
        console.log(`🔍 Analyzing elements matching: ${selector}`);
        
        const analysisData = await page.evaluate((sel) => {
            const results = {
                url: window.location.href,
                selector: sel,
                extractedAt: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                matchingElements: [],
                styleInventory: {
                    colors: new Set(),
                    backgroundColors: new Set(),
                    borderColors: new Set(),
                    fonts: new Set(),
                    fontSizes: new Set(),
                    fontWeights: new Set(),
                    dimensions: new Set(),
                    spacings: new Set()
                }
            };
            
            try {
                const elements = document.querySelectorAll(sel);
                console.log(`Found ${elements.length} matching elements`);
                
                elements.forEach((element, index) => {
                    const computed = window.getComputedStyle(element);
                    const rect = element.getBoundingClientRect();
                    
                    // Create unique selector for this element
                    const generateSelector = (el) => {
                        if (el.id) return `#${el.id}`;
                        if (el.className) {
                            const classes = Array.from(el.classList).join('.');
                            return `${el.tagName.toLowerCase()}.${classes}`;
                        }
                        return `${el.tagName.toLowerCase()}:nth-child(${Array.from(el.parentNode.children).indexOf(el) + 1})`;
                    };
                    
                    const elementData = {
                        index: index + 1,
                        uniqueSelector: generateSelector(element),
                        tagName: element.tagName.toLowerCase(),
                        className: element.className || '',
                        id: element.id || '',
                        textContent: element.textContent?.trim() || '',
                        innerHTML: element.innerHTML.length > 200 ? 
                                  element.innerHTML.substring(0, 200) + '...' : 
                                  element.innerHTML,
                        
                        // Position and dimensions
                        boundingBox: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            top: Math.round(rect.top),
                            left: Math.round(rect.left),
                            bottom: Math.round(rect.bottom),
                            right: Math.round(rect.right)
                        },
                        
                        // Comprehensive computed styles
                        computedStyles: {
                            // Typography
                            color: computed.color,
                            fontSize: computed.fontSize,
                            fontFamily: computed.fontFamily,
                            fontWeight: computed.fontWeight,
                            fontStyle: computed.fontStyle,
                            lineHeight: computed.lineHeight,
                            letterSpacing: computed.letterSpacing,
                            textAlign: computed.textAlign,
                            textDecoration: computed.textDecoration,
                            textTransform: computed.textTransform,
                            
                            // Background
                            backgroundColor: computed.backgroundColor,
                            backgroundImage: computed.backgroundImage,
                            backgroundSize: computed.backgroundSize,
                            backgroundPosition: computed.backgroundPosition,
                            backgroundRepeat: computed.backgroundRepeat,
                            
                            // Layout
                            display: computed.display,
                            position: computed.position,
                            top: computed.top,
                            left: computed.left,
                            right: computed.right,
                            bottom: computed.bottom,
                            width: computed.width,
                            height: computed.height,
                            minWidth: computed.minWidth,
                            maxWidth: computed.maxWidth,
                            minHeight: computed.minHeight,
                            maxHeight: computed.maxHeight,
                            
                            // Flexbox/Grid
                            flexDirection: computed.flexDirection,
                            justifyContent: computed.justifyContent,
                            alignItems: computed.alignItems,
                            flexWrap: computed.flexWrap,
                            gap: computed.gap,
                            gridTemplateColumns: computed.gridTemplateColumns,
                            gridTemplateRows: computed.gridTemplateRows,
                            
                            // Spacing
                            margin: computed.margin,
                            marginTop: computed.marginTop,
                            marginRight: computed.marginRight,
                            marginBottom: computed.marginBottom,
                            marginLeft: computed.marginLeft,
                            padding: computed.padding,
                            paddingTop: computed.paddingTop,
                            paddingRight: computed.paddingRight,
                            paddingBottom: computed.paddingBottom,
                            paddingLeft: computed.paddingLeft,
                            
                            // Borders
                            border: computed.border,
                            borderTop: computed.borderTop,
                            borderRight: computed.borderRight,
                            borderBottom: computed.borderBottom,
                            borderLeft: computed.borderLeft,
                            borderColor: computed.borderColor,
                            borderWidth: computed.borderWidth,
                            borderStyle: computed.borderStyle,
                            borderRadius: computed.borderRadius,
                            
                            // Effects
                            boxShadow: computed.boxShadow,
                            textShadow: computed.textShadow,
                            opacity: computed.opacity,
                            transform: computed.transform,
                            transition: computed.transition,
                            animation: computed.animation,
                            filter: computed.filter,
                            
                            // Z-index and overflow
                            zIndex: computed.zIndex,
                            overflow: computed.overflow,
                            overflowX: computed.overflowX,
                            overflowY: computed.overflowY
                        }
                    };
                    
                    // Add to style inventory
                    const styles = elementData.computedStyles;
                    if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
                        results.styleInventory.colors.add(styles.color);
                    }
                    if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                        results.styleInventory.backgroundColors.add(styles.backgroundColor);
                    }
                    if (styles.borderColor && styles.borderColor !== 'rgba(0, 0, 0, 0)') {
                        results.styleInventory.borderColors.add(styles.borderColor);
                    }
                    if (styles.fontFamily) {
                        results.styleInventory.fonts.add(styles.fontFamily);
                    }
                    if (styles.fontSize) {
                        results.styleInventory.fontSizes.add(styles.fontSize);
                    }
                    if (styles.fontWeight) {
                        results.styleInventory.fontWeights.add(styles.fontWeight);
                    }
                    if (styles.width && styles.width !== 'auto') {
                        results.styleInventory.dimensions.add(`width: ${styles.width}`);
                    }
                    if (styles.height && styles.height !== 'auto') {
                        results.styleInventory.dimensions.add(`height: ${styles.height}`);
                    }
                    if (styles.padding && styles.padding !== '0px') {
                        results.styleInventory.spacings.add(`padding: ${styles.padding}`);
                    }
                    if (styles.margin && styles.margin !== '0px') {
                        results.styleInventory.spacings.add(`margin: ${styles.margin}`);
                    }
                    
                    results.matchingElements.push(elementData);
                });
                
                // Convert Sets to Arrays
                Object.keys(results.styleInventory).forEach(key => {
                    results.styleInventory[key] = Array.from(results.styleInventory[key]).sort();
                });
                
            } catch (error) {
                console.error('Error in page evaluation:', error);
                results.error = error.message;
            }
            
            return results;
        }, selector);
        
        // Add summary
        analysisData.summary = {
            totalMatchingElements: analysisData.matchingElements.length,
            uniqueColors: analysisData.styleInventory.colors.length,
            uniqueBackgroundColors: analysisData.styleInventory.backgroundColors.length,
            uniqueFonts: analysisData.styleInventory.fonts.length,
            uniqueFontSizes: analysisData.styleInventory.fontSizes.length,
            uniqueDimensions: analysisData.styleInventory.dimensions.length,
            uniqueSpacings: analysisData.styleInventory.spacings.length,
            
            // Element type distribution
            elementTypes: getElementTypeDistribution(analysisData.matchingElements),
            
            // Common patterns
            commonFontSizes: getTopValues(analysisData.styleInventory.fontSizes, 5),
            commonColors: getTopValues(analysisData.styleInventory.colors, 5),
            commonBackgroundColors: getTopValues(analysisData.styleInventory.backgroundColors, 5)
        };
        
        // Generate filename based on selector
        const sanitizedSelector = selector.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        const filename = `_element-analysis-${sanitizedSelector}.json`;
        
        // Save analysis
        writeFileSync(`orig/${filename}`, JSON.stringify(analysisData, null, 2));
        
        // Also save as latest for easy reference
        writeFileSync('orig/_element-analysis-latest.json', JSON.stringify(analysisData, null, 2));
        
        console.log(`✅ Element analysis complete!`);
        console.log(`📊 Summary:`);
        console.log(`   • Matching elements: ${analysisData.summary.totalMatchingElements}`);
        console.log(`   • Unique colors: ${analysisData.summary.uniqueColors}`);
        console.log(`   • Unique fonts: ${analysisData.summary.uniqueFonts}`);
        console.log(`   • Font sizes: ${analysisData.summary.uniqueFontSizes}`);
        console.log(`📄 Results saved to orig/${filename}`);
        console.log(`📄 Latest analysis: orig/_element-analysis-latest.json`);
        
        return analysisData;
        
    } catch (error) {
        console.error('❌ Error during element analysis:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function getElementTypeDistribution(elements) {
    const distribution = {};
    elements.forEach(el => {
        const tag = el.tagName;
        distribution[tag] = (distribution[tag] || 0) + 1;
    });
    
    return Object.entries(distribution)
        .sort(([,a], [,b]) => b - a)
        .map(([tag, count]) => ({ tagName: tag, count }));
}

function getTopValues(array, limit = 5) {
    if (!array || array.length === 0) return [];
    
    const frequency = {};
    array.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([value, count]) => ({ value, count }));
}

// Command line usage
const url = process.argv[2];
const selector = process.argv[3] || '*';

if (!url) {
    console.error('❌ Usage: node analyze-specific-elements.mjs <url> [selector]');
    console.error('   Example: node analyze-specific-elements.mjs https://example.com');
    console.error('   Example: node analyze-specific-elements.mjs https://example.com ".navbar"');
    console.error('   Example: node analyze-specific-elements.mjs https://example.com "h1, h2, h3"');
    process.exit(1);
}

// Validate URL
try {
    new URL(url);
} catch (error) {
    console.error('❌ Invalid URL provided');
    process.exit(1);
}

analyzeSpecificElements(url, selector).catch(error => {
    console.error('❌ Failed to analyze elements:', error.message);
    process.exit(1);
});