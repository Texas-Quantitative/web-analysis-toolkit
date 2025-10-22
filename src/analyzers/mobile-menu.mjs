#!/usr/bin/env node
/**
 * Mobile Menu/Modal Analyzer
 * Analyzes hamburger menus, modal dialogs, and mobile navigation patterns at specific breakpoints
 * 
 * Usage: node src/analyzers/mobile-menu.mjs <url> [breakpoint]
 * Example: node src/analyzers/mobile-menu.mjs https://example.com 767
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

// Ensure output directories exist
const ensureDirectories = () => {
    const dirs = ['analysis', 'analysis/mobile-menu', 'analysis/screenshots'];
    dirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    });
};

async function analyzeMobileMenu(url, breakpoint = 767) {
    console.log(`📱 Analyzing mobile menu patterns for ${url} at ${breakpoint}px`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Start with desktop view to detect navigation swap
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log(`📥 Loading page at desktop width...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Detect desktop navigation visibility
        const desktopNav = await page.evaluate(() => {
            const navSelectors = [
                'nav', '.navbar', '.navigation', '.nav', 
                '[role="navigation"]', '.header nav', 
                '.main-nav', '.primary-nav'
            ];
            
            for (const selector of navSelectors) {
                const nav = document.querySelector(selector);
                if (nav) {
                    const style = window.getComputedStyle(nav);
                    return {
                        selector,
                        visible: style.display !== 'none' && style.visibility !== 'hidden',
                        width: nav.offsetWidth,
                        height: nav.offsetHeight
                    };
                }
            }
            return { found: false };
        });
        
        // Switch to mobile view
        console.log(`📱 Switching to mobile view (${breakpoint}px)...`);
        await page.setViewport({ width: breakpoint, height: 900 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Analyze mobile menu patterns
        const mobileMenuAnalysis = await page.evaluate((bp) => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                breakpoint: bp,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                hamburgerIcon: null,
                mobileNavigation: null,
                modal: null,
                animations: [],
                zIndexLayers: []
            };
            
            // Common hamburger menu selectors
            const hamburgerSelectors = [
                '.hamburger', '.menu-toggle', '.navbar-toggler',
                '[class*="hamburger"]', '[class*="menu-toggle"]',
                '[class*="mobile-menu"]', '[data-toggle="modal"]',
                '[data-toggle="collapse"]', '.menu-icon',
                '.nav-toggle', '.mobile-nav-toggle',
                'button[aria-label*="menu" i]',
                'button[aria-label*="navigation" i]'
            ];
            
            // Find hamburger icon
            let hamburgerElement = null;
            let hamburgerSelector = null;
            
            for (const selector of hamburgerSelectors) {
                try {
                    const element = document.querySelector(selector);
                    if (element) {
                        const style = window.getComputedStyle(element);
                        if (style.display !== 'none' && style.visibility !== 'hidden') {
                            hamburgerElement = element;
                            hamburgerSelector = selector;
                            break;
                        }
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            if (hamburgerElement) {
                const rect = hamburgerElement.getBoundingClientRect();
                const style = window.getComputedStyle(hamburgerElement);
                
                // Detect icon type
                let iconType = 'unknown';
                let iconDetails = {};
                
                // Check for SVG
                const svg = hamburgerElement.querySelector('svg');
                if (svg) {
                    iconType = 'svg';
                    iconDetails = {
                        viewBox: svg.getAttribute('viewBox'),
                        width: svg.getAttribute('width') || style.width,
                        height: svg.getAttribute('height') || style.height,
                        innerHTML: svg.innerHTML.substring(0, 500) // Truncate for brevity
                    };
                }
                
                // Check for Font Awesome or icon fonts
                const iconClasses = hamburgerElement.className.split(' ');
                const faClasses = iconClasses.filter(c => c.startsWith('fa-'));
                if (faClasses.length > 0) {
                    iconType = 'font-awesome';
                    iconDetails = { classes: faClasses };
                }
                
                // Check for nested icon element
                const iconChild = hamburgerElement.querySelector('i, span[class*="icon"]');
                if (iconChild && iconType === 'unknown') {
                    iconType = 'icon-element';
                    iconDetails = {
                        element: iconChild.tagName.toLowerCase(),
                        classes: Array.from(iconChild.classList)
                    };
                }
                
                // Check for CSS-based hamburger (three lines)
                const lines = hamburgerElement.querySelectorAll('span, div');
                if (lines.length >= 3 && iconType === 'unknown') {
                    iconType = 'css-lines';
                    iconDetails = {
                        lineCount: lines.length,
                        lineSelector: lines[0]?.tagName.toLowerCase()
                    };
                }
                
                results.hamburgerIcon = {
                    selector: hamburgerSelector,
                    iconType,
                    iconDetails,
                    position: {
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                        width: rect.width,
                        height: rect.height
                    },
                    styles: {
                        color: style.color,
                        backgroundColor: style.backgroundColor,
                        border: style.border,
                        borderRadius: style.borderRadius,
                        padding: style.padding,
                        margin: style.margin,
                        display: style.display,
                        position: style.position,
                        zIndex: style.zIndex,
                        cursor: style.cursor
                    },
                    attributes: {
                        id: hamburgerElement.id,
                        ariaLabel: hamburgerElement.getAttribute('aria-label'),
                        ariaExpanded: hamburgerElement.getAttribute('aria-expanded'),
                        dataToggle: hamburgerElement.getAttribute('data-toggle'),
                        dataTarget: hamburgerElement.getAttribute('data-target')
                    }
                };
            }
            
            // Detect mobile navigation visibility
            const navSelectors = [
                'nav', '.navbar', '.navigation', '.nav', 
                '[role="navigation"]', '.mobile-nav',
                '.mobile-menu', '.off-canvas-menu'
            ];
            
            for (const selector of navSelectors) {
                const nav = document.querySelector(selector);
                if (nav) {
                    const style = window.getComputedStyle(nav);
                    results.mobileNavigation = {
                        selector,
                        visible: style.display !== 'none' && style.visibility !== 'hidden',
                        styles: {
                            display: style.display,
                            position: style.position,
                            width: style.width,
                            height: style.height,
                            top: style.top,
                            left: style.left,
                            right: style.right,
                            bottom: style.bottom,
                            transform: style.transform,
                            transition: style.transition,
                            zIndex: style.zIndex
                        }
                    };
                    break;
                }
            }
            
            // Detect common modal patterns
            const modalSelectors = [
                '.modal', '.modal-dialog', '[role="dialog"]',
                '.overlay', '.menu-overlay', '.sidebar',
                '.offcanvas', '.drawer', '.slide-menu',
                '[class*="modal"]', '[class*="overlay"]'
            ];
            
            for (const selector of modalSelectors) {
                const modals = document.querySelectorAll(selector);
                modals.forEach(modal => {
                    const style = window.getComputedStyle(modal);
                    const rect = modal.getBoundingClientRect();
                    
                    // Only include if positioned (likely a modal)
                    if (style.position === 'fixed' || style.position === 'absolute') {
                        if (!results.modal) {
                            results.modal = [];
                        }
                        
                        results.modal.push({
                            selector,
                            visible: style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0',
                            positioning: {
                                position: style.position,
                                top: style.top,
                                left: style.left,
                                right: style.right,
                                bottom: style.bottom,
                                width: style.width,
                                maxWidth: style.maxWidth,
                                height: style.height,
                                maxHeight: style.maxHeight
                            },
                            styling: {
                                backgroundColor: style.backgroundColor,
                                color: style.color,
                                borderRadius: style.borderRadius,
                                boxShadow: style.boxShadow,
                                border: style.border,
                                padding: style.padding,
                                margin: style.margin
                            },
                            transform: {
                                transform: style.transform,
                                transformOrigin: style.transformOrigin,
                                transition: style.transition,
                                transitionDuration: style.transitionDuration,
                                transitionTimingFunction: style.transitionTimingFunction,
                                transitionDelay: style.transitionDelay
                            },
                            layout: {
                                display: style.display,
                                overflow: style.overflow,
                                overflowX: style.overflowX,
                                overflowY: style.overflowY,
                                zIndex: style.zIndex
                            },
                            dimensions: {
                                actualWidth: rect.width,
                                actualHeight: rect.height,
                                viewportPercentageWidth: (rect.width / window.innerWidth * 100).toFixed(2) + '%'
                            }
                        });
                    }
                });
            }
            
            // Extract z-index layers
            const allElements = document.querySelectorAll('*');
            const zIndexMap = new Map();
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                const zIndex = style.zIndex;
                
                if (zIndex !== 'auto' && zIndex !== '0') {
                    const selector = el.className ? `.${el.className.split(' ')[0]}` : el.tagName.toLowerCase();
                    if (!zIndexMap.has(zIndex)) {
                        zIndexMap.set(zIndex, []);
                    }
                    zIndexMap.get(zIndex).push({
                        selector,
                        element: el.tagName.toLowerCase(),
                        position: style.position
                    });
                }
            });
            
            // Convert to sorted array
            results.zIndexLayers = Array.from(zIndexMap.entries())
                .map(([zIndex, elements]) => ({
                    zIndex: parseInt(zIndex),
                    elements: elements.slice(0, 5) // Limit to 5 per layer
                }))
                .sort((a, b) => a.zIndex - b.zIndex);
            
            return results;
        }, breakpoint);
        
        // Take screenshot before clicking
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const urlSlug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 50);
        const screenshotPathBefore = `analysis/screenshots/${timestamp}-${urlSlug}-mobile-before.png`;
        
        console.log(`📸 Taking screenshot before interaction...`);
        await page.screenshot({ path: screenshotPathBefore, fullPage: true });
        
        // Try to click hamburger menu and capture modal state
        let modalOpenState = null;
        if (mobileMenuAnalysis.hamburgerIcon) {
            try {
                console.log(`🖱️  Clicking hamburger menu...`);
                const hamburgerSelector = mobileMenuAnalysis.hamburgerIcon.selector;
                
                // Wait for the element to be clickable
                await page.waitForSelector(hamburgerSelector, { visible: true, timeout: 5000 });
                
                // Click the hamburger
                await page.click(hamburgerSelector);
                
                // Wait for modal to appear
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Capture modal open state
                modalOpenState = await page.evaluate(() => {
                    const results = {
                        modalsOpen: []
                    };
                    
                    const modalSelectors = [
                        '.modal.show', '.modal.in', '.modal.active',
                        '[class*="modal"][class*="show"]',
                        '[class*="overlay"][class*="active"]',
                        '.offcanvas.show', '.sidebar.active',
                        '[aria-hidden="false"][role="dialog"]'
                    ];
                    
                    for (const selector of modalSelectors) {
                        const modals = document.querySelectorAll(selector);
                        modals.forEach(modal => {
                            const style = window.getComputedStyle(modal);
                            const rect = modal.getBoundingClientRect();
                            
                            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
                                // Extract content
                                const links = Array.from(modal.querySelectorAll('a')).map(a => ({
                                    text: a.textContent.trim(),
                                    href: a.href
                                }));
                                
                                const buttons = Array.from(modal.querySelectorAll('button')).map(btn => ({
                                    text: btn.textContent.trim(),
                                    type: btn.type,
                                    classes: Array.from(btn.classList)
                                }));
                                
                                const phoneNumbers = Array.from(modal.querySelectorAll('a[href^="tel:"]')).map(tel => ({
                                    text: tel.textContent.trim(),
                                    number: tel.href.replace('tel:', '')
                                }));
                                
                                results.modalsOpen.push({
                                    selector,
                                    positioning: {
                                        position: style.position,
                                        top: style.top,
                                        left: style.left,
                                        right: style.right,
                                        bottom: style.bottom,
                                        width: style.width,
                                        height: style.height,
                                        transform: style.transform
                                    },
                                    styling: {
                                        backgroundColor: style.backgroundColor,
                                        color: style.color,
                                        borderRadius: style.borderRadius,
                                        boxShadow: style.boxShadow
                                    },
                                    dimensions: {
                                        actualWidth: rect.width,
                                        actualHeight: rect.height,
                                        viewportPercentageWidth: (rect.width / window.innerWidth * 100).toFixed(2) + '%'
                                    },
                                    content: {
                                        links: links.slice(0, 20),
                                        buttons: buttons.slice(0, 10),
                                        phoneNumbers
                                    }
                                });
                            }
                        });
                    }
                    
                    return results;
                });
                
                // Take screenshot with modal open
                const screenshotPathAfter = `analysis/screenshots/${timestamp}-${urlSlug}-mobile-after.png`;
                console.log(`📸 Taking screenshot with modal open...`);
                await page.screenshot({ path: screenshotPathAfter, fullPage: true });
                
            } catch (error) {
                console.warn(`⚠️  Could not click hamburger menu: ${error.message}`);
            }
        }
        
        // Combine results
        const finalResults = {
            ...mobileMenuAnalysis,
            desktopNavigation: desktopNav,
            modalOpenState,
            screenshots: {
                beforeClick: screenshotPathBefore,
                afterClick: modalOpenState ? `analysis/screenshots/${timestamp}-${urlSlug}-mobile-after.png` : null
            }
        };
        
        // Save results
        const outputPath = `analysis/mobile-menu/${timestamp}-${urlSlug}-mobile-menu.json`;
        console.log(`💾 Saving analysis to ${outputPath}`);
        writeFileSync(outputPath, JSON.stringify(finalResults, null, 2));
        
        // Generate human-readable report
        const report = generateReport(finalResults);
        const reportPath = `analysis/mobile-menu/${timestamp}-${urlSlug}-mobile-menu.md`;
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
    let report = `# Mobile Menu Analysis Report\n\n`;
    report += `**URL:** ${data.url}\n`;
    report += `**Analyzed:** ${new Date(data.extractedAt).toLocaleString()}\n`;
    report += `**Breakpoint:** ${data.breakpoint}px\n\n`;
    
    report += `## Desktop vs Mobile Navigation\n\n`;
    if (data.desktopNavigation) {
        report += `### Desktop Navigation\n`;
        report += `- **Selector:** \`${data.desktopNavigation.selector || 'Not found'}\`\n`;
        report += `- **Visible:** ${data.desktopNavigation.visible ? 'Yes' : 'No'}\n`;
        if (data.desktopNavigation.visible) {
            report += `- **Dimensions:** ${data.desktopNavigation.width}px × ${data.desktopNavigation.height}px\n`;
        }
        report += `\n`;
    }
    
    if (data.mobileNavigation) {
        report += `### Mobile Navigation\n`;
        report += `- **Selector:** \`${data.mobileNavigation.selector}\`\n`;
        report += `- **Visible:** ${data.mobileNavigation.visible ? 'Yes' : 'No'}\n`;
        report += `- **Position:** ${data.mobileNavigation.styles.position}\n`;
        report += `- **Display:** ${data.mobileNavigation.styles.display}\n`;
        report += `\n`;
    }
    
    report += `## Hamburger Icon\n\n`;
    if (data.hamburgerIcon) {
        const icon = data.hamburgerIcon;
        report += `- **Selector:** \`${icon.selector}\`\n`;
        report += `- **Type:** ${icon.iconType}\n`;
        report += `- **Position:** top: ${icon.position.top.toFixed(1)}px, left: ${icon.position.left.toFixed(1)}px\n`;
        report += `- **Dimensions:** ${icon.position.width.toFixed(1)}px × ${icon.position.height.toFixed(1)}px\n`;
        report += `- **Color:** ${icon.styles.color}\n`;
        report += `- **Background:** ${icon.styles.backgroundColor}\n`;
        if (icon.attributes.ariaLabel) {
            report += `- **Aria Label:** "${icon.attributes.ariaLabel}"\n`;
        }
        
        if (icon.iconType === 'svg' && icon.iconDetails.viewBox) {
            report += `\n### SVG Details\n`;
            report += `- **ViewBox:** ${icon.iconDetails.viewBox}\n`;
            report += `- **Size:** ${icon.iconDetails.width} × ${icon.iconDetails.height}\n`;
        } else if (icon.iconType === 'font-awesome') {
            report += `\n### Font Awesome\n`;
            report += `- **Classes:** ${icon.iconDetails.classes.join(', ')}\n`;
        }
        report += `\n`;
    } else {
        report += `*No hamburger icon detected*\n\n`;
    }
    
    report += `## Modal Dialogs\n\n`;
    if (data.modal && data.modal.length > 0) {
        data.modal.forEach((modal, index) => {
            report += `### Modal ${index + 1}: \`${modal.selector}\`\n\n`;
            report += `- **Visible (Initial):** ${modal.visible ? 'Yes' : 'No'}\n`;
            report += `- **Position:** ${modal.positioning.position}\n`;
            report += `- **Location:** top: ${modal.positioning.top}, right: ${modal.positioning.right}, bottom: ${modal.positioning.bottom}, left: ${modal.positioning.left}\n`;
            report += `- **Width:** ${modal.positioning.width} (max: ${modal.positioning.maxWidth})\n`;
            report += `- **Viewport %:** ${modal.dimensions.viewportPercentageWidth}\n`;
            report += `- **Background:** ${modal.styling.backgroundColor}\n`;
            report += `- **Border Radius:** ${modal.styling.borderRadius}\n`;
            report += `- **Box Shadow:** ${modal.styling.boxShadow}\n`;
            report += `- **Transform:** ${modal.transform.transform}\n`;
            report += `- **Transition:** ${modal.transform.transition}\n`;
            report += `- **Z-Index:** ${modal.layout.zIndex}\n`;
            report += `\n`;
        });
    } else {
        report += `*No modal dialogs detected*\n\n`;
    }
    
    if (data.modalOpenState && data.modalOpenState.modalsOpen.length > 0) {
        report += `## Modal Open State (After Click)\n\n`;
        data.modalOpenState.modalsOpen.forEach((modal, index) => {
            report += `### Open Modal ${index + 1}: \`${modal.selector}\`\n\n`;
            report += `- **Position:** ${modal.positioning.position}\n`;
            report += `- **Transform:** ${modal.positioning.transform}\n`;
            report += `- **Dimensions:** ${modal.dimensions.actualWidth.toFixed(1)}px × ${modal.dimensions.actualHeight.toFixed(1)}px\n`;
            report += `- **Viewport Width %:** ${modal.dimensions.viewportPercentageWidth}\n`;
            
            if (modal.content.links.length > 0) {
                report += `\n#### Navigation Links (${modal.content.links.length})\n`;
                modal.content.links.slice(0, 10).forEach(link => {
                    report += `- ${link.text}\n`;
                });
            }
            
            if (modal.content.phoneNumbers.length > 0) {
                report += `\n#### Phone Numbers\n`;
                modal.content.phoneNumbers.forEach(phone => {
                    report += `- ${phone.text} (${phone.number})\n`;
                });
            }
            
            if (modal.content.buttons.length > 0) {
                report += `\n#### Buttons (${modal.content.buttons.length})\n`;
                modal.content.buttons.slice(0, 5).forEach(btn => {
                    report += `- ${btn.text} (${btn.type})\n`;
                });
            }
            report += `\n`;
        });
    }
    
    report += `## Z-Index Layers\n\n`;
    if (data.zIndexLayers.length > 0) {
        report += `| Z-Index | Elements |\n`;
        report += `|---------|----------|\n`;
        data.zIndexLayers.forEach(layer => {
            const elements = layer.elements.map(el => `${el.selector} (${el.position})`).join(', ');
            report += `| ${layer.zIndex} | ${elements} |\n`;
        });
        report += `\n`;
    }
    
    report += `## Screenshots\n\n`;
    report += `- **Before Click:** \`${data.screenshots.beforeClick}\`\n`;
    if (data.screenshots.afterClick) {
        report += `- **After Click:** \`${data.screenshots.afterClick}\`\n`;
    }
    
    return report;
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')) {
    const url = process.argv[2];
    const breakpoint = parseInt(process.argv[3]) || 767;
    
    if (!url) {
        console.error('Usage: node mobile-menu.mjs <url> [breakpoint]');
        console.error('Example: node mobile-menu.mjs https://example.com 767');
        process.exit(1);
    }
    
    ensureDirectories();
    
    analyzeMobileMenu(url, breakpoint)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

export { analyzeMobileMenu };
