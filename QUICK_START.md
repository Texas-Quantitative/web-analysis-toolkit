# Quick Start Guide

Get up and running with the Web Analysis Toolkit in 5 minutes.

## 1. Installation (2 minutes)

```bash
git clone https://github.com/Texas-Quantitative/web-analysis-toolkit.git
cd web-analysis-toolkit
npm install
```

**Done!** The toolkit is ready to use.

## 2. Your First Analysis (1 minute)

Let's extract media queries from a website:

```bash
npm run extract:media-queries -- https://example.com
```

**What just happened?**
- Extracted all CSS media queries from example.com
- Found exact breakpoints (e.g., 768px, 992px, 1200px)
- Saved results to `analysis/media-queries/YYYY-MM-DD/example-com-media-queries.json`
- Cached data for instant future access

## 3. Complete Site Analysis (2 minutes)

Run the full analysis suite:

```bash
npm run analyze:complete -- https://example.com
```

**This runs 4 tools in sequence:**
1. **Responsive Analysis** → Checks 7 viewport sizes (mobile → desktop)
2. **Comprehensive Analysis** → Identifies sections, typography, layout
3. **Media Query Extraction** → Finds actual CSS breakpoints
4. **Computed Styles** → Gets real applied styles

**Output locations:**
- `orig/_responsive-analysis.json` - Responsive data
- `orig/_comprehensive-analysis.json` - Site structure
- `analysis/media-queries/...` - Media queries
- `orig/_computed-style-inventory.json` - Computed styles

## 4. View Results (30 seconds)

```bash
# View human-readable report
cat orig/_responsive-report.md

# Or on Windows
type orig\_responsive-report.md

# Open JSON in your editor
code orig/_comprehensive-analysis.json
```

## Common Commands Reference

### Media Query Extraction

```bash
# Extract all media queries
npm run extract:media-queries -- https://example.com

# Filter by property
npm run extract:media-queries -- https://example.com --property margin-left

# Filter by selector
npm run extract:media-queries -- https://example.com --selector .navbar
```

### Responsive Analysis

```bash
# Analyze across 7 breakpoints
npm run analyze:responsive -- https://example.com

# Force fresh data (bypass cache)
npm run analyze:responsive -- https://example.com --force
```

### Comprehensive Analysis

```bash
# Get complete site structure
npm run analyze:comprehensive -- https://example.com

# Includes: sections, typography, grids, flex, forms, backgrounds
```

### Element-Specific Analysis

```bash
# Analyze specific components
npm run analyze:elements -- https://example.com ".navbar"
npm run analyze:elements -- https://example.com "h1, h2, h3"
npm run analyze:elements -- https://example.com "button, .btn"
```

### Static CSS Extraction

```bash
# Extract all CSS files and create inventories
npm run extract:static-css -- https://example.com

# Output: orig/_style-inventory.json with colors & fonts
```

### Computed Styles

```bash
# Get actually-applied styles (uses Puppeteer)
npm run extract:computed -- https://example.com

# Output: orig/_computed-style-inventory.json
```

## Real-World Example

**Goal:** Recreate the navigation bar from careington1.com

```bash
# Step 1: Get complete analysis
npm run analyze:complete -- https://careington1.com

# Step 2: Deep-dive on navigation
npm run analyze:elements -- https://careington1.com ".navbar"

# Step 3: Check responsive behavior
npm run extract:media-queries -- https://careington1.com --selector .navbar

# Step 4: Review results
cat orig/_element-analysis-_navbar.json
```

**Now you have:**
- ✅ Exact colors, fonts, spacing for navigation
- ✅ Responsive breakpoints where navigation changes
- ✅ Complete computed styles for all nav elements
- ✅ Layout method (flex/grid) and properties

## Understanding Output Files

### JSON Files
- **Comprehensive Analysis** → `orig/_comprehensive-analysis.json`
  - Section detection, typography hierarchy, layout analysis
  
