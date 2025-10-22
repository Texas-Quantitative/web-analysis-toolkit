#!/usr/bin/env node
/**
 * Interactive Element State Analyzer
 * Analyzes elements that change on interaction (hover, focus, click, toggle)
 * 
 * Usage: node src/analyzers/interactive-states.mjs <url> [selectors]
 * Example: node src/analyzers/interactive-states.mjs https://example.com "button, .btn, a"
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Ensure output directories exist
const ensureDirectories = () => {
    const dirs = ['analysis', 'analysis/interactive-states', 'analysis/screenshots'];
    dirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    });
};

async function analyzeInteractiveStates(url, customSelectors = null) {
    console.log(`🖱️  Analyzing interactive element states for ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log(`📥 Loading page...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Define default interactive element patterns
        const defaultSelectors = [
            'button',
            'a',
            'input',
            'textarea',
            'select',
            '.btn',
            '[role="button"]',
            '.card',
            '.accordion',
            '.dropdown',
            '.tab',
            '[data-toggle]'
        ];
        
        const selectors = customSelectors ? customSelectors.split(',').map(s => s.trim()) : defaultSelectors;
        
        console.log(`🔍 Analyzing interactive states for: ${selectors.join(', ')}`);
        
        // Analyze default states
        const defaultStates = await page.evaluate((selectorList) => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                elements: []
            };
            
            selectorList.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    
                    elements.forEach((element, index) => {
                        const style = window.getComputedStyle(element);
                        const rect = element.getBoundingClientRect();
                        
                        // Skip hidden elements
                        if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0) {
                            return;
                        }
                        
                        const elementId = element.id || `${selector}-${index}`;
                        
                        results.elements.push({
                            selector,
                            index,
                            id: elementId,
                            tagName: element.tagName.toLowerCase(),
                            text: element.textContent?.trim().substring(0, 100),
                            classes: Array.from(element.classList),
                            position: {
                                top: rect.top,
                                left: rect.left,
                                width: rect.width,
                                height: rect.height
                            },
                            defaultState: {
                                // Visual
                                color: style.color,
                                backgroundColor: style.backgroundColor,
                                borderColor: style.borderColor,
                                borderWidth: style.borderWidth,
                                borderStyle: style.borderStyle,
                                borderRadius: style.borderRadius,
                                boxShadow: style.boxShadow,
                                
                                // Typography
                                fontSize: style.fontSize,
                                fontWeight: style.fontWeight,
                                fontFamily: style.fontFamily,
                                textDecoration: style.textDecoration,
                                textTransform: style.textTransform,
                                
                                // Spacing
                                padding: style.padding,
                                margin: style.margin,
                                
                                // Transform & Animation
                                transform: style.transform,
                                transition: style.transition,
                                animation: style.animation,
                                
                                // Cursor
                                cursor: style.cursor,
                                
                                // Opacity
                                opacity: style.opacity,
                                
                                // Outline (for focus)
                                outline: style.outline,
                                outlineColor: style.outlineColor,
                                outlineWidth: style.outlineWidth,
                                outlineOffset: style.outlineOffset
                            },
                            attributes: {
                                href: element.getAttribute('href'),
                                type: element.getAttribute('type'),
                                disabled: element.disabled,
                                tabindex: element.getAttribute('tabindex'),
                                ariaLabel: element.getAttribute('aria-label'),
                                dataToggle: element.getAttribute('data-toggle'),
                                dataTarget: element.getAttribute('data-target')
                            }
                        });
                    });
                } catch (e) {
                    console.warn(`Error processing selector ${selector}:`, e.message);
                }
            });
            
            return results;
        }, selectors);
        
        console.log(`📊 Found ${defaultStates.elements.length} interactive elements`);
        
        // Analyze hover states (by injecting :hover styles)
        console.log(`🎨 Analyzing hover states...`);
        const hoverStates = await page.evaluate(() => {
            const results = [];
            
            // Get all stylesheets
            const styleSheets = Array.from(document.styleSheets);
            
            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    
                    rules.forEach(rule => {
                        if (rule.selectorText && rule.selectorText.includes(':hover')) {
                            const selector = rule.selectorText;
                            const baseSelector = selector.replace(':hover', '').trim();
                            
                            // Extract hover styles
                            const styles = {};
                            for (let i = 0; i < rule.style.length; i++) {
                                const prop = rule.style[i];
                                styles[prop] = rule.style.getPropertyValue(prop);
                            }
                            
                            results.push({
                                selector: baseSelector,
                                hoverSelector: selector,
                                hoverStyles: styles
                            });
                        }
                    });
                } catch (e) {
                    // CORS or other stylesheet access error
                }
            });
            
            return results;
        });
        
        // Analyze focus states
        console.log(`🎯 Analyzing focus states...`);
        const focusStates = await page.evaluate(() => {
            const results = [];
            
            const styleSheets = Array.from(document.styleSheets);
            
            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    
                    rules.forEach(rule => {
                        if (rule.selectorText && rule.selectorText.includes(':focus')) {
                            const selector = rule.selectorText;
                            const baseSelector = selector.replace(':focus', '').replace(':focus-visible', '').trim();
                            
                            const styles = {};
                            for (let i = 0; i < rule.style.length; i++) {
                                const prop = rule.style[i];
                                styles[prop] = rule.style.getPropertyValue(prop);
                            }
                            
                            results.push({
                                selector: baseSelector,
                                focusSelector: selector,
                                focusStyles: styles
                            });
                        }
                    });
                } catch (e) {
                    // CORS error
                }
            });
            
            return results;
        });
        
        // Analyze active/pressed states
        console.log(`👆 Analyzing active/pressed states...`);
        const activeStates = await page.evaluate(() => {
            const results = [];
            
            const styleSheets = Array.from(document.styleSheets);
            
            styleSheets.forEach(sheet => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    
                    rules.forEach(rule => {
                        if (rule.selectorText && rule.selectorText.includes(':active')) {
                            const selector = rule.selectorText;
                            const baseSelector = selector.replace(':active', '').trim();
                            
                            const styles = {};
                            for (let i = 0; i < rule.style.length; i++) {
                                const prop = rule.style[i];
                                styles[prop] = rule.style.getPropertyValue(prop);
                            }
                            
                            results.push({
                                selector: baseSelector,
                                activeSelector: selector,
                                activeStyles: styles
                            });
                        }
                    });
                } catch (e) {
                    // CORS error
                }
            });
            
            return results;
        });
        
        // Try to interact with toggle elements (accordions, dropdowns, tabs)
        console.log(`🔄 Analyzing toggle states...`);
        const toggleElements = await page.evaluate(() => {
            const results = [];
            
            // Find accordion elements
            const accordions = document.querySelectorAll('[data-toggle="collapse"], .accordion-button, .accordion-header');
            accordions.forEach((accordion, index) => {
                const target = accordion.getAttribute('data-target') || accordion.getAttribute('href');
                const style = window.getComputedStyle(accordion);
                
                results.push({
                    type: 'accordion',
                    index,
                    selector: accordion.className ? `.${accordion.className.split(' ')[0]}` : accordion.tagName.toLowerCase(),
                    target,
                    expanded: accordion.getAttribute('aria-expanded') === 'true',
                    styles: {
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        borderColor: style.borderColor,
                        transform: style.transform
                    }
                });
            });
            
            // Find dropdown toggles
            const dropdowns = document.querySelectorAll('[data-toggle="dropdown"], .dropdown-toggle');
            dropdowns.forEach((dropdown, index) => {
                const style = window.getComputedStyle(dropdown);
                
                results.push({
                    type: 'dropdown',
                    index,
                    selector: dropdown.className ? `.${dropdown.className.split(' ')[0]}` : dropdown.tagName.toLowerCase(),
                    expanded: dropdown.getAttribute('aria-expanded') === 'true',
                    styles: {
                        backgroundColor: style.backgroundColor,
                        color: style.color
                    }
                });
            });
            
            // Find tabs
            const tabs = document.querySelectorAll('[role="tab"], .tab, .nav-link');
            tabs.forEach((tab, index) => {
                const style = window.getComputedStyle(tab);
                
                results.push({
                    type: 'tab',
                    index,
                    selector: tab.className ? `.${tab.className.split(' ')[0]}` : tab.tagName.toLowerCase(),
                    active: tab.classList.contains('active') || tab.getAttribute('aria-selected') === 'true',
                    styles: {
                        backgroundColor: style.backgroundColor,
                        color: style.color,
                        borderColor: style.borderColor,
                        borderBottom: style.borderBottom
                    }
                });
            });
            
            return results;
        });
        
        // Detect transition/animation properties on interactive elements
        console.log(`⚡ Detecting transitions and animations...`);
        const transitionAnalysis = await page.evaluate((selectorList) => {
            const results = [];
            
            selectorList.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    
                    elements.forEach((element, index) => {
                        const style = window.getComputedStyle(element);
                        
                        if (style.transition !== 'all 0s ease 0s' && style.transition !== 'none') {
                            results.push({
                                selector,
                                index,
                                transition: {
                                    transition: style.transition,
                                    transitionProperty: style.transitionProperty,
                                    transitionDuration: style.transitionDuration,
                                    transitionTimingFunction: style.transitionTimingFunction,
                                    transitionDelay: style.transitionDelay
                                }
                            });
                        }
                        
                        if (style.animation !== 'none') {
                            results.push({
                                selector,
                                index,
                                animation: {
                                    animation: style.animation,
                                    animationName: style.animationName,
                                    animationDuration: style.animationDuration,
                                    animationTimingFunction: style.animationTimingFunction,
                                    animationDelay: style.animationDelay,
                                    animationIterationCount: style.animationIterationCount
                                }
                            });
                        }
                    });
                } catch (e) {
                    // Skip
                }
            });
            
            return results;
        }, selectors);
        
        // Combine all results
        const finalResults = {
            url: defaultStates.url,
            extractedAt: defaultStates.extractedAt,
            viewport: defaultStates.viewport,
            summary: {
                totalElements: defaultStates.elements.length,
                hoverStates: hoverStates.length,
                focusStates: focusStates.length,
                activeStates: activeStates.length,
                toggleElements: toggleElements.length,
                transitionsDetected: transitionAnalysis.filter(t => t.transition).length,
                animationsDetected: transitionAnalysis.filter(t => t.animation).length
            },
            elements: defaultStates.elements,
            interactiveStates: {
                hover: hoverStates,
                focus: focusStates,
                active: activeStates,
                toggle: toggleElements
            },
            transitions: transitionAnalysis
        };
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const urlSlug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 50);
        const outputPath = `analysis/interactive-states/${timestamp}-${urlSlug}-interactive-states.json`;
        
        console.log(`💾 Saving analysis to ${outputPath}`);
        writeFileSync(outputPath, JSON.stringify(finalResults, null, 2));
        
        // Generate human-readable report
        const report = generateReport(finalResults);
        const reportPath = `analysis/interactive-states/${timestamp}-${urlSlug}-interactive-states.md`;
        writeFileSync(reportPath, report);
        
        console.log(`✅ Analysis complete!`);
        console.log(`📄 JSON: ${outputPath}`);
        console.log(`📄 Report: ${reportPath}`);
        
        return finalResults;
        
    } finally {
        await browser.close();
    }
}

function generateReport(data) {
    let report = `# Interactive Element States Analysis Report\n\n`;
    report += `**URL:** ${data.url}\n`;
    report += `**Analyzed:** ${new Date(data.extractedAt).toLocaleString()}\n`;
    report += `**Viewport:** ${data.viewport.width} × ${data.viewport.height}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Total Interactive Elements:** ${data.summary.totalElements}\n`;
    report += `- **Hover States Detected:** ${data.summary.hoverStates}\n`;
    report += `- **Focus States Detected:** ${data.summary.focusStates}\n`;
    report += `- **Active States Detected:** ${data.summary.activeStates}\n`;
    report += `- **Toggle Elements:** ${data.summary.toggleElements}\n`;
    report += `- **Elements with Transitions:** ${data.summary.transitionsDetected}\n`;
    report += `- **Elements with Animations:** ${data.summary.animationsDetected}\n\n`;
    
    // Hover states
    report += `## Hover States\n\n`;
    if (data.interactiveStates.hover.length > 0) {
        data.interactiveStates.hover.forEach(hover => {
            report += `### \`${hover.hoverSelector}\`\n\n`;
            report += `**Base Selector:** \`${hover.selector}\`\n\n`;
            report += `**Hover Styles:**\n`;
            Object.entries(hover.hoverStyles).forEach(([prop, value]) => {
                report += `- \`${prop}\`: ${value}\n`;
            });
            report += `\n`;
        });
    } else {
        report += `*No hover states detected*\n\n`;
    }
    
    // Focus states
    report += `## Focus States\n\n`;
    if (data.interactiveStates.focus.length > 0) {
        data.interactiveStates.focus.forEach(focus => {
            report += `### \`${focus.focusSelector}\`\n\n`;
            report += `**Base Selector:** \`${focus.selector}\`\n\n`;
            report += `**Focus Styles:**\n`;
            Object.entries(focus.focusStyles).forEach(([prop, value]) => {
                report += `- \`${prop}\`: ${value}\n`;
            });
            report += `\n`;
        });
    } else {
        report += `*No focus states detected*\n\n`;
    }
    
    // Active states
    report += `## Active/Pressed States\n\n`;
    if (data.interactiveStates.active.length > 0) {
        data.interactiveStates.active.forEach(active => {
            report += `### \`${active.activeSelector}\`\n\n`;
            report += `**Base Selector:** \`${active.selector}\`\n\n`;
            report += `**Active Styles:**\n`;
            Object.entries(active.activeStyles).forEach(([prop, value]) => {
                report += `- \`${prop}\`: ${value}\n`;
            });
            report += `\n`;
        });
    } else {
        report += `*No active states detected*\n\n`;
    }
    
    // Toggle elements
    report += `## Toggle Elements\n\n`;
    if (data.interactiveStates.toggle.length > 0) {
        const accordions = data.interactiveStates.toggle.filter(t => t.type === 'accordion');
        const dropdowns = data.interactiveStates.toggle.filter(t => t.type === 'dropdown');
        const tabs = data.interactiveStates.toggle.filter(t => t.type === 'tab');
        
        if (accordions.length > 0) {
            report += `### Accordions (${accordions.length})\n\n`;
            accordions.slice(0, 5).forEach((acc, i) => {
                report += `${i + 1}. \`${acc.selector}\` - ${acc.expanded ? 'Expanded' : 'Collapsed'}\n`;
            });
            report += `\n`;
        }
        
        if (dropdowns.length > 0) {
            report += `### Dropdowns (${dropdowns.length})\n\n`;
            dropdowns.slice(0, 5).forEach((dd, i) => {
                report += `${i + 1}. \`${dd.selector}\` - ${dd.expanded ? 'Open' : 'Closed'}\n`;
            });
            report += `\n`;
        }
        
        if (tabs.length > 0) {
            report += `### Tabs (${tabs.length})\n\n`;
            tabs.slice(0, 5).forEach((tab, i) => {
                report += `${i + 1}. \`${tab.selector}\` - ${tab.active ? 'Active' : 'Inactive'}\n`;
            });
            report += `\n`;
        }
    } else {
        report += `*No toggle elements detected*\n\n`;
    }
    
    // Transitions
    report += `## Transitions & Animations\n\n`;
    if (data.transitions.length > 0) {
        const withTransitions = data.transitions.filter(t => t.transition);
        const withAnimations = data.transitions.filter(t => t.animation);
        
        if (withTransitions.length > 0) {
            report += `### Elements with Transitions\n\n`;
            withTransitions.slice(0, 10).forEach(trans => {
                report += `#### \`${trans.selector}\` (index ${trans.index})\n\n`;
                report += `- **Transition:** ${trans.transition.transition}\n`;
                report += `- **Property:** ${trans.transition.transitionProperty}\n`;
                report += `- **Duration:** ${trans.transition.transitionDuration}\n`;
                report += `- **Timing:** ${trans.transition.transitionTimingFunction}\n`;
                if (trans.transition.transitionDelay !== '0s') {
                    report += `- **Delay:** ${trans.transition.transitionDelay}\n`;
                }
                report += `\n`;
            });
        }
        
        if (withAnimations.length > 0) {
            report += `### Elements with Animations\n\n`;
            withAnimations.slice(0, 10).forEach(anim => {
                report += `#### \`${anim.selector}\` (index ${anim.index})\n\n`;
                report += `- **Animation:** ${anim.animation.animation}\n`;
                report += `- **Name:** ${anim.animation.animationName}\n`;
                report += `- **Duration:** ${anim.animation.animationDuration}\n`;
                report += `- **Timing:** ${anim.animation.animationTimingFunction}\n`;
                if (anim.animation.animationDelay !== '0s') {
                    report += `- **Delay:** ${anim.animation.animationDelay}\n`;
                }
                report += `- **Iterations:** ${anim.animation.animationIterationCount}\n`;
                report += `\n`;
            });
        }
    } else {
        report += `*No transitions or animations detected*\n\n`;
    }
    
    // Sample elements
    report += `## Sample Elements (First 10)\n\n`;
    data.elements.slice(0, 10).forEach((el, i) => {
        report += `### ${i + 1}. ${el.tagName.toUpperCase()} - \`${el.selector}\`\n\n`;
        if (el.text) {
            report += `**Text:** "${el.text}"\n\n`;
        }
        report += `**Default State:**\n`;
        report += `- **Color:** ${el.defaultState.color}\n`;
        report += `- **Background:** ${el.defaultState.backgroundColor}\n`;
        report += `- **Border:** ${el.defaultState.borderWidth} ${el.defaultState.borderStyle} ${el.defaultState.borderColor}\n`;
        report += `- **Transition:** ${el.defaultState.transition}\n`;
        report += `- **Cursor:** ${el.defaultState.cursor}\n`;
        report += `\n`;
    });
    
    return report;
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')) {
    const url = process.argv[2];
    const customSelectors = process.argv[3];
    
    if (!url) {
        console.error('Usage: node interactive-states.mjs <url> [selectors]');
        console.error('Example: node interactive-states.mjs https://example.com');
        console.error('Example: node interactive-states.mjs https://example.com "button, .btn, a"');
        process.exit(1);
    }
    
    ensureDirectories();
    
    analyzeInteractiveStates(url, customSelectors)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

export { analyzeInteractiveStates };
