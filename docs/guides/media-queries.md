# Media Query Extraction Tool

**Version**: 2.1.4  
**Last Updated**: October 21, 2025  
**Purpose**: Extract actual CSS media query breakpoints from website stylesheets to understand responsive behavior  

---

## 🎯 **What This Tool Does**

The **Media Query Extractor** analyzes website stylesheets and extracts the **actual CSS media query breakpoints** defined by the original developers. Unlike computed style analysis (which samples specific viewport widths), this tool reveals:

- ✅ **Exact breakpoint values** defined in the CSS (`@media (max-width: 768px)`)
- ✅ **What CSS rules change** at each breakpoint
- ✅ **Which selectors are affected** at each responsive breakpoint
- ✅ **Complete media query conditions** (min-width, max-width, orientation, etc.)

---

## 🚨 **Why This Tool Is Critical**

### **The Gap in Existing Analysis**

**Current tools capture COMPUTED styles at fixed widths:**
```javascript
// What responsive analysis gives you:
Desktop (1400px): margin-left: 325px
Tablet (1000px):  margin-left: 325px
Mobile (600px):   margin-left: auto

// ❌ But you don't know: At what EXACT width does it switch?
```

**This tool extracts the ACTUAL media query:**
```css
/* What media query extraction reveals: */
.hero-section {
    margin-left: 325px;  /* Default */
}

@media (max-width: 1024px) {
    .hero-section {
        margin-left: auto;  /* ✅ Switches at 1024px, not 1000px! */
    }
}
```

### **Real-World Impact**

**Without Media Query Extraction:**
- ❌ Sample at 1000px, miss the 1024px breakpoint
- ❌ Recreated site behaves differently (changes at wrong widths)
- ❌ Guessing breakpoints based on computed style changes
- ❌ Testing every pixel width to find exact transition points

**With Media Query Extraction:**
- ✅ Know exact breakpoints: 768px, 1024px, 1200px, etc.
- ✅ See complete responsive strategy at a glance
- ✅ Recreate with identical breakpoint behavior
- ✅ Understand responsive architecture, not just point-in-time styles

---

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ installed
- Puppeteer dependency

### **Install Dependencies**
```powershell
# If not already installed from other CSS extraction tools
npm install puppeteer
```

### **Download Tool**
```powershell
# Download from GitHub
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/tools/extract-media-queries.mjs" -OutFile "tools/extract-media-queries.mjs"

# Create tools directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "tools"
```

### **Add to package.json Scripts**
```json
{
  "scripts": {
    "analyze:media-queries": "node tools/extract-media-queries.mjs",
    "styles:complete": "npm run styles:responsive && npm run analyze:comprehensive && npm run analyze:media-queries"
  }
}
```

---

## 📖 **Usage Guide**

### **Basic Usage**
```powershell
# Extract all media queries from a website
node tools/extract-media-queries.mjs https://example.com
```

### **Filter by CSS Property**
```powershell
# Find when margin-left changes across breakpoints
node tools/extract-media-queries.mjs https://example.com --property margin-left

# Find when width changes
node tools/extract-media-queries.mjs https://example.com --property width
```

### **Filter by CSS Selector**
```powershell
# Find all media queries affecting .hero-section
node tools/extract-media-queries.mjs https://example.com --selector .hero-section

# Find all media queries affecting navigation
node tools/extract-media-queries.mjs https://example.com --selector .navbar
```

### **Combined Filters**
```powershell
# Find when .hero-section margin-left changes
node tools/extract-media-queries.mjs https://example.com --property margin-left --selector .hero-section
```

### **Save to Custom Location**
```powershell
# Save results to specific file
node tools/extract-media-queries.mjs https://example.com --output custom-output.json
```

### **Force Fresh Data (Bypass Cache)**
```powershell
# Ignore cached results and fetch fresh data
node tools/extract-media-queries.mjs https://example.com --force
```

---

## 📊 **Output Format**

