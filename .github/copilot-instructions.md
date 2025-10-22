# Web Analysis Toolkit - Copilot Instructions

## Project Overview
This is a **Node.js CLI toolkit** for automated CSS extraction and responsive website analysis using Puppeteer. The project provides production-ready tools for pixel-perfect website recreation, featuring smart caching (30-60x performance boost), dual output formats (JSON + Markdown), and comprehensive breakpoint analysis.

**Technology Stack:**
- **Runtime**: Node.js >= 18.0.0
- **Browser Automation**: Puppeteer 23.3.0
- **Module System**: ESM (ECMAScript Modules) with `.mjs` extensions
- **Output Formats**: JSON (programmatic) + Markdown (human-readable) + Screenshots (PNG)
- **Architecture**: CLI-first design with npm script wrappers

## 🚨 **CRITICAL: FILE ORGANIZATION PROTOCOL**

**🚨 MANDATORY**: Never create files in project root unless they are:
- Configuration files (`package.json`, `.gitignore`, `.nvmrc`)
- Documentation (`README.md`, `CHANGELOG.md`, `LICENSE`)
- Entry points (none for this CLI toolkit)

**For all other files, create organized subdirectories:**

### **Source Code → `src/`**
```bash
# ❌ WRONG: Creating in project root
touch new-analyzer.mjs

# ✅ CORRECT: Organized location
mkdir -p src/analyzers
touch src/analyzers/new-analyzer.mjs
```

### **Analysis Outputs → `analysis/`**
```bash
# ❌ WRONG: Screenshots in root
screenshot1.png

# ✅ CORRECT: Organized with context
mkdir -p analysis/screenshots
# Saves: analysis/screenshots/mobile-menu-before.png
```

### **Documentation → `docs/`**
```bash
# ❌ WRONG: Guide in root
touch usage-guide.md

# ✅ CORRECT: Organized by type
mkdir -p docs/guides
touch docs/guides/usage-guide.md
```

### **Tests → `tests/`**
```bash
# ❌ WRONG: Test in src/
touch src/test-analyzer.mjs

# ✅ CORRECT: Dedicated test directory
mkdir -p tests
touch tests/test-analyzer.mjs
```

### **Standard Directory Structure**
```
web-analysis-toolkit/
├── src/
│   ├── analyzers/           # Analysis tools (mobile-menu, interactive-states, etc.)
│   ├── extractors/          # Extraction tools (css, fonts, media-queries, etc.)
│   └── utils/               # Shared utilities (caching, puppeteer, reporting)
├── tests/                   # Test scripts and validation
├── analysis/                # Generated outputs
│   ├── screenshots/         # PNG screenshots
│   ├── reports/            # Markdown reports
│   └── data/               # JSON data files
├── .cache/                 # Cached web data (gitignored, auto-created)
├── docs/
│   ├── guides/             # User guides and tutorials
│   ├── api/                # API documentation
│   ├── examples/           # Example outputs and use cases
│   └── roadmap/            # Version planning and features
├── examples/               # Example usage scripts
└── scripts/                # Utility scripts (future automation)
```

**📖 Complete Guide**: See existing project structure - follow established patterns.

**Before creating ANY file, ask**: "Does this belong in project root, or should it have its own organized location?"

## 🚨 CRITICAL: NO SHORTCUTS FROM DAY ONE

**MANDATORY ENGINEERING STANDARDS - NO EXCEPTIONS**

**The Real-World Testing Lesson**: This toolkit was born from actual website recreation projects (dental-static and others) where manual inspection was costing 30+ minutes per site. Every tool in this project must solve a real problem discovered during pixel-perfect website recreation.

**Production-Ready From Day One Rule**: If a tool doesn't save significant time or eliminate manual work, don't add it. Every analyzer and extractor must be immediately useful in real-world projects.

