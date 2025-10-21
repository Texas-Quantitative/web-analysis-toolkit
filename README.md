# Web Analysis Toolkit

> **Comprehensive CSS extraction, responsive analysis, and media query extraction tools for pixel-perfect website recreation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

## 🎯 What is This?

The Web Analysis Toolkit is a comprehensive suite of automated tools that extract exact CSS specifications, analyze responsive behavior patterns, and reveal actual media query breakpoints from any website. No more guessing hex codes, approximating font sizes, or missing responsive breakpoints—get pixel-perfect accuracy for professional website recreation.

## ✨ Key Features

- **🎨 CSS Extraction**: Extract all colors, fonts, typography, and styling from any website
- **📐 Responsive Analysis**: Analyze layout transformations across 7 standard breakpoints (mobile → desktop)
- **🔍 Media Query Extraction**: **NEW** - Discover actual CSS breakpoints where properties change
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
- **[Caching System](docs/guides/caching.md)** - Performance optimization guide

## 🛠️ Available Tools

### Extractors (Get Raw Data)

| Tool | Command | Purpose |
|------|---------|---------|
| **Media Queries** | `npm run extract:media-queries` | Extract actual CSS breakpoints |
| **Static CSS** | `npm run extract:static-css` | Get all CSS files and color/font inventories |
| **Computed Styles** | `npm run extract:computed` | Analyze actually-applied styles (Puppeteer) |

### Analyzers (Interpret & Compare)

| Tool | Command | Purpose |
|------|---------|---------|
| **Responsive** | `npm run analyze:responsive` | Multi-breakpoint layout analysis |
| **Comprehensive** | `npm run analyze:comprehensive` | Advanced element detection & positioning |
| **Elements** | `npm run analyze:elements` | Deep component-specific analysis |

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

### 2. Analyze Responsive Behavior

**Problem**: You need to understand how a site's layout transforms across different viewport sizes.

```bash
npm run analyze:responsive -- https://example.com
```

**Output**: 
- `orig/_responsive-analysis.json` - Complete data
- `orig/_responsive-report.md` - Human-readable report

### 3. Get Comprehensive Site Structure

**Problem**: You need to identify major sections, typography hierarchy, and layout patterns.

```bash
npm run analyze:comprehensive -- https://example.com
```

**Output**:
- `orig/_comprehensive-analysis.json` - Full analysis
- `orig/_comprehensive-report.md` - Section breakdown
- `orig/_comprehensive-analysis-screenshot.png` - Visual reference

### 4. Deep Component Analysis

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

## 🔗 Related Projects

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