### **Console Output**
```
═══════════════════════════════════════════════════════════════
                    MEDIA QUERY ANALYSIS
═══════════════════════════════════════════════════════════════

📊 SUMMARY:
   Total Media Queries: 28
   Unique Breakpoints: 480, 768, 1024, 1200px

📐 BREAKPOINT BREAKDOWN:

🔹 @media (max-width 768px):
   15 rule(s)

   .hero-section {
      margin-left: auto;
      margin-right: auto;
      padding: 2rem 1rem;
   }

   .navbar {
      flex-direction: column;
      height: auto;
   }

🔹 @media (min-width 1024px):
   8 rule(s)

   .container {
      max-width: 1200px;
   }
```

### **JSON Output**
```json
{
  "summary": {
    "totalMediaQueries": 28,
    "uniqueBreakpoints": [480, 768, 1024, 1200]
  },
  "mediaQueries": [
    {
      "condition": "screen and (max-width: 768px)",
      "breakpoint": 768,
      "type": "max-width",
      "rules": [
        {
          "selector": ".hero-section",
          "properties": {
            "margin-left": "auto",
            "margin-right": "auto",
            "padding": "2rem 1rem"
          }
        }
      ]
    }
  ],
  "breakpoints": {
    "max-width-768": [
      {
        "condition": "screen and (max-width: 768px)",
        "breakpoint": 768,
        "type": "max-width",
        "rules": [...]
      }
    ]
  }
}
```

---

## 🔄 **Integration with Existing Workflow**

### **Complete CSS Extraction Workflow**

```powershell
# 1. RESPONSIVE ANALYSIS - Sample computed styles at fixed widths
npm run styles:responsive -- https://example.com

# 2. COMPREHENSIVE ANALYSIS - Element positioning and layout
npm run analyze:comprehensive -- https://example.com

# 3. MEDIA QUERY EXTRACTION - Actual breakpoints from CSS (NEW!)
npm run analyze:media-queries -- https://example.com

# 4. STATIC CSS EXTRACTION - Color/font inventories
npm run styles:raw -- https://example.com
```

### **How They Complement Each Other**

| Tool | What It Reveals | When to Use |
|------|----------------|-------------|
| **Responsive Analysis** | Computed styles at 1400px, 1000px, 600px | Understand what styles look like at common widths |
| **Media Query Extraction** | Actual breakpoints: 768px, 1024px, 1200px | Understand when styles change and why |
| **Comprehensive Analysis** | Element positioning, layout structure | Understand spatial relationships |
| **Static CSS Extraction** | Color palettes, font inventories | Understand design system |

**Example Discovery:**
- Responsive analysis shows `margin-left: 325px` at 1000px and `auto` at 600px
- Media query extraction reveals the switch happens at 768px breakpoint
- You recreate with correct 768px breakpoint instead of guessing 800px

---

## 🎯 **Use Cases**

### **1. Find Exact Breakpoint for Specific Property**

**Problem**: Margin switches from `325px` to `auto` somewhere between 1000px and 600px, but where?

**Solution**:
```powershell
node tools/extract-media-queries.mjs https://example.com --property margin-left --selector .hero-section
```

**Result**: Shows exact breakpoint (e.g., 768px) where margin-left changes

---

### **2. Understand Complete Responsive Strategy**

**Problem**: Need to know all breakpoints used across entire site

**Solution**:
```powershell
node tools/extract-media-queries.mjs https://example.com
```

**Result**: Summary showing all unique breakpoints (e.g., 480px, 768px, 1024px, 1200px)

---

### **3. Analyze Component Responsive Behavior**

**Problem**: How does navigation component change across breakpoints?

**Solution**:
```powershell
node tools/extract-media-queries.mjs https://example.com --selector .navbar
```

**Result**: All media queries affecting `.navbar` with exact breakpoints and CSS changes

---

### **4. Validate Recreation Accuracy**

**Problem**: Recreated site doesn't match original responsive behavior

**Solution**:
1. Extract media queries from original site
2. Compare breakpoints to your recreation
3. Adjust your breakpoints to match original exactly

---

## ⚡ **Performance: Smart Caching**

