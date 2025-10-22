#!/usr/bin/env node
/**
 * Font File Analyzer
 * Detects and downloads actual font files used (WOFF2, TTF, etc.) with their weight/style mappings
 * 
 * Usage: node src/extractors/font-files.mjs <url> [--download]
 * Example: node src/extractors/font-files.mjs https://example.com --download
 */

import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { createWriteStream } from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

// Ensure output directories exist
const ensureDirectories = () => {
    const dirs = ['analysis', 'analysis/font-files', 'analysis/font-files/downloads'];
    dirs.forEach(dir => {
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    });
};

async function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        
        const file = createWriteStream(filepath);
        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(filepath);
                });
            } else {
                reject(new Error(`Failed to download: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function analyzeFontFiles(url, shouldDownload = false) {
    console.log(`🔤 Analyzing font files for ${url}`);
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Capture network requests for font files
        const fontRequests = [];
        
        page.on('response', async (response) => {
            const url = response.url();
            const contentType = response.headers()['content-type'] || '';
            
            // Detect font file requests
            if (contentType.includes('font') || 
                url.match(/\.(woff2?|ttf|otf|eot)(\?.*)?$/i)) {
                fontRequests.push({
                    url,
                    contentType,
                    status: response.status()
                });
            }
        });
        
        await page.setViewport({ width: 1440, height: 900 });
        
        console.log(`📥 Loading page and capturing font requests...`);
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log(`🔍 Analyzing @font-face declarations...`);
        
        const fontAnalysis = await page.evaluate(() => {
            const results = {
                url: window.location.href,
                extractedAt: new Date().toISOString(),
                fontFaces: [],
                computedFonts: {
                    byElement: [],
                    uniqueFamilies: new Set(),
                    uniqueWeights: new Set()
                }
            };
            
            // Extract @font-face rules from stylesheets
            const styleSheets = Array.from(document.styleSheets);
            
            styleSheets.forEach((sheet, sheetIndex) => {
                try {
                    const rules = Array.from(sheet.cssRules || sheet.rules || []);
                    
                    rules.forEach((rule, ruleIndex) => {
                        if (rule instanceof CSSFontFaceRule) {
                            const fontFace = {
                                sheetIndex,
                                ruleIndex,
                                fontFamily: null,
                                fontWeight: null,
                                fontStyle: null,
                                fontDisplay: null,
                                src: [],
                                unicodeRange: null
                            };
                            
                            // Extract font-family
                            const family = rule.style.getPropertyValue('font-family');
                            if (family) {
                                fontFace.fontFamily = family.replace(/['"]/g, '');
                            }
                            
                            // Extract font-weight
                            const weight = rule.style.getPropertyValue('font-weight');
                            if (weight) {
                                fontFace.fontWeight = weight;
                            }
                            
                            // Extract font-style
                            const style = rule.style.getPropertyValue('font-style');
                            if (style) {
                                fontFace.fontStyle = style;
                            }
                            
                            // Extract font-display
                            const display = rule.style.getPropertyValue('font-display');
                            if (display) {
                                fontFace.fontDisplay = display;
                            }
                            
                            // Extract src (font file URLs)
                            const src = rule.style.getPropertyValue('src');
                            if (src) {
                                // Parse src to extract URLs and formats
                                const urlMatches = src.matchAll(/url\(['"]?([^'"()]+)['"]?\)(?:\s+format\(['"]?([^'"()]+)['"]?\))?/g);
                                
                                for (const match of urlMatches) {
                                    const url = match[1];
                                    const format = match[2] || 'unknown';
                                    
                                    // Determine file extension
                                    let extension = 'unknown';
                                    if (url.includes('.woff2')) extension = 'woff2';
                                    else if (url.includes('.woff')) extension = 'woff';
                                    else if (url.includes('.ttf')) extension = 'ttf';
                                    else if (url.includes('.otf')) extension = 'otf';
                                    else if (url.includes('.eot')) extension = 'eot';
                                    else if (format.includes('woff2')) extension = 'woff2';
                                    else if (format.includes('woff')) extension = 'woff';
                                    else if (format.includes('truetype')) extension = 'ttf';
                                    else if (format.includes('opentype')) extension = 'otf';
                                    
                                    fontFace.src.push({
                                        url,
                                        format,
                                        extension,
                                        isDataUri: url.startsWith('data:')
                                    });
                                }
                            }
                            
                            // Extract unicode-range
                            const unicodeRange = rule.style.getPropertyValue('unicode-range');
                            if (unicodeRange) {
                                fontFace.unicodeRange = unicodeRange;
                            }
                            
                            results.fontFaces.push(fontFace);
                        }
                    });
                } catch (e) {
                    // CORS error or other stylesheet access issue
                }
            });
            
            // Analyze computed font styles on actual elements
            const elementsToCheck = [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'span', 'a', 'button',
                '.btn', '.title', '.heading', '.text'
            ];
            
            elementsToCheck.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach((element, index) => {
                        const style = window.getComputedStyle(element);
                        const fontFamily = style.fontFamily;
                        const fontWeight = style.fontWeight;
                        const fontSize = style.fontSize;
                        const fontStyle = style.fontStyle;
                        
                        results.computedFonts.uniqueFamilies.add(fontFamily);
                        results.computedFonts.uniqueWeights.add(fontWeight);
                        
                        if (index < 3) { // Limit to first 3 per selector
                            results.computedFonts.byElement.push({
                                selector,
                                index,
                                text: element.textContent?.trim().substring(0, 50),
                                fontFamily,
                                fontWeight,
                                fontSize,
                                fontStyle
                            });
                        }
                    });
                } catch (e) {
                    // Skip invalid selectors
                }
            });
            
            // Convert Sets to Arrays
            results.computedFonts.uniqueFamilies = Array.from(results.computedFonts.uniqueFamilies);
            results.computedFonts.uniqueWeights = Array.from(results.computedFonts.uniqueWeights);
            
            return results;
        });
        
        // Add network-captured font requests
        fontAnalysis.networkRequests = fontRequests;
        
        // Group font faces by family
        const fontFamilyMap = {};
        fontAnalysis.fontFaces.forEach(ff => {
            const family = ff.fontFamily || 'Unknown';
            if (!fontFamilyMap[family]) {
                fontFamilyMap[family] = [];
            }
            fontFamilyMap[family].push(ff);
        });
        
        fontAnalysis.fontFamilyMap = fontFamilyMap;
        
        // Generate import statements
        const importStatements = generateImportStatements(fontAnalysis.fontFaces);
        fontAnalysis.importStatements = importStatements;
        
        // Download font files if requested
        if (shouldDownload) {
            console.log(`📥 Downloading font files...`);
            const downloads = [];
            
            for (const fontFace of fontAnalysis.fontFaces) {
                for (const src of fontFace.src) {
                    if (!src.isDataUri && src.url) {
                        try {
                            // Convert relative URLs to absolute
                            let absoluteUrl = src.url;
                            if (!src.url.startsWith('http')) {
                                const baseUrl = new URL(url);
                                absoluteUrl = new URL(src.url, baseUrl.origin).href;
                            }
                            
                            // Generate filename
                            const familyName = fontFace.fontFamily?.replace(/[^a-z0-9]/gi, '') || 'Unknown';
                            const weight = fontFace.fontWeight || 'normal';
                            const style = fontFace.fontStyle || 'normal';
                            const extension = src.extension;
                            const filename = `${familyName}-${weight}-${style}.${extension}`;
                            const filepath = `analysis/font-files/downloads/${filename}`;
                            
                            console.log(`  Downloading ${filename}...`);
                            await downloadFile(absoluteUrl, filepath);
                            
                            downloads.push({
                                fontFamily: fontFace.fontFamily,
                                fontWeight: fontFace.fontWeight,
                                fontStyle: fontFace.fontStyle,
                                url: absoluteUrl,
                                localPath: filepath,
                                filename
                            });
                        } catch (err) {
                            console.warn(`  ⚠️  Failed to download ${src.url}: ${err.message}`);
                        }
                    }
                }
            }
            
            fontAnalysis.downloads = downloads;
            console.log(`✅ Downloaded ${downloads.length} font files`);
        }
        
        // Save results
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const urlSlug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '-').substring(0, 50);
        const outputPath = `analysis/font-files/${timestamp}-${urlSlug}-fonts.json`;
        
        console.log(`💾 Saving analysis to ${outputPath}`);
        writeFileSync(outputPath, JSON.stringify(fontAnalysis, null, 2));
        
        // Generate human-readable report
        const report = generateReport(fontAnalysis);
        const reportPath = `analysis/font-files/${timestamp}-${urlSlug}-fonts.md`;
        writeFileSync(reportPath, report);
        
        // Generate CSS file with @font-face declarations
        const cssPath = `analysis/font-files/${timestamp}-${urlSlug}-fonts.css`;
        const css = generateCssFile(fontAnalysis);
        writeFileSync(cssPath, css);
        
        console.log(`✅ Analysis complete!`);
        console.log(`📄 JSON: ${outputPath}`);
        console.log(`📄 Report: ${reportPath}`);
        console.log(`📄 CSS: ${cssPath}`);
        
        return fontAnalysis;
        
    } finally {
        await browser.close();
    }
}

function generateImportStatements(fontFaces) {
    const statements = {
        googleFonts: [],
        localFontFace: []
    };
    
    fontFaces.forEach(ff => {
        if (ff.src.length > 0) {
            const firstSrc = ff.src[0];
            
            // Check if it's a Google Fonts URL
            if (firstSrc.url.includes('fonts.googleapis.com') || firstSrc.url.includes('fonts.gstatic.com')) {
                statements.googleFonts.push({
                    family: ff.fontFamily,
                    weight: ff.fontWeight,
                    style: ff.fontStyle,
                    url: firstSrc.url
                });
            } else {
                // Local @font-face declaration
                const srcString = ff.src.map(s => {
                    return `url('${s.url}') format('${s.format}')`;
                }).join(',\n       ');
                
                const declaration = `@font-face {
  font-family: '${ff.fontFamily}';
  font-weight: ${ff.fontWeight || 'normal'};
  font-style: ${ff.fontStyle || 'normal'};
  ${ff.fontDisplay ? `font-display: ${ff.fontDisplay};` : ''}
  src: ${srcString};
}`;
                
                statements.localFontFace.push(declaration);
            }
        }
    });
    
    return statements;
}

function generateCssFile(analysis) {
    let css = `/* Font Files Analysis */\n`;
    css += `/* Extracted from: ${analysis.url} */\n`;
    css += `/* Date: ${new Date(analysis.extractedAt).toLocaleString()} */\n\n`;
    
    // Add import statements for Google Fonts
    if (analysis.importStatements.googleFonts.length > 0) {
        css += `/* Google Fonts Imports */\n`;
        const uniqueUrls = [...new Set(analysis.importStatements.googleFonts.map(gf => gf.url))];
        uniqueUrls.forEach(url => {
            if (url.includes('fonts.googleapis.com')) {
                css += `@import url('${url}');\n`;
            }
        });
        css += `\n`;
    }
    
    // Add @font-face declarations
    if (analysis.importStatements.localFontFace.length > 0) {
        css += `/* Local @font-face Declarations */\n\n`;
        analysis.importStatements.localFontFace.forEach(declaration => {
            css += declaration + '\n\n';
        });
    }
    
    // Add usage guide
    css += `/* Font Families Detected */\n`;
    css += `/*\n`;
    analysis.computedFonts.uniqueFamilies.forEach(family => {
        css += `  ${family}\n`;
    });
    css += `*/\n\n`;
    
    css += `/* Font Weights Used */\n`;
    css += `/*\n`;
    analysis.computedFonts.uniqueWeights.forEach(weight => {
        css += `  ${weight}\n`;
    });
    css += `*/\n`;
    
    return css;
}

function generateReport(data) {
    let report = `# Font Files Analysis Report\n\n`;
    report += `**URL:** ${data.url}\n`;
    report += `**Analyzed:** ${new Date(data.extractedAt).toLocaleString()}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **@font-face Declarations:** ${data.fontFaces.length}\n`;
    report += `- **Unique Font Families:** ${data.computedFonts.uniqueFamilies.length}\n`;
    report += `- **Font Weights Detected:** ${data.computedFonts.uniqueWeights.length}\n`;
    report += `- **Network Font Requests:** ${data.networkRequests.length}\n`;
    if (data.downloads) {
        report += `- **Downloaded Font Files:** ${data.downloads.length}\n`;
    }
    report += `\n`;
    
    // Font families
    report += `## Font Families Detected\n\n`;
    data.computedFonts.uniqueFamilies.forEach(family => {
        report += `- ${family}\n`;
    });
    report += `\n`;
    
    // @font-face declarations
    report += `## @font-face Declarations (${data.fontFaces.length})\n\n`;
    
    Object.entries(data.fontFamilyMap).forEach(([family, fontFaces]) => {
        report += `### ${family} (${fontFaces.length} variants)\n\n`;
        
        fontFaces.forEach((ff, index) => {
            report += `#### Variant ${index + 1}\n`;
            report += `- **Weight:** ${ff.fontWeight || 'normal'}\n`;
            report += `- **Style:** ${ff.fontStyle || 'normal'}\n`;
            if (ff.fontDisplay) {
                report += `- **Display:** ${ff.fontDisplay}\n`;
            }
            
            if (ff.src.length > 0) {
                report += `- **Sources:**\n`;
                ff.src.forEach(src => {
                    report += `  - **Format:** ${src.format} (${src.extension})\n`;
                    if (!src.isDataUri) {
                        report += `    **URL:** \`${src.url}\`\n`;
                    } else {
                        report += `    **Type:** Data URI\n`;
                    }
                });
            }
            
            report += `\n`;
        });
    });
    
    // Network requests
    report += `## Network Font Requests (${data.networkRequests.length})\n\n`;
    if (data.networkRequests.length > 0) {
        data.networkRequests.forEach((req, index) => {
            report += `${index + 1}. **${req.contentType}** (${req.status})\n`;
            report += `   \`${req.url}\`\n\n`;
        });
    } else {
        report += `*No network font requests detected*\n\n`;
    }
    
    // Downloads
    if (data.downloads && data.downloads.length > 0) {
        report += `## Downloaded Font Files\n\n`;
        data.downloads.forEach((dl, index) => {
            report += `${index + 1}. **${dl.fontFamily}** (${dl.fontWeight}, ${dl.fontStyle})\n`;
            report += `   - **Local Path:** \`${dl.localPath}\`\n`;
            report += `   - **Filename:** \`${dl.filename}\`\n\n`;
        });
    }
    
    // Computed fonts usage
    report += `## Font Usage Examples\n\n`;
    const grouped = {};
    data.computedFonts.byElement.forEach(el => {
        const key = `${el.fontFamily} | ${el.fontWeight}`;
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(el);
    });
    
    Object.entries(grouped).forEach(([key, elements]) => {
        const [family, weight] = key.split(' | ');
        report += `### ${family} (weight: ${weight})\n\n`;
        elements.forEach(el => {
            report += `- **${el.selector}:** "${el.text}" (${el.fontSize})\n`;
        });
        report += `\n`;
    });
    
    // Import statements
    report += `## Import Statements\n\n`;
    
    if (data.importStatements.googleFonts.length > 0) {
        report += `### Google Fonts\n\n`;
        report += `\`\`\`css\n`;
        const uniqueUrls = [...new Set(data.importStatements.googleFonts.map(gf => gf.url))];
        uniqueUrls.forEach(url => {
            if (url.includes('fonts.googleapis.com')) {
                report += `@import url('${url}');\n`;
            }
        });
        report += `\`\`\`\n\n`;
    }
    
    if (data.importStatements.localFontFace.length > 0) {
        report += `### Local @font-face\n\n`;
        report += `\`\`\`css\n`;
        data.importStatements.localFontFace.slice(0, 3).forEach(declaration => {
            report += declaration + '\n\n';
        });
        if (data.importStatements.localFontFace.length > 3) {
            report += `/* ... ${data.importStatements.localFontFace.length - 3} more declarations */\n`;
        }
        report += `\`\`\`\n`;
    }
    
    return report;
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')) {
    const url = process.argv[2];
    const shouldDownload = process.argv.includes('--download');
    
    if (!url) {
        console.error('Usage: node font-files.mjs <url> [--download]');
        console.error('Example: node font-files.mjs https://example.com');
        console.error('Example: node font-files.mjs https://example.com --download');
        process.exit(1);
    }
    
    ensureDirectories();
    
    analyzeFontFiles(url, shouldDownload)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Error:', err);
            process.exit(1);
        });
}

export { analyzeFontFiles };