- **Responsive Analysis** → `orig/_responsive-analysis.json`
  - Viewport-by-viewport layout data
  
- **Media Queries** → `analysis/media-queries/.../site-media-queries.json`
  - Actual CSS breakpoints and rules
  
- **Element Analysis** → `orig/_element-analysis-[selector].json`
  - Deep component styling

### Markdown Reports
- **Responsive Report** → `orig/_responsive-report.md`
  - Human-readable responsive patterns
  
- **Comprehensive Report** → `orig/_comprehensive-report.md`
  - Site structure breakdown

### Visual Documentation
- **Screenshots** → `orig/_comprehensive-analysis-screenshot.png`
  - Full-page captures with analysis

## Performance Tips

### Smart Caching

The toolkit caches results for 24 hours:

```bash
# First run: 30-60 seconds
npm run analyze:responsive -- https://example.com

# Second run: ~1 second (cached!)
npm run analyze:responsive -- https://example.com

# Force fresh data
npm run analyze:responsive -- https://example.com --force
```

### Batch Processing

Analyze multiple sites:

```bash
# Create a script
for site in example.com github.com stackoverflow.com
do
  npm run analyze:complete -- https://$site
done
```

## Next Steps

Now that you've run your first analyses:

1. **[Complete Workflow](docs/guides/WORKFLOW.md)** - End-to-end website recreation
2. **[Tool Reference](docs/guides/TOOL_REFERENCE.md)** - Detailed command documentation
3. **[Media Query Guide](docs/guides/media-queries.md)** - Understanding breakpoints
4. **[Caching Guide](docs/guides/caching.md)** - Performance optimization

## Troubleshooting

### Issue: "Command not found"

**Problem:** `npm: command not found` or similar

**Solution:**
```bash
# Verify Node.js and npm are installed
node --version  # Should be v18.0.0+
npm --version   # Should be v8.0.0+

# Not installed? Download from https://nodejs.org/
```

### Issue: "Module not found"

**Problem:** `Error: Cannot find module 'puppeteer'`

**Solution:**
```bash
# Re-install dependencies
rm -rf node_modules
npm install
```

### Issue: Slow first run

**Problem:** First analysis takes 30-60 seconds

**Solution:** This is normal! The toolkit:
1. Downloads the webpage
2. Analyzes styles across multiple viewports
3. Generates reports

**Second run will be ~1 second (cached)**

### Issue: Empty results

**Problem:** Analysis completes but files are empty

**Solution:**
```bash
# Check if site blocks automation
npm run analyze:comprehensive -- https://example.com

# Try with different user agent or wait time
# (Advanced - see Tool Reference docs)
```

## Common Patterns

### Pattern: Extract Only What You Need

Don't run the full suite if you only need media queries:

```bash
# ❌ Overkill for media queries only
npm run analyze:complete -- https://example.com

# ✅ Just what you need
npm run extract:media-queries -- https://example.com
```

### Pattern: Progressive Analysis

Start broad, then drill down:

```bash
# 1. Get overview
npm run analyze:comprehensive -- https://example.com

# 2. Check responsive behavior
npm run analyze:responsive -- https://example.com

# 3. Deep-dive on specific elements
npm run analyze:elements -- https://example.com ".hero-section"
```

### Pattern: Compare Before/After

Track changes over time:

```bash
# Analyze original
npm run analyze:complete -- https://original.com
mv analysis/media-queries/YYYY-MM-DD analysis/original-baseline

# Analyze redesign
npm run analyze:complete -- https://redesign.com
mv analysis/media-queries/YYYY-MM-DD analysis/redesign-comparison

# Compare JSON files
```

---

**Questions?** Check the [full documentation](README.md) or [open an issue](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues).

**Ready for more?** See the [Complete Workflow Guide](docs/guides/WORKFLOW.md) for end-to-end website recreation.
