# Declarative Site Extraction & Comparison Workflow

**Version**: 3.0.0 (Planned Enhancement)  
**Last Updated**: October 21, 2025  
**Status**: Strategic Planning - Implementation Pending  

## 🎯 **Vision: Natural Language Site Analysis**

Enable developers to work with website analysis through simple, declarative commands instead of complex tool orchestration.

---

## 💬 **Natural Language Interface**

### **Extraction Commands**

#### **Single Viewport Extraction**
```
"Extract exact page details for https://careington1.com at 1400px width"

→ Captures complete page analysis at 1400px viewport
→ Stores as: orig/careington1.com/1400px/
```

#### **Multi-Viewport Extraction**
```
"Extract exact page details for https://careington1.com at widths: 1400, 1000, 600"

→ Captures complete analysis at each specified width
→ Stores as: 
   orig/careington1.com/1400px/
   orig/careington1.com/1000px/
   orig/careington1.com/600px/
```

#### **Smart Viewport Selection**
```
"Extract page details for https://careington1.com at mobile, tablet, and desktop widths"

→ Auto-translates to: 375px (mobile), 768px (tablet), 1440px (desktop)
→ Captures at industry-standard viewports
```

---

## 🏗️ **Recreation Commands**

### **Framework-Specific Recreation**

#### **Tailwind Recreation**
```
"Build a replacement version of the page using HTML/Tailwind"

→ Analyzes all extracted viewports
→ Generates Tailwind-based responsive HTML
→ Includes proper breakpoint classes
→ Preserves original class names where applicable
→ Creates: recreation/index.html with Tailwind CSS
```

#### **Bootstrap Recreation**
```
"Build a replacement version using Bootstrap 5"

→ Maps extracted styles to Bootstrap components
→ Uses Bootstrap grid system and utilities
→ Generates semantic Bootstrap markup
```

#### **Vanilla CSS Recreation**
```
"Build a replacement version using vanilla HTML/CSS"

→ Generates clean semantic HTML
→ Creates custom CSS with media queries
→ No framework dependencies
```

### **Partial Recreation**
```
"Recreate just the navigation section using Tailwind"

→ Analyzes navigation elements across viewports
→ Generates isolated component with responsive behavior
```

---

## 🔍 **Comparison Commands**

### **Cross-Site Comparison**

#### **Viewport-Specific Comparison**
```
"Compare the scanned site to the local project site at 1000px width"

→ Loads https://careington1.com at 1000px (from cache or fresh)
→ Loads http://localhost:8080 at 1000px
→ Generates side-by-side visual comparison
→ Highlights differences in:
   - Layout positioning
   - Color values
   - Typography
   - Spacing
   - Element dimensions
```

#### **Multi-Viewport Comparison**
```
"Compare original site to local project at 600, 1000, and 1400px widths"

→ Generates comparison report across all three viewports
→ Shows responsive behavior differences
→ Identifies breakpoint mismatches
```

### **Difference Reporting**
```
"What's different between the original and my recreation at mobile width?"

→ Analyzes 375px viewport for both sites
→ Reports:
   ✓ Matches: 85% layout accuracy
   ⚠️ Differences:
     - Hero height: Original 450px, Recreation 480px (+30px)
     - Nav padding: Original 1rem, Recreation 1.5rem (+0.5rem)
     - Primary color: Original #003366, Recreation #003266 (slight variance)
```

---

## 🛠️ **Technical Architecture**

### **Command Parser**
```javascript
class DeclarativeSiteAnalyzer {
    // Parse natural language commands
    async parseCommand(command) {
        const intent = this.detectIntent(command);
        const params = this.extractParameters(command);
        
        switch(intent) {
            case 'EXTRACT':
                return this.handleExtraction(params);
            case 'RECREATE':
                return this.handleRecreation(params);
            case 'COMPARE':
                return this.handleComparison(params);
        }
    }
    
    // Intent detection
    detectIntent(command) {
        if (/extract|capture|scan|analyze/i.test(command)) {
            return 'EXTRACT';
        }
        if (/build|create|generate|recreate/i.test(command)) {
            return 'RECREATE';
        }
        if (/compare|diff|differences|match/i.test(command)) {
            return 'COMPARE';
        }
    }
    
    // Parameter extraction
    extractParameters(command) {
        return {
            url: this.extractURL(command),
            widths: this.extractWidths(command),
            framework: this.extractFramework(command),
            target: this.extractTarget(command)
        };
    }
}
```

