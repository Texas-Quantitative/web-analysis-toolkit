#!/usr/bin/env node
/**
 * Multi-Breakpoint Responsive Analysis Tool
 * Analyzes responsive behavior patterns across multiple viewport sizes
 * 
 * Usage: node tools/analyze-responsive.mjs <url>
 * Example: node tools/analyze-responsive.mjs https://example.com
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// Ensure orig directory exists
if (!existsSync('orig')) {
    mkdirSync('orig');
}

// Standard breakpoints for analysis
const BREAKPOINTS = [
    { name: 'mobile', width: 375, height: 667 },      // iPhone 6/7/8
    { name: 'mobile-lg', width: 414, height: 896 },   // iPhone XR
    { name: 'tablet', width: 768, height: 1024 },     // iPad portrait
    { name: 'tablet-lg', width: 1024, height: 768 },  // iPad landscape
    { name: 'desktop-sm', width: 1200, height: 800 }, // Small desktop
    { name: 'desktop', width: 1440, height: 900 },    // Standard desktop
    { name: 'desktop-lg', width: 1920, height: 1080 } // Large desktop
];

async function analyzeResponsiveBehavior(url) {
    console.log(`🔍 Analyzing responsive behavior for ${url}`);
    console.log(`📱 Testing ${BREAKPOINTS.length} breakpoints`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const analysisData = {
            url: url,
            extractedAt: new Date().toISOString(),
            breakpoints: [],
            responsivePatterns: {
                heightChanges: [],
                widthBehavior: [],
                layoutTransformations: [],
                contentReorganization: []
            },
            summary: {}
        };
        
        for (let i = 0; i < BREAKPOINTS.length; i++) {
            const breakpoint = BREAKPOINTS[i];
            console.log(`📐 Analyzing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
            
            const page = await browser.newPage();
            
            try {
                // Set viewport
                await page.setViewport({ 
                    width: breakpoint.width, 
                    height: breakpoint.height 
                });
                
                // Navigate to page
                await page.goto(url, { 
                    waitUntil: 'networkidle2',
                    timeout: 30000 
                });
                
                // Wait for dynamic content and layout settling
                await page.waitForTimeout(3000);
                
                // Extract responsive data
                const breakpointData = await page.evaluate((bpName, bpWidth, bpHeight) => {
                    const data = {
                        breakpoint: bpName,
                        viewport: { width: bpWidth, height: bpHeight },
                        actualViewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        documentDimensions: {
                            scrollWidth: document.documentElement.scrollWidth,
                            scrollHeight: document.documentElement.scrollHeight,
                            clientWidth: document.documentElement.clientWidth,
                            clientHeight: document.documentElement.clientHeight
                        },
                        bodyDimensions: {
                            scrollWidth: document.body.scrollWidth,
                            scrollHeight: document.body.scrollHeight,
                            clientWidth: document.body.clientWidth,
                            clientHeight: document.body.clientHeight
                        },
                        layoutAnalysis: {
                            containerElements: [],
                            gridElements: [],
                            flexElements: [],
                            mediaQueries: []
                        }
                    };
                    
                    // Analyze key container elements
                    const containers = document.querySelectorAll('div, section, main, article, header, footer');
                    containers.forEach((el, index) => {
                        if (index > 50) return; // Limit to prevent performance issues
                        
                        const computed = window.getComputedStyle(el);
                        const rect = el.getBoundingClientRect();
                        
                        // Only analyze significant elements
                        if (rect.width > 100 || rect.height > 100) {
                            data.layoutAnalysis.containerElements.push({
                                tagName: el.tagName.toLowerCase(),
                                className: el.className || '',
                                id: el.id || '',
                                dimensions: {
                                    width: Math.round(rect.width),
                                    height: Math.round(rect.height),
                                    top: Math.round(rect.top),
                                    left: Math.round(rect.left)
                                },
                                computedStyles: {
                                    display: computed.display,
                                    position: computed.position,
                                    width: computed.width,
                                    height: computed.height,
                                    maxWidth: computed.maxWidth,
                                    minWidth: computed.minWidth,
                                    margin: computed.margin,
                                    padding: computed.padding,
                                    flexDirection: computed.flexDirection,
                                    justifyContent: computed.justifyContent,
                                    alignItems: computed.alignItems,
                                    gridTemplateColumns: computed.gridTemplateColumns,
                                    gridTemplateRows: computed.gridTemplateRows
                                }
                            });
                        }
                    });
                    
                    // Find CSS Grid elements
                    const gridElements = document.querySelectorAll('*');
                    gridElements.forEach(el => {
                        const computed = window.getComputedStyle(el);
                        if (computed.display === 'grid') {
                            data.layoutAnalysis.gridElements.push({
                                tagName: el.tagName.toLowerCase(),
                                className: el.className || '',
                                gridTemplateColumns: computed.gridTemplateColumns,
                                gridTemplateRows: computed.gridTemplateRows,
                                gap: computed.gap
                            });
                        }
                        if (computed.display === 'flex') {
                            data.layoutAnalysis.flexElements.push({
                                tagName: el.tagName.toLowerCase(),
                                className: el.className || '',
                                flexDirection: computed.flexDirection,
                                justifyContent: computed.justifyContent,
                                alignItems: computed.alignItems,
                                flexWrap: computed.flexWrap
                            });
                        }
                    });
                    
                    return data;
                }, breakpoint.name, breakpoint.width, breakpoint.height);
                
                analysisData.breakpoints.push(breakpointData);
                
                // Add delay between breakpoints
                await page.waitForTimeout(1000);
                
            } catch (error) {
                console.error(`❌ Error analyzing ${breakpoint.name}:`, error.message);
            } finally {
                await page.close();
            }
        }
        
        // Analyze responsive patterns
        analyzeResponsivePatterns(analysisData);
        
        // Generate summary
        generateResponsiveSummary(analysisData);
        
        // Save complete analysis
        writeFileSync('orig/_responsive-analysis.json', JSON.stringify(analysisData, null, 2));
        
        // Create simplified report
        const report = createResponsiveReport(analysisData);
        writeFileSync('orig/_responsive-report.md', report);
        
        console.log(`✅ Responsive analysis complete!`);
        console.log(`📊 Summary:`);
        console.log(`   • Breakpoints analyzed: ${analysisData.breakpoints.length}`);
        console.log(`   • Height changes: ${analysisData.responsivePatterns.heightChanges.length}`);
        console.log(`   • Layout transformations: ${analysisData.responsivePatterns.layoutTransformations.length}`);
        console.log(`📄 Full analysis: orig/_responsive-analysis.json`);
        console.log(`📋 Report: orig/_responsive-report.md`);
        
        return analysisData;
        
    } catch (error) {
        console.error('❌ Error during responsive analysis:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

function analyzeResponsivePatterns(data) {
    const breakpoints = data.breakpoints;
    
    // Analyze height changes
    for (let i = 1; i < breakpoints.length; i++) {
        const prev = breakpoints[i-1];
        const curr = breakpoints[i];
        
        const heightChange = {
            from: prev.breakpoint,
            to: curr.breakpoint,
            documentHeight: {
                from: prev.documentDimensions.scrollHeight,
                to: curr.documentDimensions.scrollHeight,
                change: curr.documentDimensions.scrollHeight - prev.documentDimensions.scrollHeight,
                percentChange: ((curr.documentDimensions.scrollHeight - prev.documentDimensions.scrollHeight) / prev.documentDimensions.scrollHeight * 100).toFixed(1)
            },
            bodyHeight: {
                from: prev.bodyDimensions.scrollHeight,
                to: curr.bodyDimensions.scrollHeight,
                change: curr.bodyDimensions.scrollHeight - prev.bodyDimensions.scrollHeight,
                percentChange: ((curr.bodyDimensions.scrollHeight - prev.bodyDimensions.scrollHeight) / prev.bodyDimensions.scrollHeight * 100).toFixed(1)
            }
        };
        
        data.responsivePatterns.heightChanges.push(heightChange);
    }
    
    // Analyze layout transformations
    breakpoints.forEach(bp => {
        const gridCount = bp.layoutAnalysis.gridElements.length;
        const flexCount = bp.layoutAnalysis.flexElements.length;
        const containerCount = bp.layoutAnalysis.containerElements.length;
        
        data.responsivePatterns.layoutTransformations.push({
            breakpoint: bp.breakpoint,
            viewport: bp.viewport,
            layoutCounts: {
                gridElements: gridCount,
                flexElements: flexCount,
                containers: containerCount
            }
        });
    });
}

function generateResponsiveSummary(data) {
    const breakpoints = data.breakpoints;
    
    if (breakpoints.length === 0) {
        data.summary = { error: 'No breakpoints analyzed' };
        return;
    }
    
    const mobile = breakpoints.find(bp => bp.breakpoint === 'mobile');
    const desktop = breakpoints.find(bp => bp.breakpoint === 'desktop');
    
    if (mobile && desktop) {
        const heightCompression = ((desktop.documentDimensions.scrollHeight / mobile.documentDimensions.scrollHeight) * 100).toFixed(1);
        
        data.summary = {
            totalBreakpoints: breakpoints.length,
            heightCompression: {
                mobile: mobile.documentDimensions.scrollHeight,
                desktop: desktop.documentDimensions.scrollHeight,
                compressionRatio: `${heightCompression}%`,
                pixelReduction: mobile.documentDimensions.scrollHeight - desktop.documentDimensions.scrollHeight
            },
            significantChanges: data.responsivePatterns.heightChanges.filter(change => 
                Math.abs(parseFloat(change.documentHeight.percentChange)) > 10
            ),
            layoutMethodDistribution: calculateLayoutDistribution(data.responsivePatterns.layoutTransformations)
        };
    }
}

function calculateLayoutDistribution(transformations) {
    const distribution = {};
    
    transformations.forEach(t => {
        distribution[t.breakpoint] = {
            grid: t.layoutCounts.gridElements,
            flex: t.layoutCounts.flexElements,
            containers: t.layoutCounts.containers
        };
    });
    
    return distribution;
}

function createResponsiveReport(data) {
    let report = `# Responsive Analysis Report\n\n`;
    report += `**URL**: ${data.url}\n`;
    report += `**Analyzed**: ${data.extractedAt}\n\n`;
    
    report += `## Summary\n\n`;
    if (data.summary.heightCompression) {
        report += `- **Height Compression**: ${data.summary.heightCompression.mobile}px (mobile) → ${data.summary.heightCompression.desktop}px (desktop) = ${data.summary.heightCompression.compressionRatio}\n`;
        report += `- **Pixel Reduction**: ${data.summary.heightCompression.pixelReduction}px less content height on desktop\n`;
    }
    report += `- **Breakpoints Analyzed**: ${data.summary.totalBreakpoints}\n`;
    report += `- **Significant Changes**: ${data.summary.significantChanges?.length || 0}\n\n`;
    
    report += `## Breakpoint Analysis\n\n`;
    data.breakpoints.forEach(bp => {
        report += `### ${bp.breakpoint.toUpperCase()} (${bp.viewport.width}x${bp.viewport.height})\n`;
        report += `- Document Height: ${bp.documentDimensions.scrollHeight}px\n`;
        report += `- Body Height: ${bp.bodyDimensions.scrollHeight}px\n`;
        report += `- Grid Elements: ${bp.layoutAnalysis.gridElements.length}\n`;
        report += `- Flex Elements: ${bp.layoutAnalysis.flexElements.length}\n`;
        report += `- Container Elements: ${bp.layoutAnalysis.containerElements.length}\n\n`;
    });
    
    report += `## Height Changes Between Breakpoints\n\n`;
    data.responsivePatterns.heightChanges.forEach(change => {
        report += `**${change.from} → ${change.to}**\n`;
        report += `- Document: ${change.documentHeight.from}px → ${change.documentHeight.to}px (${change.documentHeight.percentChange}%)\n`;
        report += `- Body: ${change.bodyHeight.from}px → ${change.bodyHeight.to}px (${change.bodyHeight.percentChange}%)\n\n`;
    });
    
    report += `## Key Insights\n\n`;
    report += `- Modern responsive sites require cross-breakpoint analysis\n`;
    report += `- Static CSS extraction misses layout transformation patterns\n`;
    report += `- Content height can vary dramatically across viewport sizes\n`;
    report += `- Layout methods (Grid/Flex) may change at different breakpoints\n\n`;
    
    return report;
}

// Command line usage
const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: node analyze-responsive.mjs <url>');
    console.error('   Example: node analyze-responsive.mjs https://example.com');
    process.exit(1);
}

// Validate URL
try {
    new URL(url);
} catch (error) {
    console.error('❌ Invalid URL provided');
    process.exit(1);
}

analyzeResponsiveBehavior(url).catch(error => {
    console.error('❌ Failed to analyze responsive behavior:', error.message);
    process.exit(1);
});