### **Automatic Caching (24 Hours)**
- ✅ **First run**: Fetches fresh data, caches for 24 hours
- ✅ **Subsequent runs**: Instant results from cache
- ✅ **Cache location**: `.cache/media-queries/`

### **Cache Management**
```powershell
# Force fresh data (bypass cache)
node tools/extract-media-queries.mjs https://example.com --force

# Clear cache manually
Remove-Item -Recurse -Force .cache/media-queries/
```

### **Performance Comparison**
- **Fresh fetch**: ~5-10 seconds (Puppeteer load + CSS parsing)
- **Cached fetch**: ~0.5 seconds (instant from disk)
- **Speed improvement**: 10-20x faster with cache

---

## 📂 **Output File Organization**

### **Default Location**
```
analysis/
└── media-queries/
    └── 2025-10-21/
        └── example-com-media-queries.json
```

### **File Naming Convention**
- **Date-based subdirectories**: `YYYY-MM-DD/`
- **Domain-based filenames**: `example-com-media-queries.json`
- **Timestamped for version comparison**

### **Custom Output Location**
```powershell
# Save to specific location
node tools/extract-media-queries.mjs https://example.com --output custom/path/output.json
```

---

## 🔍 **Understanding the Output**

### **Breakpoint Types**

**min-width (Mobile-First)**:
```css
@media (min-width: 768px) {
    /* Styles applied at 768px and WIDER */
}
```

**max-width (Desktop-First)**:
```css
@media (max-width: 768px) {
    /* Styles applied at 768px and NARROWER */
}
```

### **Common Breakpoint Patterns**

**Bootstrap-style (common)**:
- `576px` - Small devices (landscape phones)
- `768px` - Medium devices (tablets)
- `992px` - Large devices (desktops)
- `1200px` - Extra large devices (large desktops)

**Tailwind CSS (common)**:
- `640px` - Small (sm)
- `768px` - Medium (md)
- `1024px` - Large (lg)
- `1280px` - Extra Large (xl)
- `1536px` - 2XL (2xl)

**Custom Breakpoints**:
Sites may use unique breakpoints based on content needs (e.g., 325px, 480px, 850px)

---

## 🚨 **Limitations & Considerations**

### **What This Tool Can Extract**
- ✅ Media queries in inline `<style>` tags
- ✅ Media queries in `<link>` stylesheets from same origin
- ✅ Width-based media queries (min-width, max-width)
- ✅ Complex media queries (orientation, resolution, etc.)

### **What This Tool Cannot Extract**
- ❌ Stylesheets from different origins (CORS blocked)
- ❌ JavaScript-generated styles (e.g., styled-components runtime)
- ❌ Container queries (@container)
- ❌ Styles loaded after page interaction (dynamic imports)

### **Workarounds for Limitations**

**For CORS-blocked stylesheets**:
- Download CSS files manually and analyze locally
- Use browser DevTools to copy CSS content

**For JavaScript-generated styles**:
- Use computed style analysis (responsive analysis tool) instead
- Extract styles after JavaScript execution

---

## 🎓 **Best Practices**

### **When to Use This Tool**

✅ **Use media query extraction when:**
- Recreating a website with responsive behavior
- Understanding why styles change at specific widths
- Validating your recreation matches original breakpoints
- Learning responsive architecture patterns
- Debugging responsive behavior mismatches

❌ **Don't use media query extraction when:**
- Site uses JavaScript for responsive behavior (use computed analysis)
- Need actual rendered styles (use responsive analysis)
- Analyzing container queries (not supported yet)

### **Workflow Integration**

**Step 1**: Run responsive analysis (computed styles at fixed widths)
```powershell
npm run styles:responsive -- https://example.com
```

**Step 2**: Notice style changes between sampled widths

**Step 3**: Run media query extraction to find exact breakpoint
```powershell
npm run analyze:media-queries -- https://example.com --property margin-left
```

**Step 4**: Recreate with exact breakpoints from extraction

---

## 🔧 **Troubleshooting**

### **No Media Queries Found**

**Problem**: Tool reports 0 media queries