### **Storage Structure**
```
project-root/
├── orig/
│   └── careington1.com/
│       ├── 1400px/
│       │   ├── screenshot.png
│       │   ├── analysis.json
│       │   ├── styles.json
│       │   └── elements.json
│       ├── 1000px/
│       │   ├── screenshot.png
│       │   ├── analysis.json
│       │   ├── styles.json
│       │   └── elements.json
│       ├── 600px/
│       │   ├── screenshot.png
│       │   ├── analysis.json
│       │   ├── styles.json
│       │   └── elements.json
│       └── metadata.json
├── recreation/
│   ├── index.html
│   ├── styles.css
│   └── comparison-report.md
└── cache/
    └── site-extraction-cache.json
```

### **Extraction Engine**
```javascript
class MultiViewportExtractor {
    async extractAtWidths(url, widths, options = {}) {
        const results = {};
        
        for (const width of widths) {
            console.log(`📊 Extracting ${url} at ${width}px...`);
            
            const analysis = await this.analyzeViewport(url, width, {
                screenshot: true,
                styles: true,
                elements: true,
                interactions: options.includeJS || false
            });
            
            results[`${width}px`] = analysis;
            
            // Save immediately for progressive results
            await this.saveAnalysis(url, width, analysis);
        }
        
        return results;
    }
    
    async analyzeViewport(url, width, options) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ 
            width: width, 
            height: 1080 // Auto-adjust for content
        });
        
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        const analysis = {
            viewport: { width, height: await this.getFullHeight(page) },
            screenshot: options.screenshot ? await page.screenshot() : null,
            styles: options.styles ? await this.extractStyles(page) : null,
            elements: options.elements ? await this.extractElements(page) : null,
            timestamp: Date.now()
        };
        
        await browser.close();
        return analysis;
    }
}
```

### **Recreation Engine**
```javascript
class SiteRecreator {
    async recreateWithFramework(extractionData, framework) {
        console.log(`🏗️ Recreating site using ${framework}...`);
        
        // Analyze all viewports to understand responsive behavior
        const responsivePatterns = this.detectResponsivePatterns(extractionData);
        
        // Generate framework-specific code
        switch(framework.toLowerCase()) {
            case 'tailwind':
                return this.generateTailwind(extractionData, responsivePatterns);
            case 'bootstrap':
                return this.generateBootstrap(extractionData, responsivePatterns);
            case 'vanilla':
                return this.generateVanilla(extractionData, responsivePatterns);
        }
    }
    
    generateTailwind(data, patterns) {
        const html = [];
        const config = this.generateTailwindConfig(data);
        
        // Detect breakpoints from extraction data
        const breakpoints = Object.keys(data).map(k => parseInt(k));
        
        // Generate responsive classes
        patterns.forEach(pattern => {
            const classes = this.mapToTailwind(pattern, breakpoints);
            html.push(this.generateElement(pattern, classes));
        });
        
        return {
            html: html.join('\n'),
            config: config,
            classes: this.extractUsedClasses(html)
        };
    }
}
```

### **Comparison Engine**
```javascript
class SiteComparator {
    async compareAtWidth(originalURL, localURL, width) {
        console.log(`🔍 Comparing sites at ${width}px...`);
        
        // Extract both sites at same viewport
        const original = await this.extract(originalURL, width);
        const local = await this.extract(localURL, width);
        
        // Generate comparison
        const differences = {
            layout: this.compareLayout(original, local),
            colors: this.compareColors(original, local),
            typography: this.compareTypography(original, local),
            spacing: this.compareSpacing(original, local),
            elements: this.compareElements(original, local)
        };
        
        // Generate visual diff
        const visualDiff = await this.generateVisualDiff(
            original.screenshot, 
            local.screenshot
        );
        
        // Calculate accuracy score
        const accuracy = this.calculateAccuracy(differences);
        
        return {
            width,
            accuracy,
            differences,
            visualDiff,
            recommendations: this.generateRecommendations(differences)
        };
    }
    
    generateVisualDiff(originalImg, localImg) {
        // Side-by-side comparison with difference highlighting
        // Red overlay where pixels differ
        // Green checkmarks where sections match
    }
}
```

---

## 💬 **CLI Command Examples**

