# Web Analysis Toolkit

> **Comprehensive CSS extraction, responsive analysis, and media query extraction tools for pixel-perfect website recreation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 🎯 What is This?

The Web Analysis Toolkit is a comprehensive suite of automated tools that extract exact CSS specifications, analyze responsive behavior patterns, and reveal actual media query breakpoints from any website. No more guessing hex codes, approximating font sizes, or missing responsive breakpoints—get pixel-perfect accuracy for professional website recreation.

## ✨ Key Features

- **🎨 CSS Extraction**: Extract all colors, fonts, typography, and styling from any website
- **📐 Responsive Analysis**: Analyze layout transformations across 7 standard breakpoints (mobile → desktop)
- **🔍 Media Query Extraction**: Discover actual CSS breakpoints where properties change
- **📱 Mobile Menu Analysis**: **NEW** - Detect hamburger menus, analyze modals, extract animations
- **🖱️ Interactive States**: **NEW** - Capture hover, focus, active states and transitions
- **📏 Relative Positioning**: **NEW** - Calculate exact pixel positions, gaps, and overlaps
- **🔤 Font File Extraction**: **NEW** - Download actual font files with weight/style mappings
- **💾 Smart Caching**: 30-60x performance improvement with automatic 24-hour caching
- **📊 Computed Styles**: Get actual applied styles (not just raw CSS files)
- **🎯 Element-Specific**: Deep analysis of specific components and elements
- **📸 Visual Documentation**: Automatic full-page screenshots with analysis

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/Texas-Quantitative/web-analysis-toolkit.git
cd web-analysis-toolkit
npm install
```

### Basic Usage

```bash
# Run complete analysis suite
npm run analyze:complete -- https://example.com

# Extract media query breakpoints
npm run extract:media-queries -- https://example.com

# Analyze responsive behavior
npm run analyze:responsive -- https://example.com

# Get comprehensive site analysis
npm run analyze:comprehensive -- https://example.com
```

## 📚 Documentation

- **[Installation Guide](docs/guides/INSTALLATION.md)** - Detailed setup instructions
- **[Quick Start Guide](docs/guides/QUICK_START.md)** - Get up and running in 5 minutes
- **[Complete Workflow](docs/guides/WORKFLOW.md)** - End-to-end website recreation workflow
- **[Tool Reference](docs/guides/TOOL_REFERENCE.md)** - Complete command reference
- **[Media Query Extraction](docs/guides/media-queries.md)** - Find exact responsive breakpoints
- **[Responsive Analysis](docs/guides/responsive-analysis.md)** - Multi-breakpoint methodology
- **[Mobile Navigation](docs/guides/mobile-navigation.md)** ⭐ NEW - Hamburger menus and modal analysis
- **[Iterative Refinement](docs/guides/iterative-refinement.md)** ⭐ NEW - Pixel-perfect spacing adjustments
- **[Caching System](docs/guides/caching.md)** - Performance optimization guide

## 🛠️ Available Tools

### Extractors (Get Raw Data)

| Tool | Command | Purpose |
|------|---------|---------|
| **Media Queries** | `npm run extract:media-queries` | Extract actual CSS breakpoints |
| **Static CSS** | `npm run extract:static-css` | Get all CSS files and color/font inventories |
| **Computed Styles** | `npm run extract:computed` | Analyze actually-applied styles (Puppeteer) |
| **Font Files** ⭐ NEW | `npm run extract:fonts` | Download font files (WOFF2, TTF) with @font-face mappings |

### Analyzers (Interpret & Compare)

| Tool | Command | Purpose |
|------|---------|---------|
| **Responsive** | `npm run analyze:responsive` | Multi-breakpoint layout analysis |
| **Comprehensive** | `npm run analyze:comprehensive` | Advanced element detection & positioning |
| **Elements** | `npm run analyze:elements` | Deep component-specific analysis |
| **Mobile Menu** ⭐ NEW | `npm run analyze:mobile-menu` | Hamburger menus, modals, mobile navigation patterns |
| **Interactive States** ⭐ NEW | `npm run analyze:interactive` | Hover, focus, active states and transitions |
| **Relative Positioning** ⭐ NEW | `npm run analyze:positioning` | Exact pixel positions, gaps, negative margins |

### Complete Analysis

```bash
# Run everything at once
npm run analyze:complete -- https://example.com

