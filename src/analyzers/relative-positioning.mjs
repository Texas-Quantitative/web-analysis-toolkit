#!/usr/bin/env node
/**
 * Relative Positioning Calculator
 * Calculates exact pixel positions, gaps between elements, negative margins, and overlaps within containers
 * 
 * Usage: node src/analyzers/relative-positioning.mjs <url> <container-selector>
 * Example: node src/analyzers/relative-positioning.mjs https://example.com ".hero-section"
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Ensure output directories exist
const ensureDirectories = () => {
    const dirs = ['analysis', 'analysis/relative-positioning', 'analysis/screenshots'];
    dirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    });
};

async function analyzeRelativePositioning(url, containerSelector, viewport = { width: 1440, height: 900 }) {
    console.log(`📐 Analyzing relative positioning for ${url}`);
    console.log(`📦 Container: ${containerSelector}`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        await page.setViewport(viewport);
        
        console.log(`📥 Loading page...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`🔍 Analyzing positioning within container...`);
        
        const positioningData = await page.evaluate((selector) => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                container: null,
                children: [],
                relationships: {
                    verticalGaps: [],
                    horizontalGaps: [],
                    overlaps: [],
                    negativeMargins: [],
                    centerAlignments: []
                }
            };
            
            // Find the container
            const container = document.querySelector(selector);
            
            if (!container) {
                return {
                    error: `Container not found: ${selector}`,
                    ...results
                };
            }
            
            const containerRect = container.getBoundingClientRect();
            const containerStyle = window.getComputedStyle(container);
            
            results.container = {
                selector,
                position: {
                    top: containerRect.top,
                    left: containerRect.left,
                    right: containerRect.right,
                    bottom: containerRect.bottom,
                    width: containerRect.width,
                    height: containerRect.height,
                    centerX: containerRect.left + (containerRect.width / 2),
                    centerY: containerRect.top + (containerRect.height / 2)
                },
                styles: {
                    position: containerStyle.position,
                    display: containerStyle.display,
                    padding: containerStyle.padding,
                    paddingTop: containerStyle.paddingTop,
                    paddingRight: containerStyle.paddingRight,
                    paddingBottom: containerStyle.paddingBottom,
                    paddingLeft: containerStyle.paddingLeft,
                    boxSizing: containerStyle.boxSizing
                }
            };
            
            // Get all children (direct and nested)
            const allChildren = Array.from(container.querySelectorAll('*'));
            
            // Filter to visible, meaningful elements
            const meaningfulChildren = allChildren.filter(child => {
                const style = window.getComputedStyle(child);
                const rect = child.getBoundingClientRect();
                
                // Skip if hidden or has no dimensions
                if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
                    return false;
                }
                
                // Include if it's a direct child or has meaningful content
                return child.parentElement === container || 
                       child.tagName.match(/^(IMG|H[1-6]|P|BUTTON|A|INPUT|FORM|NAV|SECTION|ARTICLE|DIV)$/);
            });
            
            // Analyze each child
            meaningfulChildren.forEach((child, index) => {
                const rect = child.getBoundingClientRect();
                const style = window.getComputedStyle(child);
                
                // Calculate position relative to container
                const relativePosition = {
                    top: rect.top - containerRect.top,
                    left: rect.left - containerRect.left,
                    right: containerRect.right - rect.right,
                    bottom: containerRect.bottom - rect.bottom,
                    centerX: (rect.left + rect.width / 2) - (containerRect.left + containerRect.width / 2),
                    centerY: (rect.top + rect.height / 2) - (containerRect.top + containerRect.height / 2)
                };
                
                // Parse margin values
                const marginTop = parseFloat(style.marginTop);
                const marginRight = parseFloat(style.marginRight);
                const marginBottom = parseFloat(style.marginBottom);
                const marginLeft = parseFloat(style.marginLeft);
                
                // Detect negative margins
                if (marginTop < 0 || marginRight < 0 || marginBottom < 0 || marginLeft < 0) {
                    results.relationships.negativeMargins.push({
                        element: index,
                        selector: child.className ? `.${child.className.split(' ')[0]}` : child.tagName.toLowerCase(),
                        margins: {
                            top: marginTop,
                            right: marginRight,
                            bottom: marginBottom,
                            left: marginLeft
                        }
                    });
                }
                
                // Check for center alignment
                const horizontalCenterThreshold = 5; // pixels
                const verticalCenterThreshold = 5;
                
                if (Math.abs(relativePosition.centerX) < horizontalCenterThreshold) {
                    results.relationships.centerAlignments.push({
                        element: index,
                        selector: child.className ? `.${child.className.split(' ')[0]}` : child.tagName.toLowerCase(),
                        type: 'horizontal',
                        offset: relativePosition.centerX.toFixed(2)
                    });
                }
                
                if (Math.abs(relativePosition.centerY) < verticalCenterThreshold) {
                    results.relationships.centerAlignments.push({
                        element: index,
                        selector: child.className ? `.${child.className.split(' ')[0]}` : child.tagName.toLowerCase(),
                        type: 'vertical',
                        offset: relativePosition.centerY.toFixed(2)
                    });
                }
                
                results.children.push({
                    index,
                    tagName: child.tagName.toLowerCase(),
                    selector: child.className ? `.${child.className.split(' ')[0]}` : child.tagName.toLowerCase(),
                    id: child.id,
                    text: child.textContent?.trim().substring(0, 100),
                    absolutePosition: {
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height
                    },
                    relativePosition,
                    styles: {
                        position: style.position,
                        display: style.display,
                        margin: style.margin,
                        marginTop: style.marginTop,
                        marginRight: style.marginRight,
                        marginBottom: style.marginBottom,
                        marginLeft: style.marginLeft,
                        padding: style.padding,
                        top: style.top,
                        left: style.left,
                        right: style.right,
                        bottom: style.bottom,
                        transform: style.transform,
                        float: style.float,
                        zIndex: style.zIndex
                    }
                });
            });
            
            // Calculate gaps between adjacent elements (vertically)
            for (let i = 0; i < results.children.length - 1; i++) {
                const current = results.children[i];
                const next = results.children[i + 1];
                
                // Check if they're vertically adjacent (next element is below current)
                if (next.absolutePosition.top >= current.absolutePosition.bottom - 5) {
                    const gap = next.absolutePosition.top - current.absolutePosition.bottom;
                    
                    results.relationships.verticalGaps.push({
                        between: [i, i + 1],
                        elements: [current.selector, next.selector],
                        gap: parseFloat(gap.toFixed(2)),
                        currentBottom: current.absolutePosition.bottom,
                        nextTop: next.absolutePosition.top,
                        currentMarginBottom: current.styles.marginBottom,
                        nextMarginTop: next.styles.marginTop
                    });
                }
                
                // Check for overlaps (negative gap)
                if (next.absolutePosition.top < current.absolutePosition.bottom) {
                    const overlap = current.absolutePosition.bottom - next.absolutePosition.top;
                    
                    results.relationships.overlaps.push({
                        between: [i, i + 1],
                        elements: [current.selector, next.selector],
                        overlap: parseFloat(overlap.toFixed(2)),
                        type: 'vertical',
                        currentBottom: current.absolutePosition.bottom,
                        nextTop: next.absolutePosition.top
                    });
                }
            }
            
            // Calculate horizontal gaps (for elements on same row)
            for (let i = 0; i < results.children.length; i++) {
                for (let j = i + 1; j < results.children.length; j++) {
                    const left = results.children[i];
                    const right = results.children[j];
                    
                    // Check if they're horizontally adjacent (same vertical range)
                    const verticalOverlap = Math.min(left.absolutePosition.bottom, right.absolutePosition.bottom) -
                                          Math.max(left.absolutePosition.top, right.absolutePosition.top);
                    
                    if (verticalOverlap > 10) { // At least 10px vertical overlap = same row
                        // Check if right element is to the right of left element
                        if (right.absolutePosition.left >= left.absolutePosition.right - 5) {
                            const gap = right.absolutePosition.left - left.absolutePosition.right;
                            
                            results.relationships.horizontalGaps.push({
                                between: [i, j],
                                elements: [left.selector, right.selector],
                                gap: parseFloat(gap.toFixed(2)),
                                leftRight: left.absolutePosition.right,
                                rightLeft: right.absolutePosition.left
                            });
                        }
                        
                        // Check for horizontal overlaps
                        if (right.absolutePosition.left < left.absolutePosition.right) {
                            const overlap = left.absolutePosition.right - right.absolutePosition.left;
                            
                            results.relationships.overlaps.push({
                                between: [i, j],
                                elements: [left.selector, right.selector],
                                overlap: parseFloat(overlap.toFixed(2)),
                                type: 'horizontal'
                            });
                        }
                    }
                }
            }
            
            return results;
        }, containerSelector);
        
        // Take screenshot with container highlighted
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const urlSlug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 50);
        const screenshotPath = `analysis/screenshots/${timestamp}-${urlSlug}-positioning.png`;
        
        // Highlight the container
        await page.evaluate((selector) => {
            const container = document.querySelector(selector);
            if (container) {
                container.style.outline = '3px solid red';
                
                // Highlight children
                const children = container.querySelectorAll('*');
                children.forEach((child, index) => {
                    const style = window.getComputedStyle(child);
                    if (style.display !== 'none' && style.visibility !== 'hidden') {
                        child.style.outline = '1px solid blue';
                    }
                });
            }
        }, containerSelector);
        
        console.log(`📸 Taking screenshot...`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        
        positioningData.screenshot = screenshotPath;
        
        // Save results
        const outputPath = `analysis/relative-positioning/${timestamp}-${urlSlug}-positioning.json`;
        console.log(`💾 Saving analysis to ${outputPath}`);
        writeFileSync(outputPath, JSON.stringify(positioningData, null, 2));
        
        // Generate human-readable report
        const report = generateReport(positioningData);
        const reportPath = `analysis/relative-positioning/${timestamp}-${urlSlug}-positioning.md`;
        writeFileSync(reportPath, report);
        
        console.log(`✅ Analysis complete!`);
        console.log(`📄 JSON: ${outputPath}`);
        console.log(`📄 Report: ${reportPath}`);
        console.log(`📸 Screenshot: ${screenshotPath}`);
        
        return positioningData;
        
    } finally {
        await browser.close();
    }
}

function generateReport(data) {
    let report = `# Relative Positioning Analysis Report\n\n`;
    report += `**URL:** ${data.url}\n`;
    report += `**Analyzed:** ${new Date(data.extractedAt).toLocaleString()}\n`;
    report += `**Viewport:** ${data.viewport.width} × ${data.viewport.height}\n\n`;
    
    if (data.error) {
        report += `## ❌ Error\n\n${data.error}\n\n`;
        return report;
    }
    
    report += `## Container: \`${data.container.selector}\`\n\n`;
    report += `### Position\n`;
    report += `- **Top:** ${data.container.position.top.toFixed(1)}px\n`;
    report += `- **Left:** ${data.container.position.left.toFixed(1)}px\n`;
    report += `- **Width:** ${data.container.position.width.toFixed(1)}px\n`;
    report += `- **Height:** ${data.container.position.height.toFixed(1)}px\n`;
    report += `- **Center:** (${data.container.position.centerX.toFixed(1)}px, ${data.container.position.centerY.toFixed(1)}px)\n\n`;
    
    report += `### Styles\n`;
    report += `- **Position:** ${data.container.styles.position}\n`;
    report += `- **Display:** ${data.container.styles.display}\n`;
    report += `- **Padding:** ${data.container.styles.padding}\n`;
    report += `- **Box Sizing:** ${data.container.styles.boxSizing}\n\n`;
    
    report += `## Children Elements (${data.children.length})\n\n`;
    
    // Create table
    report += `| Index | Element | Selector | Top (rel) | Left (rel) | Width | Height |\n`;
    report += `|-------|---------|----------|-----------|------------|-------|--------|\n`;
    
    data.children.forEach(child => {
        report += `| ${child.index} | ${child.tagName} | \`${child.selector}\` | ${child.relativePosition.top.toFixed(1)}px | ${child.relativePosition.left.toFixed(1)}px | ${child.absolutePosition.width.toFixed(1)}px | ${child.absolutePosition.height.toFixed(1)}px |\n`;
    });
    
    report += `\n`;
    
    // Detailed positioning
    report += `## Detailed Element Positioning\n\n`;
    data.children.forEach(child => {
        report += `### ${child.index}. ${child.tagName.toUpperCase()} - \`${child.selector}\`\n\n`;
        if (child.text) {
            report += `**Text:** "${child.text}"\n\n`;
        }
        report += `**Relative to Container:**\n`;
        report += `- **Top:** ${child.relativePosition.top.toFixed(1)}px from container top\n`;
        report += `- **Left:** ${child.relativePosition.left.toFixed(1)}px from container left\n`;
        report += `- **Right:** ${child.relativePosition.right.toFixed(1)}px from container right\n`;
        report += `- **Bottom:** ${child.relativePosition.bottom.toFixed(1)}px from container bottom\n`;
        report += `- **Center Offset (H):** ${child.relativePosition.centerX.toFixed(2)}px\n`;
        report += `- **Center Offset (V):** ${child.relativePosition.centerY.toFixed(2)}px\n\n`;
        
        report += `**Positioning Styles:**\n`;
        report += `- **Position:** ${child.styles.position}\n`;
        report += `- **Display:** ${child.styles.display}\n`;
        report += `- **Margin:** ${child.styles.margin}\n`;
        if (child.styles.position !== 'static') {
            report += `- **Top:** ${child.styles.top}\n`;
            report += `- **Left:** ${child.styles.left}\n`;
            report += `- **Right:** ${child.styles.right}\n`;
            report += `- **Bottom:** ${child.styles.bottom}\n`;
        }
        if (child.styles.transform !== 'none') {
            report += `- **Transform:** ${child.styles.transform}\n`;
        }
        if (child.styles.float !== 'none') {
            report += `- **Float:** ${child.styles.float}\n`;
        }
        if (child.styles.zIndex !== 'auto') {
            report += `- **Z-Index:** ${child.styles.zIndex}\n`;
        }
        report += `\n`;
    });
    
    // Relationships
    report += `## Element Relationships\n\n`;
    
    // Vertical gaps
    report += `### Vertical Gaps (${data.relationships.verticalGaps.length})\n\n`;
    if (data.relationships.verticalGaps.length > 0) {
        report += `| Between | Elements | Gap | Calculation |\n`;
        report += `|---------|----------|-----|-------------|\n`;
        data.relationships.verticalGaps.forEach(gap => {
            const calc = `${gap.nextTop.toFixed(1)} - ${gap.currentBottom.toFixed(1)}`;
            report += `| ${gap.between[0]} → ${gap.between[1]} | \`${gap.elements[0]}\` → \`${gap.elements[1]}\` | **${gap.gap}px** | ${calc} |\n`;
        });
        report += `\n`;
    } else {
        report += `*No vertical gaps detected*\n\n`;
    }
    
    // Horizontal gaps
    report += `### Horizontal Gaps (${data.relationships.horizontalGaps.length})\n\n`;
    if (data.relationships.horizontalGaps.length > 0) {
        report += `| Between | Elements | Gap |\n`;
        report += `|---------|----------|-----|\n`;
        data.relationships.horizontalGaps.forEach(gap => {
            report += `| ${gap.between[0]} ↔ ${gap.between[1]} | \`${gap.elements[0]}\` ↔ \`${gap.elements[1]}\` | **${gap.gap}px** |\n`;
        });
        report += `\n`;
    } else {
        report += `*No horizontal gaps detected*\n\n`;
    }
    
    // Overlaps
    report += `### Overlaps (${data.relationships.overlaps.length})\n\n`;
    if (data.relationships.overlaps.length > 0) {
        report += `| Between | Elements | Overlap | Type |\n`;
        report += `|---------|----------|---------|------|\n`;
        data.relationships.overlaps.forEach(overlap => {
            report += `| ${overlap.between[0]} ⚠ ${overlap.between[1]} | \`${overlap.elements[0]}\` ⚠ \`${overlap.elements[1]}\` | **${overlap.overlap}px** | ${overlap.type} |\n`;
        });
        report += `\n`;
    } else {
        report += `*No overlaps detected*\n\n`;
    }
    
    // Negative margins
    report += `### Negative Margins (${data.relationships.negativeMargins.length})\n\n`;
    if (data.relationships.negativeMargins.length > 0) {
        data.relationships.negativeMargins.forEach(nm => {
            report += `#### Element ${nm.element}: \`${nm.selector}\`\n\n`;
            if (nm.margins.top < 0) report += `- **Margin Top:** ${nm.margins.top}px\n`;
            if (nm.margins.right < 0) report += `- **Margin Right:** ${nm.margins.right}px\n`;
            if (nm.margins.bottom < 0) report += `- **Margin Bottom:** ${nm.margins.bottom}px\n`;
            if (nm.margins.left < 0) report += `- **Margin Left:** ${nm.margins.left}px\n`;
            report += `\n`;
        });
    } else {
        report += `*No negative margins detected*\n\n`;
    }
    
    // Center alignments
    report += `### Center Alignments (${data.relationships.centerAlignments.length})\n\n`;
    if (data.relationships.centerAlignments.length > 0) {
        const horizontal = data.relationships.centerAlignments.filter(c => c.type === 'horizontal');
        const vertical = data.relationships.centerAlignments.filter(c => c.type === 'vertical');
        
        if (horizontal.length > 0) {
            report += `**Horizontally Centered:**\n`;
            horizontal.forEach(c => {
                report += `- Element ${c.element} (\`${c.selector}\`) - offset: ${c.offset}px\n`;
            });
            report += `\n`;
        }
        
        if (vertical.length > 0) {
            report += `**Vertically Centered:**\n`;
            vertical.forEach(c => {
                report += `- Element ${c.element} (\`${c.selector}\`) - offset: ${c.offset}px\n`;
            });
            report += `\n`;
        }
    } else {
        report += `*No center-aligned elements detected*\n\n`;
    }
    
    report += `## Screenshot\n\n`;
    report += `![Positioning Analysis](../../${data.screenshot})\n\n`;
    report += `*Container outlined in red, children in blue*\n`;
    
    return report;
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')) {
    const url = process.argv[2];
    const containerSelector = process.argv[3];
    
    if (!url || !containerSelector) {
        console.error('Usage: node relative-positioning.mjs <url> <container-selector>');
        console.error('Example: node relative-positioning.mjs https://example.com ".hero-section"');
        process.exit(1);
    }
    
    ensureDirectories();
    
    analyzeRelativePositioning(url, containerSelector)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

export { analyzeRelativePositioning };