**Possible Causes**:
1. Site uses JavaScript for responsive behavior
2. Stylesheets blocked by CORS
3. Styles loaded dynamically after page load

**Solution**:
- Check browser DevTools for media queries
- Try with `--force` to bypass cache
- Use responsive analysis (computed styles) instead

---

### **Incomplete Results**

**Problem**: Missing some media queries you know exist

**Possible Causes**:
1. External stylesheets from different origin
2. Dynamically loaded CSS
3. Inline styles without media queries

**Solution**:
- Check for CORS warnings in console
- Wait longer for page load (increase timeout)
- Combine with responsive analysis for complete picture

---

### **Cached Results Are Stale**

**Problem**: Results don't reflect recent site changes

**Solution**:
```powershell
# Force fresh data
node tools/extract-media-queries.mjs https://example.com --force

# Or clear cache manually
Remove-Item -Recurse -Force .cache/media-queries/
```

---

## 📚 **Examples**

### **Example 1: Find Margin Breakpoint**

**Scenario**: Need to know when `.hero-section` margin-left switches from 325px to auto

```powershell
node tools/extract-media-queries.mjs https://careington1.com --property margin-left --selector .hero-section
```

**Output**:
```
🔹 @media (max-width 1024px):
   1 rule(s)

   .hero-section {
      margin-left: auto;
   }
```

**Result**: Margin switches at 1024px, not the 1000px we sampled!

---

### **Example 2: Complete Site Breakpoint Strategy**

**Scenario**: Understand all breakpoints used across site

```powershell
node tools/extract-media-queries.mjs https://example.com
```

**Output**:
```
📊 SUMMARY:
   Total Media Queries: 42
   Unique Breakpoints: 480, 768, 1024, 1200px

📐 BREAKPOINT BREAKDOWN:
   @media (max-width 480px):  8 rules
   @media (max-width 768px):  15 rules
   @media (min-width 1024px): 12 rules
   @media (min-width 1200px): 7 rules
```

**Result**: Site uses 4-tier responsive strategy with standard breakpoints

---

### **Example 3: Navigation Component Analysis**

**Scenario**: How does navigation change across breakpoints?

```powershell
node tools/extract-media-queries.mjs https://example.com --selector .navbar
```

**Output**:
```
🔹 @media (max-width 768px):
   .navbar {
      flex-direction: column;
      height: auto;
      padding: 1rem;
   }

🔹 @media (min-width 1024px):
   .navbar {
      max-width: 1200px;
      justify-content: space-between;
   }
```

**Result**: Navigation switches to mobile layout at 768px, enhances at 1024px

---

## 🎯 **Key Takeaways**

### **What This Tool Solves**
- ✅ **Reveals exact breakpoints** instead of sampled widths
- ✅ **Shows responsive strategy** used by original developers
- ✅ **Prevents guesswork** in recreation
- ✅ **Validates recreations** match original behavior

### **When to Use**
- 🎯 After responsive analysis shows style changes
- 🎯 Before implementing responsive breakpoints in recreation
- 🎯 When debugging responsive behavior mismatches
- 🎯 To understand site's responsive architecture

### **Integration with Other Tools**
- **Responsive Analysis**: Shows computed styles at fixed widths (what styles look like)
- **Media Query Extraction**: Shows actual breakpoints (when styles change)
- **Together**: Complete responsive behavior picture

---

## 📖 **Related Documentation**

- **[CSS Extraction Toolkit](./css-extraction-toolkit.md)** - Complete CSS extraction workflow
- **[Responsive Analysis Methodology](./responsive-analysis-methodology.md)** - Multi-breakpoint computed style analysis
- **[Web Analysis Caching](./web-analysis-caching.md)** - Performance optimization with caching
- **[Text Element Analysis Enhancement](./text-element-analysis-enhancement.md)** - Capturing text-specific CSS

---

**Version**: 2.1.4  
**Status**: Production-ready tool with smart caching  
**Next Steps**: Integrate into complete CSS extraction workflow (v2.2.0)

---

**Last Modified**: 2025-10-22  
**Toolkit Version**: 1.1.0  
**Status**: Current