# Runs in sequence:
# 1. Responsive analysis (7 breakpoints)
# 2. Comprehensive site analysis
# 3. Media query extraction
# 4. Computed styles audit
```

## 💡 Common Use Cases

### 1. Extract Media Query Breakpoints

**Problem**: You need to know exactly when CSS properties change at specific viewport widths.

```bash
# Find all breakpoints
npm run extract:media-queries -- https://example.com

# Filter by specific property
npm run extract:media-queries -- https://example.com --property margin-left

# Filter by specific selector
npm run extract:media-queries -- https://example.com --selector .hero-section
```

**Output**: `analysis/media-queries/YYYY-MM-DD/example-com-media-queries.json`

### 2. Analyze Mobile Navigation Patterns

**Problem**: You need to recreate a hamburger menu with exact modal positioning and animations.

```bash
# Analyze mobile menu at default breakpoint (767px)
npm run analyze:mobile-menu -- https://example.com

# Custom breakpoint
npm run analyze:mobile-menu -- https://example.com 991
```

**Output**:
- `analysis/mobile-menu/YYYY-MM-DD-example-com-mobile-menu.json` - Complete data
- `analysis/mobile-menu/YYYY-MM-DD-example-com-mobile-menu.md` - Human-readable report
- `analysis/screenshots/*-mobile-before.png` & `*-mobile-after.png` - Visual documentation

**See:** [Mobile Navigation Guide](docs/guides/mobile-navigation.md)

### 3. Extract Interactive Element States

**Problem**: You need to capture hover, focus, and transition effects for buttons and links.

```bash
# Analyze default interactive elements
npm run analyze:interactive -- https://example.com

# Analyze specific selectors
npm run analyze:interactive -- https://example.com "button, .btn, a"
```

**Output**: 
- Hover states from `:hover` CSS rules
- Focus states from `:focus` CSS rules
- Active states from `:active` CSS rules
- Toggle elements (accordions, dropdowns, tabs)
- Transition and animation properties

### 4. Calculate Exact Element Positioning

**Problem**: You need precise pixel positions and gaps between elements for pixel-perfect recreation.

```bash
# Analyze positioning within a specific container
npm run analyze:positioning -- https://example.com ".hero-section"

# Analyze form layout
npm run analyze:positioning -- https://example.com ".contact-form"
```

**Output**:
- Exact pixel positions relative to container
- Vertical and horizontal gaps between elements
- Negative margins and overlaps
- Center alignment detection
- Visual diagram with highlighted elements

**See:** [Iterative Refinement Guide](docs/guides/iterative-refinement.md)

### 5. Download Font Files

**Problem**: You need actual font files (WOFF2, TTF) with proper @font-face declarations.

```bash
# Analyze fonts (URLs and declarations only)
npm run extract:fonts -- https://example.com

# Download font files locally
npm run extract:fonts -- https://example.com --download
```

**Output**:
- `analysis/font-files/YYYY-MM-DD-example-com-fonts.json` - Font data
- `analysis/font-files/YYYY-MM-DD-example-com-fonts.css` - Ready-to-use @font-face CSS
- `analysis/font-files/downloads/*.woff2` - Downloaded font files (if --download used)

### 6. Analyze Responsive Behavior

**Problem**: You need to understand how a site's layout transforms across different viewport sizes.

```bash
npm run analyze:responsive -- https://example.com
```

**Output**: 
- `orig/_responsive-analysis.json` - Complete data
- `orig/_responsive-report.md` - Human-readable report

### 7. Get Comprehensive Site Structure

**Problem**: You need to identify major sections, typography hierarchy, and layout patterns.

```bash
npm run analyze:comprehensive -- https://example.com
```

**Output**:
- `orig/_comprehensive-analysis.json` - Full analysis
- `orig/_comprehensive-report.md` - Section breakdown
- `orig/_comprehensive-analysis-screenshot.png` - Visual reference

### 8. Deep Component Analysis

**Problem**: You need detailed styling for specific elements (e.g., navigation, buttons, forms).

```bash
# Analyze specific elements
npm run analyze:elements -- https://example.com ".navbar"
npm run analyze:elements -- https://example.com "h1, h2, h3"
npm run analyze:elements -- https://example.com "button, .btn"
```

**Output**: `orig/_element-analysis-[selector].json`

## ⚡ Performance: Smart Caching

**ALL tools include automatic caching for 30-60x speed improvement:**

- ✅ **First run**: 30-60 seconds (fresh data fetch)
- ✅ **Cached run**: ~1 second (instant results)
- ✅ **Cache duration**: 24 hours (configurable)
- ✅ **Force refresh**: Add `--force` flag to any command
- ✅ **Clear cache**: Add `--clear-cache` flag

```bash
# Use cached data (if available)
npm run analyze:responsive -- https://example.com

# Force fresh data
npm run analyze:responsive -- https://example.com --force

# Clear cache and fetch fresh
npm run extract:computed -- https://example.com --clear-cache
```

## 📁 Output Structure

```
web-analysis-toolkit/
├── analysis/                      # Analysis outputs
│   ├── media-queries/             # Media query extraction results
│   ├── responsive/                # Responsive analysis data
│   └── screenshots/               # Screenshots with date subdirs
├── .cache/                        # Smart caching (gitignored)
│   ├── media-queries/             # Cached media query data
│   ├── responsive/                # Cached responsive data
│   └── computed/                  # Cached computed styles
└── orig/                          # Legacy output location (deprecated)
```

## � Best Practices & Development Standards

This toolkit follows production-ready development standards from the Texas Quantitative team:

- **[Copilot Instructions](.github/copilot-instructions.md)** - AI agent guidance for contributing to this project
- **[Documentation Maintenance Protocol](docs/DOCUMENTATION_MAINTENANCE_PROTOCOL.md)** - How we keep documentation current
- **[Agent Handoff Template](docs/templates/AGENT_HANDOFF_STATUS_TEMPLATE.md)** - Multi-agent collaboration protocol
- **[Version Management](scripts/bump-version.mjs)** - Automated semantic versioning

**Contributing Developers**: Review `.github/copilot-instructions.md` before making changes. It contains project-specific standards, architectural patterns, and development workflows.

**AI Agents**: The copilot instructions file provides context on toolkit philosophy, file organization, and implementation patterns. Reference it for consistent contributions.

**Reference Repository**: See [TQFA Best Practices](https://github.com/Texas-Quantitative/tqfa-development-best-practices) for the broader development methodology that informs this toolkit's design.

## �🔗 Related Projects

- **[TQFA Development Best Practices](https://github.com/Texas-Quantitative/tqfa-development-best-practices)** - Production deployment patterns, Azure Container Apps, FastAPI architecture

**Using this toolkit with FastAPI/Azure?** See the [deployment best practices](https://github.com/Texas-Quantitative/tqfa-development-best-practices/blob/master/docs/best-practices/docker-deployment.md) for production-ready patterns.

## 🛣️ Roadmap

### v1.1.0 (Coming Soon)
- [ ] Utility cache management commands
- [ ] Batch URL processing
- [ ] Export to multiple formats (JSON, CSV, Markdown)

### v2.0.0 (Planned)
- [ ] Express/Detailed analysis modes (quick vs thorough)
- [ ] Intelligent viewport detection
- [ ] Progressive complexity analysis

### v3.0.0 (Vision)
- [ ] Natural language interface: "Extract styles from example.com at 1400px width"
- [ ] Declarative site extraction: One command for complete recreation data

See [docs/roadmap/](docs/roadmap/) for complete feature planning.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

This toolkit was originally part of the [TQFA Development Best Practices](https://github.com/Texas-Quantitative/tqfa-development-best-practices) repository and was split into a standalone project due to its broad applicability and active development.

---

**Questions or Issues?** [Open an issue](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues) or check the [documentation](docs/guides/).

**Made with ❤️ by the Texas Quantitative Development Team**