### **Extraction**
```bash
# Extract at specific widths
node tools/declarative-analyzer.js extract "https://careington1.com" --widths 1400,1000,600

# Extract with semantic widths
node tools/declarative-analyzer.js extract "https://careington1.com" --preset mobile,tablet,desktop

# Extract with JS behavior
node tools/declarative-analyzer.js extract "https://careington1.com" --widths 1400 --include-js
```

### **Recreation**
```bash
# Recreate with Tailwind
node tools/declarative-analyzer.js recreate --source orig/careington1.com --framework tailwind

# Recreate specific component
node tools/declarative-analyzer.js recreate --source orig/careington1.com --component navigation --framework bootstrap

# Recreate with custom breakpoints
node tools/declarative-analyzer.js recreate --source orig/careington1.com --framework vanilla --breakpoints 600,900,1200
```

### **Comparison**
```bash
# Compare at specific width
node tools/declarative-analyzer.js compare "https://careington1.com" "http://localhost:8080" --width 1000

# Compare across multiple widths
node tools/declarative-analyzer.js compare "https://careington1.com" "http://localhost:8080" --widths 600,1000,1400

# Generate detailed diff report
node tools/declarative-analyzer.js compare "https://careington1.com" "http://localhost:8080" --widths 600,1000,1400 --detailed --output report.md
```

---

## 📊 **Output Examples**

### **Extraction Output**
```
📊 Extracting https://careington1.com at multiple widths...

✓ 1400px: Captured (2.3s)
  - Screenshot: orig/careington1.com/1400px/screenshot.png
  - Elements: 247 analyzed
  - Colors: 23 unique
  - Fonts: 4 families

✓ 1000px: Captured (2.1s)
  - Screenshot: orig/careington1.com/1000px/screenshot.png
  - Elements: 247 analyzed (12 layout changes from 1400px)
  - Colors: 23 unique
  - Fonts: 4 families

✓ 600px: Captured (2.0s)
  - Screenshot: orig/careington1.com/600px/screenshot.png
  - Elements: 247 analyzed (38 layout changes from 1000px)
  - Colors: 23 unique
  - Fonts: 4 families

📁 Results saved to: orig/careington1.com/
⏱️ Total time: 6.4 seconds
```

### **Recreation Output**
```
🏗️ Recreating site using HTML/Tailwind...

Analyzing responsive patterns:
✓ Detected 2 major breakpoints: 768px, 1024px
✓ Identified 12 responsive components
✓ Mapped 156 style rules to Tailwind utilities

Generating code:
✓ index.html created (247 lines)
✓ tailwind.config.js created with custom colors
✓ Custom CSS: 23 rules (8% of original - good!)

Recreation complete!
📁 Files: recreation/
  - index.html
  - tailwind.config.js
  - custom.css

🚀 Test with: npm run dev
```

### **Comparison Output**
```
🔍 Comparing sites at 1000px width...

Loading sites:
✓ Original: https://careington1.com (cached)
✓ Local: http://localhost:8080 (live)

Analysis:
✓ Layout Match: 92% 
  ⚠️ Hero height difference: +30px in recreation
  ⚠️ Navigation padding: +0.5rem in recreation

✓ Color Match: 98%
  ⚠️ Primary blue slightly off: #003366 → #003266

✓ Typography Match: 95%
  ⚠️ H1 font weight: 700 → 600 in recreation

✓ Spacing Match: 88%
  ⚠️ Section margins inconsistent

Overall Accuracy: 93% ✅

Recommendations:
1. Adjust hero height: Change h-[480px] to h-[450px]
2. Fix primary color: Update tailwind.config.js primary to #003366
3. Update H1 weight: Change font-semibold to font-bold
4. Review section spacing: Check mt-8 vs mt-12 usage

📊 Detailed report: recreation/comparison-report.md
🖼️ Visual diff: recreation/visual-diff-1000px.png
```

---

## 🔄 **Integration with Existing Tools**

### **Backward Compatibility**
```javascript
// Old workflow (still supported)
npm run styles:responsive -- https://careington1.com
npm run styles:comprehensive -- https://careington1.com

// New declarative workflow
node tools/declarative-analyzer.js extract "https://careington1.com" --preset standard
// Internally uses existing tools, adds orchestration layer
```