**NEVER implement without:**
1. **Real Use Case Validation**: Tool addresses actual pain point from website recreation
2. **Dual Output Format**: Both JSON (programmatic) and Markdown (human-readable)
3. **Smart Caching**: 24-hour cache with `--force` override for performance
4. **Error Handling**: Graceful failures with helpful error messages
5. **Documentation**: Usage guide in `docs/guides/` with real examples

**The "Just Add a Feature" Trap - AVOID:**
- ❌ "We'll add documentation later" → Undocumented features don't get used
- ❌ "JSON output is enough" → Humans need Markdown for quick review
- ❌ "Caching can wait" → Users won't tolerate 60-second re-runs
- ❌ "It works on one site, ship it" → Edge cases kill production usage

## 📚 **REFERENCE: TQFA Best Practices (GitHub Direct Access)**

**🌐 Primary Repository**: `https://github.com/Texas-Quantitative/tqfa-development-best-practices`

**📖 Core Documentation (Always Current from GitHub)**:
- **[Main Overview](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/README.md)** - Essential principles and quick reference
- **[Best Practices Guide](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/docs/best-practices/README.md)** - Navigation and architecture principles
- **[Project Organization](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/docs/best-practices/project-organization.md)** - File structure standards
- **[Scripts & Tools](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/docs/best-practices/scripts-and-tools.md)** - Automation patterns
- **[Troubleshooting](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/docs/best-practices/troubleshooting.md)** - Common issues and solutions

**🎯 Agent Workflow**:
1. **Check accessibility**: Verify GitHub connection if links fail
2. **Reference specific guides**: Use direct links above for current project context
3. **Apply lessons**: Follow architectural principles adapted to Node.js/CLI context
4. **Adapt patterns**: TQFA is Python/FastAPI, this is Node.js/Puppeteer - adapt concepts, not code

**When to Reference Each Guide**:
- **Architecture decisions** → README.md core principles
- **New tool development** → Project organization for file placement
- **Automation needs** → Scripts & tools for patterns (adapt to Node.js)
- **Complex issues** → Troubleshooting for problem-solving approaches

## 🎨 **WEB ANALYSIS TOOLKIT - USAGE & DEVELOPMENT**

### **Core Philosophy**
This toolkit exists to **eliminate manual CSS inspection and guesswork** during website recreation. Every tool must:
- Save ≥30 minutes vs manual inspection
- Provide pixel-perfect accuracy
- Work reliably across different sites
- Output both machine-readable (JSON) and human-readable (Markdown) formats

### **⚡ PERFORMANCE: Smart Caching (MANDATORY)**
**ALL tools include automatic caching for 30-60x speed improvement:**
- ✅ **Instant results** from cache vs 30-60 seconds fresh fetch
- ✅ **Offline development** with cached data when network unavailable
- ✅ **Bot detection avoidance** with minimal web requests
- ✅ **Force refresh** option: Add `--force` to any command for fresh data
- ✅ **Cache management**: Add `--clear-cache` to clear existing cache

**Cache Implementation Pattern:**
```javascript
// Example from existing tools
const cacheKey = `${url}_${breakpoint}`;
const cached = cache.get(cacheKey);
if (cached && !force) {
    console.log('Using cached data...');
    return cached;
}
// ... fetch fresh data ...
cache.set(cacheKey, data);
```

### **Available Tools & Commands**

