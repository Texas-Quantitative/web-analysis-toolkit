#!/usr/bin/env node
/**
 * Comprehensive Site Analyzer
 * Advanced element detection, positioning, and styling analysis
 * 
 * Usage: node tools/comprehensive-site-analyzer.js <url>
 * Example: node tools/comprehensive-site-analyzer.js https://example.com
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Ensure orig directory exists
if (!existsSync('orig')) {
    mkdirSync('orig');
}

async function comprehensiveSiteAnalysis(url) {
    console.log(`🔍 Comprehensive analysis of ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for analysis
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log(`📥 Loading page...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // Wait for dynamic content (using modern Puppeteer API)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log(`🔍 Performing comprehensive analysis...`);
        
        const analysisData = await page.evaluate(() => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                documentDimensions: {
                    scrollWidth: document.documentElement.scrollWidth,
                    scrollHeight: document.documentElement.scrollHeight
                },
                sections: [],
                elements: [],
                typography: {
                    hierarchy: [],
                    uniqueFonts: new Set(),
                    uniqueFontSizes: new Set()
                },
                backgrounds: [],
                forms: [],
                layout: {
                    gridElements: [],
                    flexElements: [],
                    positionedElements: []
                }
            };
            
            // Multi-selector element detection with fallback arrays
            const findElementBySelectorArray = (selectorArrays, description) => {
                for (const selectorArray of selectorArrays) {
                    for (const selector of selectorArray) {
                        try {
                            const elements = document.querySelectorAll(selector);
                            if (elements.length > 0) {
                                return {
                                    description,
                                    selector,
                                    elements: Array.from(elements),
                                    found: true
                                };
                            }
                        } catch (error) {
                            // Continue to next selector
                        }
                    }
                }
                return { description, found: false };
            };
            
            // Common element patterns
            const elementPatterns = [
                {
                    description: 'Hero Section',
                    selectors: [
                        ['.hero', '.hero-section', '[class*="hero"]'],
                        ['section:first-of-type', '.banner', '.main-banner'],
                        ['.intro', '.landing', '.above-fold']
                    ]
                },
                {
                    description: 'Navigation',
                    selectors: [
                        ['nav', '.navigation', '.nav'],
                        ['header nav', '.header-nav', '.main-nav'],
                        ['.menu', '.navbar', '[role="navigation"]']
                    ]
                },
                {
                    description: 'Footer',
                    selectors: [
                        ['footer', '.footer'],
                        ['.site-footer', '.page-footer'],
                        ['[role="contentinfo"]']
                    ]
                }
            ];
            
            // Detect common sections using multi-selector patterns
            elementPatterns.forEach(pattern => {
                const result = findElementBySelectorArray(pattern.selectors, pattern.description);
                if (result.found) {
                    result.elements.forEach((element, index) => {
                        const rect = element.getBoundingClientRect();
                        const computed = window.getComputedStyle(element);
                        
                        results.sections.push({
                            type: result.description,
                            selector: result.selector,
                            index: index + 1,
                            position: {
                                top: Math.round(rect.top),
                                left: Math.round(rect.left),
                                width: Math.round(rect.width),
                                height: Math.round(rect.height),
                                bottom: Math.round(rect.bottom),
                                right: Math.round(rect.right)
                            },
                            styling: {
                                backgroundColor: computed.backgroundColor,
                                backgroundImage: computed.backgroundImage,
                                padding: computed.padding,
                                margin: computed.margin,
                                display: computed.display,
                                position: computed.position
                            },
                            content: {
                                textLength: element.textContent?.trim().length || 0,
                                hasImages: element.querySelectorAll('img').length,
                                hasLinks: element.querySelectorAll('a').length,
                                hasButtons: element.querySelectorAll('button, input[type="button"], input[type="submit"]').length
                            }
                        });
                    });
                }
            });
            
            // Background image detection for section identification
            const detectBackgroundSections = () => {
                const backgroundSections = [];
                document.querySelectorAll('*').forEach(el => {
                    const computed = window.getComputedStyle(el);
                    if (computed.backgroundImage && computed.backgroundImage !== 'none') {
                        const rect = el.getBoundingClientRect();
                        if (rect.width > 200 && rect.height > 100) { // Significant size
                            backgroundSections.push({
                                element: el.tagName.toLowerCase(),
                                className: el.className || '',
                                id: el.id || '',
                                backgroundImage: computed.backgroundImage,
                                position: {
                                    top: Math.round(rect.top),
                                    left: Math.round(rect.left),
                                    width: Math.round(rect.width),
                                    height: Math.round(rect.height)
                                },
                                hasContent: el.textContent?.trim().length > 50,
                                contentPreview: el.textContent?.trim().substring(0, 100) || ''
                            });
                        }
                    }
                });
                return backgroundSections;
            };
            
            results.backgrounds = detectBackgroundSections();
            
            // Typography hierarchy analysis
            const typographyElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
            const typographyMap = new Map();
            
            typographyElements.forEach(el => {
                const computed = window.getComputedStyle(el);
                const fontSize = computed.fontSize;
                const fontFamily = computed.fontFamily;
                const fontWeight = computed.fontWeight;
                const lineHeight = computed.lineHeight;
                
                if (el.textContent?.trim().length > 0) {
                    const key = `${fontSize}-${fontWeight}`;
                    if (!typographyMap.has(key)) {
                        typographyMap.set(key, {
                            fontSize,
                            fontFamily,
                            fontWeight,
                            lineHeight,
                            tagName: el.tagName.toLowerCase(),
                            examples: [],
                            count: 0
                        });
                    }
                    
                    const entry = typographyMap.get(key);
                    entry.count++;
                    if (entry.examples.length < 3) {
                        entry.examples.push(el.textContent.trim().substring(0, 50));
                    }
                    
                    results.typography.uniqueFonts.add(fontFamily);
                    results.typography.uniqueFontSizes.add(fontSize);
                }
            });
            
            results.typography.hierarchy = Array.from(typographyMap.values())
                .sort((a, b) => parseInt(b.fontSize) - parseInt(a.fontSize));
            
            // Layout analysis - Grid and Flex elements
            document.querySelectorAll('*').forEach(el => {
                const computed = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                if (computed.display === 'grid' && rect.width > 100) {
                    results.layout.gridElements.push({
                        element: el.tagName.toLowerCase(),
                        className: el.className || '',
                        id: el.id || '',
                        gridTemplateColumns: computed.gridTemplateColumns,
                        gridTemplateRows: computed.gridTemplateRows,
                        gap: computed.gap,
                        position: {
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        }
                    });
                }
                
                if (computed.display === 'flex' && rect.width > 100) {
                    results.layout.flexElements.push({
                        element: el.tagName.toLowerCase(),
                        className: el.className || '',
                        id: el.id || '',
                        flexDirection: computed.flexDirection,
                        justifyContent: computed.justifyContent,
                        alignItems: computed.alignItems,
                        flexWrap: computed.flexWrap,
                        gap: computed.gap,
                        position: {
                            width: Math.round(rect.width),
                            height: Math.round(rect.height)
                        }
                    });
                }
                
                if (computed.position !== 'static' && computed.position !== 'relative') {
                    results.layout.positionedElements.push({
                        element: el.tagName.toLowerCase(),
                        className: el.className || '',
                        id: el.id || '',
                        position: computed.position,
                        top: computed.top,
                        left: computed.left,
                        right: computed.right,
                        bottom: computed.bottom,
                        zIndex: computed.zIndex
                    });
                }
            });
            
            // Form element analysis
            const formElements = document.querySelectorAll('form, input, button, select, textarea');
            formElements.forEach(el => {
                const computed = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                results.forms.push({
                    tagName: el.tagName.toLowerCase(),
                    type: el.type || '',
                    className: el.className || '',
                    id: el.id || '',
                    position: {
                        top: Math.round(rect.top),
                        left: Math.round(rect.left),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    },
                    styling: {
                        backgroundColor: computed.backgroundColor,
                        borderColor: computed.borderColor,
                        borderWidth: computed.borderWidth,
                        borderRadius: computed.borderRadius,
                        fontSize: computed.fontSize,
                        fontFamily: computed.fontFamily,
                        padding: computed.padding
                    },
                    placeholder: el.placeholder || '',
                    value: el.value || ''
                });
            });
            
            // Convert Sets to Arrays for JSON serialization
            results.typography.uniqueFonts = Array.from(results.typography.uniqueFonts);
            results.typography.uniqueFontSizes = Array.from(results.typography.uniqueFontSizes);
            
            return results;
        });
        
        // Take screenshot for visual documentation
        console.log(`📸 Taking full-page screenshot...`);
        await page.screenshot({ 
            path: 'orig/_comprehensive-analysis-screenshot.png',
            fullPage: true 
        });
        
        // Generate summary
        analysisData.summary = {
            totalSections: analysisData.sections.length,
            backgroundSections: analysisData.backgrounds.length,
            typographyVariations: analysisData.typography.hierarchy.length,
            uniqueFonts: analysisData.typography.uniqueFonts.length,
            uniqueFontSizes: analysisData.typography.uniqueFontSizes.length,
            gridElements: analysisData.layout.gridElements.length,
            flexElements: analysisData.layout.flexElements.length,
            positionedElements: analysisData.layout.positionedElements.length,
            formElements: analysisData.forms.length
        };
        
        // Save complete analysis
        writeFileSync('orig/_comprehensive-analysis.json', JSON.stringify(analysisData, null, 2));
        
        // Create readable report
        const report = generateComprehensiveReport(analysisData);
        writeFileSync('orig/_comprehensive-report.md', report);
        
        console.log(`✅ Comprehensive analysis complete!`);
        console.log(`📊 Summary:`);
        console.log(`   • Sections detected: ${analysisData.summary.totalSections}`);
        console.log(`   • Background sections: ${analysisData.summary.backgroundSections}`);
        console.log(`   • Typography variations: ${analysisData.summary.typographyVariations}`);
        console.log(`   • Grid elements: ${analysisData.summary.gridElements}`);
        console.log(`   • Flex elements: ${analysisData.summary.flexElements}`);
        console.log(`   • Form elements: ${analysisData.summary.formElements}`);
        console.log(`📄 Full analysis: orig/_comprehensive-analysis.json`);
        console.log(`📋 Report: orig/_comprehensive-report.md`);
        console.log(`📸 Screenshot: orig/_comprehensive-analysis-screenshot.png`);
        
        return analysisData;
        
    } catch (error) {
        console.error('❌ Error during comprehensive analysis:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function generateComprehensiveReport(data) {
    let report = `# Comprehensive Site Analysis Report\n\n`;
    report += `**URL**: ${data.url}\n`;
    report += `**Analyzed**: ${data.extractedAt}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Sections Detected**: ${data.summary.totalSections}\n`;
    report += `- **Background Sections**: ${data.summary.backgroundSections}\n`;
    report += `- **Typography Variations**: ${data.summary.typographyVariations}\n`;
    report += `- **Grid Elements**: ${data.summary.gridElements}\n`;
    report += `- **Flex Elements**: ${data.summary.flexElements}\n`;
    report += `- **Form Elements**: ${data.summary.formElements}\n\n`;
    
    report += `## Section Analysis\n\n`;
    data.sections.forEach((section, index) => {
        report += `### ${section.type} ${section.index > 1 ? section.index : ''}\n`;
        report += `- **Selector**: \`${section.selector}\`\n`;
        report += `- **Position**: ${section.position.width}×${section.position.height} at (${section.position.left}, ${section.position.top})\n`;
        report += `- **Background**: ${section.styling.backgroundImage !== 'none' ? 'Has background image' : section.styling.backgroundColor}\n`;
        report += `- **Content**: ${section.content.textLength} characters, ${section.content.hasImages} images, ${section.content.hasLinks} links\n\n`;
    });
    
    report += `## Typography Hierarchy\n\n`;
    data.typography.hierarchy.forEach((typo, index) => {
        report += `**${index + 1}. ${typo.fontSize} / ${typo.fontWeight}**\n`;
        report += `- Font Family: ${typo.fontFamily}\n`;
        report += `- Line Height: ${typo.lineHeight}\n`;
        report += `- Used ${typo.count} times\n`;
        report += `- Common in: ${typo.tagName}\n`;
        if (typo.examples.length > 0) {
            report += `- Examples: "${typo.examples.join('", "')}"\n`;
        }
        report += `\n`;
    });
    
    if (data.layout.gridElements.length > 0) {
        report += `## CSS Grid Elements\n\n`;
        data.layout.gridElements.forEach((grid, index) => {
            report += `**Grid ${index + 1}**: ${grid.element}${grid.className ? '.' + grid.className : ''}\n`;
            report += `- Columns: ${grid.gridTemplateColumns}\n`;
            report += `- Rows: ${grid.gridTemplateRows}\n`;
            report += `- Gap: ${grid.gap}\n`;
            report += `- Size: ${grid.position.width}×${grid.position.height}\n\n`;
        });
    }
    
    if (data.backgrounds.length > 0) {
        report += `## Background Image Sections\n\n`;
        data.backgrounds.forEach((bg, index) => {
            report += `**Background ${index + 1}**: ${bg.element}${bg.className ? '.' + bg.className : ''}\n`;
            report += `- Size: ${bg.position.width}×${bg.position.height}\n`;
            report += `- Has Content: ${bg.hasContent ? 'Yes' : 'No'}\n`;
            if (bg.contentPreview) {
                report += `- Content Preview: "${bg.contentPreview}"\n`;
            }
            report += `\n`;
        });
    }
    
    // Add class name preservation guidance
    report += `\n## 🏗️ CRITICAL: Class Name Preservation for Recreation\n\n`;
    report += `**MANDATORY**: When recreating this site, preserve ALL original class names to prevent:\n`;
    report += `- ❌ Viewport adjustment confusion (can't identify elements for responsive changes)\n`;
    report += `- ❌ Maintenance nightmares (impossible to correlate CSS rules with elements)\n`;
    report += `- ❌ Team collaboration issues (other developers can't understand element context)\n\n`;
    
    report += `**Recreation Rules**:\n`;
    report += `1. Keep original class hierarchy: <div class="container-fluid px-4"> NOT <div class="main-container">\n`;
    report += `2. Preserve framework classes: navbar, nav-item, btn, etc.\n`;
    report += `3. Maintain utility classes: px-4, ms-auto, fw-bold, etc.\n`;
    report += `4. Use original classes for viewport adjustments: @media (max-width: 991px) { .navbar-expand-lg { ... } }\n\n`;
    
    report += `**Key Classes Found in This Site**:\n`;
    const classRegistry = new Set();
    
    // Collect unique classes from all analyzed elements
    if (data.sections) {
        data.sections.forEach(section => {
            if (section.content && section.content.className) {
                section.content.className.split(' ').forEach(cls => {
                    if (cls.trim()) classRegistry.add(cls.trim());
                });
            }
        });
    }
    
    if (data.grids) {
        data.grids.forEach(grid => {
            if (grid.className) {
                grid.className.split(' ').forEach(cls => {
                    if (cls.trim()) classRegistry.add(cls.trim());
                });
            }
        });
    }
    
    if (data.buttons) {
        data.buttons.forEach(button => {
            if (button.className) {
                button.className.split(' ').forEach(cls => {
                    if (cls.trim()) classRegistry.add(cls.trim());
                });
            }
        });
    }
    
    const sortedClasses = Array.from(classRegistry).sort();
    if (sortedClasses.length > 0) {
        report += `- Framework classes: ${sortedClasses.filter(cls => 
            cls.includes('navbar') || cls.includes('btn') || cls.includes('container') || 
            cls.includes('nav-') || cls.includes('col-') || cls.includes('row')
        ).join(', ')}\n`;
        
        report += `- Utility classes: ${sortedClasses.filter(cls => 
            cls.match(/^(p|m|w|h|d|text|bg|border|rounded|shadow)-/) ||
            cls.match(/^(px|py|mx|my|ms|me|fs|fw|lh)-/) ||
            cls.includes('auto') || cls.includes('center')
        ).join(', ')}\n`;
        
        report += `- Custom classes: ${sortedClasses.filter(cls => 
            !cls.includes('navbar') && !cls.includes('btn') && !cls.includes('container') && 
            !cls.includes('nav-') && !cls.includes('col-') && !cls.includes('row') &&
            !cls.match(/^(p|m|w|h|d|text|bg|border|rounded|shadow)-/) &&
            !cls.match(/^(px|py|mx|my|ms|me|fs|fw|lh)-/) &&
            !cls.includes('auto') && !cls.includes('center')
        ).slice(0, 10).join(', ')}\n`;
    }
    
    report += `\n**REMEMBER**: These class names are your blueprint for viewport adjustments and ongoing maintenance!\n\n`;
    
    return report;
}

// Command line usage
const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: node comprehensive-site-analyzer.js <url>');
    console.error('   Example: node comprehensive-site-analyzer.js https://example.com');
    console.error('   🚨 CRITICAL: This tool captures class names for recreation - preserve them!');
    process.exit(1);
}

// Validate URL
try {
    new URL(url);
} catch (error) {
    console.error('❌ Invalid URL provided');
    process.exit(1);
}

comprehensiveSiteAnalysis(url).catch(error => {
    console.error('❌ Failed to perform comprehensive analysis:', error.message);
    process.exit(1);
});