### **Migration Path**
```
Phase 1: Add declarative wrapper around existing tools
Phase 2: Enhance with multi-viewport coordination
Phase 3: Add recreation engine
Phase 4: Add comparison engine
Phase 5: Natural language processing (future)
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Multi-Viewport Extraction**
- [ ] Create `declarative-analyzer.js` CLI tool
- [ ] Implement width parameter parsing
- [ ] Add preset viewport mappings (mobile/tablet/desktop)
- [ ] Create organized storage structure by domain and width
- [ ] Implement progressive extraction with status updates
- [ ] Add extraction time warnings for multiple viewports
- [ ] Integrate with existing caching system

### **Phase 2: Recreation Engine**
- [ ] Implement responsive pattern detection across viewports
- [ ] Create Tailwind code generator
- [ ] Create Bootstrap code generator
- [ ] Create vanilla CSS generator
- [ ] Add class name preservation to recreation
- [ ] Generate framework config files (tailwind.config.js, etc.)
- [ ] Implement component-level recreation

### **Phase 3: Comparison Engine**
- [ ] Implement viewport-matched extraction for comparison
- [ ] Create layout difference detector
- [ ] Create color difference analyzer
- [ ] Create typography difference detector
- [ ] Implement visual diff generation (side-by-side screenshots)
- [ ] Build accuracy scoring algorithm
- [ ] Generate actionable recommendations

### **Phase 4: User Experience**
- [ ] Add time warnings before multi-viewport operations
- [ ] Implement progress indicators for long-running tasks
- [ ] Create detailed status outputs
- [ ] Add interactive prompts for ambiguous commands
- [ ] Generate comprehensive reports in markdown
- [ ] Add export options (JSON, PDF, HTML)

---

## 🎯 **Success Criteria**

### **Extraction**
- ✅ User can specify any viewport widths
- ✅ Results organized by domain and viewport
- ✅ Each viewport fully independent (can be extracted separately)
- ✅ Automatic screenshot generation at each width
- ✅ Complete style and element data captured
- ✅ Time warnings displayed before multi-viewport operations

### **Recreation**
- ✅ Generates working HTML from extraction data
- ✅ Preserves responsive behavior across viewports
- ✅ Framework-specific code (Tailwind/Bootstrap/Vanilla)
- ✅ Maintains original class names where applicable
- ✅ Creates necessary config files automatically
- ✅ Minimal custom CSS required (framework handles most styling)

### **Comparison**
- ✅ Accurate pixel-level comparison at specified viewports
- ✅ Visual diff highlights exact differences
- ✅ Actionable recommendations for fixing mismatches
- ✅ Accuracy percentage calculation
- ✅ Side-by-side screenshot comparison
- ✅ Detailed difference breakdown by category

---

## 💡 **Future Enhancements**

### **Natural Language Processing**
```
"Extract careington1.com at common mobile sizes"
→ Auto-selects 320, 375, 414px

"Compare my recreation to the original, focusing on the navigation"
→ Compares only navigation elements across all cached viewports
```

### **Interactive Mode**
```bash
$ node tools/declarative-analyzer.js --interactive

> extract https://careington1.com at 1400, 1000, 600
Extracting... [Progress bar]
Done! 3 viewports analyzed.

> recreate using tailwind
Recreating... [Progress bar]
Done! Files in recreation/

> compare to localhost:8080 at 1000
Comparing... [Progress bar]
93% match. 4 differences found.
Show details? (y/n)
```

### **AI-Assisted Recreation**
```
"Recreate this page but optimize for accessibility"
→ Generates code with ARIA labels, semantic HTML, keyboard navigation

"Recreate using Tailwind but make it darker/lighter"
→ Adjusts color scheme while maintaining relationships
```

---

## 🚨 **Important Considerations**

### **Time Management**
```
Single viewport extraction: ~2-3 seconds
Multi-viewport extraction: 2-3 seconds × N viewports

ALWAYS warn user:
"Extracting at 3 viewports will take approximately 6-9 seconds. Continue? (y/n)"
```

### **Cache Strategy**
```
Extract once, use everywhere:
- Extract: https://careington1.com at 1400, 1000, 600
- Recreate: Uses cached data (instant)
- Compare: Uses cached data for original (instant)

Force refresh if needed:
--force flag bypasses cache
```

### **Storage Management**
```
Each viewport extraction: ~2-5 MB (screenshot + data)
Full site (3 viewports): ~6-15 MB

Implement cleanup:
--cleanup flag to remove old extractions
--keep-latest N to retain only recent N extractions
```

---

**This represents the next evolution in web analysis tooling: from manual tool orchestration to declarative, intent-based workflows.**

*Implementation Priority: Version 3.0.0 - Strategic enhancement for maximum developer productivity*