```bash
# Run from web-analysis-toolkit directory

# 1. Responsive behavior analysis across breakpoints
npm run analyze:responsive -- https://target-site.com
npm run analyze:responsive -- https://target-site.com --force    # Force fresh data

# 2. Comprehensive element detection and positioning
npm run analyze:comprehensive -- https://target-site.com

# 3. Extract CSS media query breakpoints (finds exact responsive trigger points)
npm run extract:media-queries -- https://target-site.com
npm run extract:media-queries -- https://target-site.com --property margin-left  # Filter by CSS property

# 4. Get computed styles actually applied to elements
npm run extract:computed -- https://target-site.com

# 5. Analyze specific elements and components
npm run analyze:elements -- https://target-site.com ".navbar"

# 6. Extract all CSS files and create color/font inventories
npm run extract:static-css -- https://target-site.com

# 7. NEW v1.1.0: Mobile menu/modal analyzer
npm run analyze:mobile-menu -- https://target-site.com --breakpoint 767

# 8. NEW v1.1.0: Interactive element state analyzer
npm run analyze:interactive -- https://target-site.com

# 9. NEW v1.1.0: Relative positioning calculator
npm run analyze:positioning -- https://target-site.com --selector ".hero-section"

# 10. NEW v1.1.0: Font file analyzer and downloader
npm run extract:fonts -- https://target-site.com
npm run extract:fonts -- https://target-site.com --download  # Download font files

# 11. Run complete analysis suite
npm run analyze:complete -- https://target-site.com
```

### **When to Use Each Tool**

**Start Every Website Recreation Project With:**
1. `analyze:responsive` - MANDATORY FIRST - Find breakpoints and layout shifts
2. `analyze:comprehensive` - MANDATORY SECOND - Detect elements and positioning
3. `extract:media-queries` - Find exact CSS breakpoints and property changes

**For Specific Challenges:**
- **Mobile navigation issues** → `analyze:mobile-menu` (hamburger menus, slide-ins)
- **Spacing/alignment problems** → `analyze:positioning` (gaps, overlaps, negative margins)
- **Interactive elements** → `analyze:interactive` (hover, focus, active states)
- **Font rendering** → `extract:fonts` (discovers font-family vs font-weight patterns)
- **Color palette** → `extract:static-css` (hex colors, font weights, spacing)

### **Development Workflow Standards**

**When Adding New Analyzers/Extractors:**
1. **Identify real pain point**: What manual work takes >30 minutes?
2. **Check existing tools**: Can current tool be extended vs creating new one?
3. **Follow naming conventions**: `src/analyzers/feature-name.mjs` or `src/extractors/feature-name.mjs`
4. **Implement core pattern**:
   - CLI argument parsing
   - Puppeteer browser launch
   - Smart caching integration
   - Dual output (JSON + Markdown)
   - Screenshot capture (if visual)
   - Error handling
5. **Add npm script**: Update `package.json` with `"tool:name": "node src/path/tool.mjs"`
6. **Write guide**: Create `docs/guides/feature-name.md` with real examples
7. **Update README**: Add to features list and tools table
8. **Update CHANGELOG**: Document in appropriate version section

**Code Style Standards:**
- **Use ESM modules**: `export` and `import`, not `require()`
- **File extension**: Always `.mjs` for consistency
- **Async/await**: Use modern async patterns, not callbacks
- **Descriptive names**: `analyzeMobileMenu()` not `analyze()`, `extractFontFiles()` not `extract()`
- **Error messages**: Helpful and actionable, not generic
- **Comments**: Explain WHY, not WHAT (code should be self-documenting)

**Puppeteer Best Practices:**
- **Headless by default**: Use `headless: "new"` for speed
- **Viewport standardization**: Common breakpoints: 375, 768, 1024, 1440
- **Wait for network idle**: `page.goto(url, { waitUntil: 'networkidle0' })`
- **Clean up resources**: Always `await browser.close()` in finally block
- **Screenshot timing**: Capture AFTER layout stabilizes

### **Output Format Standards**

**JSON Output Structure:**
```javascript
{
    "url": "https://example.com",
    "timestamp": "2024-01-21T10:30:00Z",
    "toolVersion": "1.1.0",
    "data": {
        // Tool-specific results
    },
    "metadata": {
        "cacheUsed": false,
        "executionTime": "2.3s"
    }
}
```

**Markdown Report Structure:**
```markdown
# Tool Name Analysis Report

**URL**: https://example.com
**Date**: 2024-01-21 10:30:00
**Cache Used**: No

## Summary
[High-level findings]

## Detailed Findings
[Organized sections with specifics]

## Recommendations
[Actionable next steps]

## Screenshots
[References to PNG files]
```

