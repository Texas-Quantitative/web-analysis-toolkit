#!/usr/bin/env node
/**
 * Raw CSS Extraction Tool
 * Extracts all CSS files and creates comprehensive color/font inventories
 * 
 * Usage: node tools/scrape-styles.mjs <url>
 * Example: node tools/scrape-styles.mjs https://example.com
 */

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { URL } from 'url';
import path from 'path';

// Ensure orig directory exists
if (!existsSync('orig')) {
    mkdirSync('orig');
}

async function extractRawCSS(targetUrl) {
    console.log(`🔍 Extracting CSS from ${targetUrl}`);
    
    try {
        // Fetch the main HTML page
        const response = await fetch(targetUrl);
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Find all CSS links
        const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .map(link => link.href)
            .filter(href => href);
        
        // Find inline styles
        const inlineStyles = Array.from(document.querySelectorAll('style'))
            .map(style => style.textContent)
            .filter(content => content && content.trim());
        
        console.log(`📋 Found ${cssLinks.length} linked stylesheets and ${inlineStyles.length} inline styles`);
        
        // Initialize inventories
        const inventory = {
            url: targetUrl,
            extractedAt: new Date().toISOString(),
            cssFiles: [],
            colors: new Set(),
            fonts: new Set(),
            summary: {}
        };
        
        // Extract from linked CSS files
        for (let i = 0; i < cssLinks.length; i++) {
            const cssUrl = new URL(cssLinks[i], targetUrl).href;
            console.log(`📥 Fetching CSS file ${i + 1}/${cssLinks.length}: ${cssUrl}`);
            
            try {
                const cssResponse = await fetch(cssUrl);
                const cssContent = await cssResponse.text();
                
                // Save raw CSS file
                const filename = `stylesheet-${i + 1}.css`;
                writeFileSync(`orig/${filename}`, cssContent);
                
                // Extract colors and fonts from this CSS
                const fileInventory = extractCSSInventory(cssContent);
                inventory.cssFiles.push({
                    url: cssUrl,
                    filename: filename,
                    colors: fileInventory.colors.length,
                    fonts: fileInventory.fonts.length
                });
                
                // Add to global inventory
                fileInventory.colors.forEach(color => inventory.colors.add(color));
                fileInventory.fonts.forEach(font => inventory.fonts.add(font));
                
                // Add delay to be respectful
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ Error fetching ${cssUrl}:`, error.message);
            }
        }
        
        // Extract from inline styles
        if (inlineStyles.length > 0) {
            const inlineCSS = inlineStyles.join('\n');
            writeFileSync('orig/inline-styles.css', inlineCSS);
            
            const inlineInventory = extractCSSInventory(inlineCSS);
            inlineInventory.colors.forEach(color => inventory.colors.add(color));
            inlineInventory.fonts.forEach(font => inventory.fonts.add(font));
            
            inventory.cssFiles.push({
                url: 'inline',
                filename: 'inline-styles.css',
                colors: inlineInventory.colors.length,
                fonts: inlineInventory.fonts.length
            });
        }
        
        // Convert Sets to Arrays and create summary
        inventory.colors = Array.from(inventory.colors).sort();
        inventory.fonts = Array.from(inventory.fonts).sort();
        
        inventory.summary = {
            totalCssFiles: inventory.cssFiles.length,
            totalColors: inventory.colors.length,
            totalFonts: inventory.fonts.length,
            colorsByType: categorizeColors(inventory.colors),
            commonFonts: inventory.fonts.slice(0, 10)
        };
        
        // Save inventory
        writeFileSync('orig/_style-inventory.json', JSON.stringify(inventory, null, 2));
        
        console.log(`✅ Extraction complete!`);
        console.log(`📊 Summary:`);
        console.log(`   • CSS Files: ${inventory.summary.totalCssFiles}`);
        console.log(`   • Colors: ${inventory.summary.totalColors}`);
        console.log(`   • Fonts: ${inventory.summary.totalFonts}`);
        console.log(`📄 Results saved to orig/_style-inventory.json`);
        
        return inventory;
        
    } catch (error) {
        console.error('❌ Error extracting CSS:', error);
        throw error;
    }
}

function extractCSSInventory(cssContent) {
    const colors = new Set();
    const fonts = new Set();
    
    // Color patterns
    const colorPatterns = [
        /#[0-9a-fA-F]{3,6}/g,                          // Hex colors
        /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,      // RGB
        /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA
        /hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g,    // HSL
        /hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g, // HSLA
    ];
    
    // Extract colors
    colorPatterns.forEach(pattern => {
        const matches = cssContent.match(pattern);
        if (matches) {
            matches.forEach(color => colors.add(color.toLowerCase()));
        }
    });
    
    // Named colors (common ones)
    const namedColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
        'gray', 'grey', 'darkgray', 'lightgray', 'transparent', 'inherit'
    ];
    
    namedColors.forEach(namedColor => {
        const regex = new RegExp(`\\b${namedColor}\\b`, 'gi');
        if (regex.test(cssContent)) {
            colors.add(namedColor);
        }
    });
    
    // Extract font families
    const fontPattern = /font-family\s*:\s*([^;]+)/gi;
    const fontMatches = cssContent.match(fontPattern);
    
    if (fontMatches) {
        fontMatches.forEach(match => {
            const fontList = match.replace(/font-family\s*:\s*/i, '').trim();
            // Split by comma and clean up each font
            const fontFamilies = fontList.split(',').map(font => 
                font.trim().replace(/['"]/g, '')
            );
            fontFamilies.forEach(font => {
                if (font && font !== 'inherit' && font !== 'initial') {
                    fonts.add(font);
                }
            });
        });
    }
    
    return {
        colors: Array.from(colors),
        fonts: Array.from(fonts)
    };
}

function categorizeColors(colors) {
    const categories = {
        hex: colors.filter(c => c.startsWith('#')),
        rgb: colors.filter(c => c.startsWith('rgb(')),
        rgba: colors.filter(c => c.startsWith('rgba(')),
        hsl: colors.filter(c => c.startsWith('hsl(')),
        hsla: colors.filter(c => c.startsWith('hsla(')),
        named: colors.filter(c => !c.startsWith('#') && !c.startsWith('rgb') && !c.startsWith('hsl'))
    };
    
    return Object.fromEntries(
        Object.entries(categories).map(([key, values]) => [key, values.length])
    );
}

// Command line usage
const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: node scrape-styles.mjs <url>');
    console.error('   Example: node scrape-styles.mjs https://example.com');
    process.exit(1);
}

// Validate URL
try {
    new URL(url);
} catch (error) {
    console.error('❌ Invalid URL provided');
    process.exit(1);
}

extractRawCSS(url).catch(error => {
    console.error('❌ Failed to extract CSS:', error.message);
    process.exit(1);
});