### **Key Benefits to Mention**
- ✅ **90% faster** than manual CSS inspection
- ✅ **Pixel-perfect accuracy** - exact hex colors, font weights, dimensions
- ✅ **Complete automation** - extracts all styling data systematically
- ✅ **No guesswork** - eliminates visual approximation errors
- ✅ **Smart caching** - 30-60x performance boost for iterative work
- ✅ **Dual output** - JSON for code, Markdown for humans

### **Reference Documentation**
- **[Toolkit Main Repository](https://github.com/Texas-Quantitative/web-analysis-toolkit)** - Main overview and quick start
- **[Installation Guide](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/INSTALLATION.md)** - Detailed setup instructions
- **[Quick Start Guide](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/QUICK_START.md)** - Get running in 5 minutes
- **[CSS Extraction Guide](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/css-extraction.md)** - Complete implementation guide
- **[Media Query Extraction](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/media-queries.md)** - Extract actual CSS breakpoints
- **[Mobile Navigation Guide](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/mobile-navigation.md)** - Analyze hamburger menus and modals
- **[Iterative Refinement Guide](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/iterative-refinement.md)** - Pixel-perfect spacing workflow
- **[Web Analysis Caching](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/caching.md)** - Performance optimization (30-60x faster)
- **[Responsive Analysis](https://github.com/Texas-Quantitative/web-analysis-toolkit/blob/main/docs/guides/responsive-analysis.md)** - Multi-breakpoint methodology

### **🔬 Toolkit Enhancement Feedback Protocol**

**CRITICAL: Document Toolkit Limitations and Missing Capabilities**

When working with the Web Analysis Toolkit, **capture and report gaps** to improve future versions:

**What to Document:**
1. **Missing Tools**: Features you needed but had to create manually
   - Example: "Needed mobile menu/modal analyzer - manually inspected hamburger behavior at 767px"
   
2. **Manual Workarounds**: Tasks that required custom scripts or manual inspection
   - Example: "Created custom positioning calculator to find exact pixel positions and negative margins"
   
3. **Iterative Pain Points**: Repetitive tasks that consumed significant time
   - Example: "20+ spacing iterations for section height, image margins - no tool to assist"
   
4. **Unexpected Discoveries**: Things current tools missed
   - Example: "Font-family uses actual file names (MontserratBold) not CSS font-weight declarations"

**How to Report:**

Create enhancement recommendations in issues or `docs/roadmap/`:

```markdown
## Web Analysis Toolkit Enhancement Recommendations
### From: [Project Name] - [Date]

### 1. [Tool Name] - [Priority: HIGH/MEDIUM/LOW]
**Purpose**: [What it should do]

**Gap Identified**: [What current tools don't handle]

**Use Case**: [Specific example from this project]

**Implementation Hints**: 
- [Key technical details]
- [Selector patterns discovered]
- [Output format needed]

**Example Output**: [What the tool should produce]
```

**When to Create Recommendations:**
- ✅ After completing any website recreation project using the toolkit
- ✅ When you create custom analysis scripts 3+ times
- ✅ When manual inspection takes >30 minutes
- ✅ When you discover toolkit output was inaccurate

**Real Example - Mobile Menu Analyzer Recommendation:**
```
During dental-static project, spent 45 minutes manually inspecting:
- Hamburger menu breakpoint (767px)
- Modal slide-in positioning (right: 0, width: 75%, max-width: 280px)
- Animation properties (transform, transition timing)
- SVG icon source and styling

Current toolkit has NO tool for interactive components requiring clicks.
Needed: analyzeMobileMenu(url, breakpoint) that clicks hamburger and extracts 
modal positioning, dimensions, animations automatically.
```

**Why This Matters:**
- Improves toolkit for entire community
- Prevents future developers from repeating same manual work
- Creates competitive advantage through better tooling
- Documents real-world usage patterns

## 🏗️ **ARCHITECTURAL BEST PRACTICES - PREVENT CODE DUPLICATION**

**CRITICAL: Always Extend, Never Duplicate**

**The Duplicate Method Anti-Pattern**: Creating new tools instead of extending existing ones leads to code bloat, maintenance burden, and architectural complexity.

**MANDATORY BEFORE ADDING NEW TOOLS:**
1. **Analyze Existing Tools**: Can current tool be extended with optional parameters?
2. **Check for Similar Logic**: Are you recreating functionality that already exists?
3. **Consider Backward Compatibility**: Can you add features without breaking existing callers?
4. **Evaluate Architecture Impact**: Will this create unnecessary complexity?

**✅ RIGHT APPROACH - EXTEND EXISTING:**
```javascript
// GOOD: Extend existing analyzer with optional parameter
export async function analyzeResponsive(
    url, 
    breakpoints = [375, 768, 1024, 1440],
    customSelector = null  // ← Added optional parameter
) {
    // Function handles both cases
}
```

**❌ WRONG APPROACH - CREATE DUPLICATES:**
```javascript
// BAD: Duplicate function with slight variation
export async function analyzeResponsiveWithSelector(  // ← Unnecessary new function
    url, 
    breakpoints,
    customSelector
) {
    // Duplicates existing logic
}
```

**ARCHITECTURAL DECISION CHECKLIST:**
- [ ] **Can I add an optional parameter instead of a new tool?**
- [ ] **Does this duplicate existing logic?**
- [ ] **Will existing scripts continue to work unchanged?**
- [ ] **Am I solving the problem at the right architectural layer?**
- [ ] **Have I considered the maintenance burden of multiple similar tools?**

**RED FLAGS - STOP AND REFACTOR:**
- Creating tools with names like `tool-name-and-something`
- Copy-pasting function bodies with minor changes
- Adding new npm scripts when existing ones could handle the use case
- Functions that differ only in parameter count or types

**The Lesson**: Code duplication is technical debt with compound interest. Always look for extension opportunities before creating new functionality.

## Code Standards & Practices

### JavaScript/Node.js Style
- Follow modern ES6+ conventions
- Use `const` by default, `let` when reassignment needed, never `var`
- Use descriptive variable and function names (`analyzeElement` not `analyze`)
- Add JSDoc comments to all exported functions
- Prefer template literals for string formatting
- Use async/await over promises/callbacks
- Destructure objects and arrays for clarity

### Module System
- **Always use ESM** (`import`/`export`, not `require`/`module.exports`)
- **Always use `.mjs` extension** for consistency
- Export named functions, not default exports (better for tree-shaking)
- Keep one main function per file (e.g., `analyzeMobileMenu.mjs` exports `analyzeMobileMenu()`)

### Error Handling
- Use try/catch for async operations
- Provide helpful error messages with context
- Always clean up resources (close browser) in finally blocks
- Log errors with enough detail for debugging
- Don't swallow errors - let them propagate or handle meaningfully

### Documentation
- Update README.md when adding new features
- Create guide in `docs/guides/` for complex features
- Include real-world examples in documentation
- Add inline comments for complex logic only (code should be self-documenting)
- Keep CHANGELOG.md current with version updates

### Testing Standards
- Test tools on multiple websites (not just one)
- Verify both JSON and Markdown outputs
- Test cache behavior (fresh fetch vs cached)
- Test error cases (invalid URLs, network failures, missing elements)
- Document edge cases discovered during testing

## 🤔 **ARCHITECTURAL DECISION PROTOCOL**

**MANDATORY: Consult Before Major Changes**

**When to Ask the Human First:**
- Creating new analyzers/extractors when existing ones might suffice
- Adding new output formats or changing existing formats
- Implementing features that require significant architectural changes
- Uncertain whether to extend existing functionality vs create new tool
- Adding new dependencies or external service integrations
- Changing core patterns (caching, output, CLI argument parsing)

**The Question to Always Ask:**
> "I'm considering [specific change]. Should I extend the existing [tool/module] or create a new one? What's the preferred approach here?"

**Why This Matters:**
- Prevents architectural drift and code bloat
- Maintains consistency with established patterns
- Avoids duplicate implementations that create maintenance burden
- Ensures new code aligns with long-term toolkit vision

## 🎨 **PROACTIVE CSS EXTRACTION PROTOCOL**

**MANDATORY: Offer toolkit usage for website recreation tasks**

**Automatically Suggest Toolkit When User Mentions:**
- "Make this look like [website URL]"
- "Copy the design from [website]"
- "Recreate [website] styling"
- "What colors does [website] use?"
- "Match the fonts from [website]"
- "How does [website] handle responsive design?"
- "What are the breakpoints for [website]?"
- Any website recreation, competitive analysis, or design extraction

**Standard Response Template:**
> "I can extract exact CSS specifications and responsive behavior patterns from that website using the Web Analysis Toolkit. This includes multi-breakpoint responsive analysis (critical for modern sites) plus precise colors, fonts, dimensions, and spacing. Should I run the extraction tools and analyze [website URL] for complete styling and responsive data?"

**Follow-up Actions:**
1. **Run responsive analysis**: `npm run analyze:responsive -- [URL]`
2. **Run comprehensive analysis**: `npm run analyze:comprehensive -- [URL]`
3. **Extract media queries**: `npm run extract:media-queries -- [URL]`
4. **Present findings**: Show exact colors, fonts, dimensions from analysis
5. **Apply systematically**: Use extracted data for pixel-perfect recreation

**Why This Matters:**
- Prevents hours of manual CSS inspection and guesswork
- Ensures pixel-perfect accuracy instead of "close enough" approximations
- Demonstrates proactive problem-solving with available tools
- Aligns with "no shortcuts from day one" philosophy

## 🔄 **CONVERSATION CONTINUITY MANAGEMENT**

**MANDATORY: Token Budget Monitoring**

**Check token usage periodically during long sessions and warn if needed.**

### **Warning Thresholds**

Use the EXACT numbers from system warnings:

**🟡 YELLOW ALERT (500k-700k tokens):**
> "💭 **Token Budget Notice**: Current session usage is approaching 500k+ tokens. We're building significant context. Consider requesting a handoff summary if you're planning major additional work."

**🟠 ORANGE ALERT (700k-900k tokens):**
> "⚠️ **Token Budget Warning**: Current session usage is 700k+ tokens. **Recommend requesting a handoff summary soon** to avoid unexpected summarization during critical work."

**🔴 RED ALERT (900k+ tokens):**
> "🚨 **TOKEN BUDGET CRITICAL**: Current session usage is 900k+ tokens. **Strongly recommend creating a handoff summary NOW** before continuing. Auto-summarization could interrupt at any moment during complex operations."

### **User-Requested Handoff Summary Template**

When user requests handoff (or you recommend it), provide:

1. **Session Overview**
   - What was accomplished
   - Current state of all work streams
   
2. **Completed Work**
   - Files created/modified with descriptions
   - Tools developed and why
   - Documentation updated

3. **Pending Tasks**
   - What's started but incomplete
   - What's next in logical sequence
   - Any blockers or decisions needed

4. **Critical Context**
   - Important decisions made
   - Patterns established
   - Real-world examples discovered
   - Edge cases to remember

5. **Exact Resume Commands**
   - How to verify current state
   - Next steps to execute
   - Files to review

6. **File States**
   - What's committed vs uncommitted
   - What's been tested
   - What needs validation

### **Why This Protocol Matters**

**The Auto-Summarization Problem:**
- Happens without warning at ~1M tokens
- Interrupts mid-task at worst possible times
- Can take 5+ minutes during critical operations
- May lose nuanced context in automated summary

**The Proactive Monitoring Solution:**
- Warnings at natural breakpoints
- User maintains control over session transitions
- Critical context preserved in deliberate handoff
- Smooth continuation across agent sessions

## Development Workflow

- Use Node.js >= 18.0.0 (check with `node --version`)
- Install dependencies with `npm install`
- Run tools using npm scripts (e.g., `npm run analyze:responsive -- https://example.com`)
- Test on multiple websites to ensure robustness
- Follow existing output directory structure (`analysis/`, `.cache/`)
- **Always test tools locally before committing**

## Dependencies

**Current (package.json):**
- puppeteer: 23.3.0 - Browser automation
- chalk: 5.3.0 - Terminal color output
- Node.js >= 18.0.0 - Runtime requirement

**When Adding Dependencies:**
- Prefer minimal, well-maintained packages
- Avoid dependencies with many sub-dependencies
- Check npm download stats and maintenance status
- Document WHY dependency is needed in commit message

## 📋 **VERSION MANAGEMENT**

**Current Version**: 1.1.0 (see package.json)

**Semantic Versioning:**
- **Patch bumps** (1.1.X): Bug fixes, documentation updates, minor tweaks
- **Minor bumps** (1.X.0): New analyzers/extractors, new features, backward-compatible changes
- **Major bumps** (X.0.0): Breaking changes, architecture overhauls, API changes

**Before Version Bump:**
1. Update CHANGELOG.md with all changes in new version section
2. Update package.json version field
3. Test all tools to ensure no breaking changes
4. Update documentation to reflect new features
5. Commit with message: "Release vX.Y.Z - [brief description]"

**Version Tracking Files:**
- `package.json` - Main version source
- `CHANGELOG.md` - Version history and changes
- `docs/roadmap/vX.Y.Z.md` - Planned features (for future versions)

## 📚 **ESSENTIAL PROJECT FILES**

**Must Read Before Contributing:**
- `README.md` - Project overview, features, quick start
- `QUICK_START.md` - 5-minute setup guide
- `INSTALLATION.md` - Detailed installation instructions
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - Version history and what's new

**Must Update When Adding Features:**
- `README.md` - Features list, tools table, use cases
- `CHANGELOG.md` - Add to "Unreleased" or new version section
- `docs/guides/[feature-name].md` - Create detailed guide
- `package.json` - Add npm script for new tool

**Reference During Development:**
- `docs/guides/` - Existing patterns and examples
- `src/analyzers/` - Analyzer implementation patterns
- `src/extractors/` - Extractor implementation patterns
- `examples/` - Real-world usage examples

## 🎯 **QUICK REFERENCE: COMMON TASKS**

**Creating a New Analyzer:**
1. Create `src/analyzers/feature-name.mjs`
2. Implement main function with Puppeteer
3. Add caching support (see existing tools)
4. Generate JSON + Markdown output
5. Add npm script to package.json
6. Create `docs/guides/feature-name.md`
7. Update README.md features and tools table
8. Update CHANGELOG.md

**Creating a New Extractor:**
1. Create `src/extractors/feature-name.mjs`
2. Implement extraction logic
3. Add caching support
4. Generate structured output (JSON + Markdown)
5. Add npm script to package.json
6. Document in appropriate guide
7. Update README.md

**Testing a Tool:**
```bash
# Test with real website
npm run analyze:feature -- https://example.com

# Test with cache
npm run analyze:feature -- https://example.com

# Test fresh fetch
npm run analyze:feature -- https://example.com --force

# Test cache clearing
npm run analyze:feature -- https://example.com --clear-cache
```

**Debugging Puppeteer Issues:**
```javascript
// Show browser window (headful mode)
const browser = await puppeteer.launch({ 
    headless: false,  // Change from "new" to false
    devtools: true    // Opens DevTools automatically
});

// Add debugging screenshots
await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });

// Log page errors
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
```

---

**Last Modified**: 2024-01-21
**Toolkit Version**: 1.1.0
**For Updates**: See https://github.com/Texas-Quantitative/web-analysis-toolkit
