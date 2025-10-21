# Changelog

All notable changes to the Web Analysis Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-21

### 🎉 Initial Release

**Major Achievement**: Split from `tqfa-development-best-practices` repository into standalone toolkit due to broad applicability and active development.

### Added

#### Core Tools
- **Media Query Extractor** (`src/extractors/media-queries.mjs`)
  - Extract actual CSS media query breakpoints from stylesheets
  - Filter by specific CSS properties (e.g., `--property margin-left`)
  - Filter by specific selectors (e.g., `--selector .hero-section`)
  - Smart 24-hour caching with `--force` override
  
- **Static CSS Extractor** (`src/extractors/static-css.mjs`)
  - Extract all CSS files from websites
  - Create comprehensive color inventories (hex, RGB, RGBA, HSL, HSLA, named)
  - Create font family inventories
  - Categorize colors by type
  
- **Computed Styles Analyzer** (`src/extractors/computed-styles.mjs`)
  - Analyze actually-applied styles using Puppeteer
  - Extract computed typography, layout, spacing, borders, effects
  - Generate style inventories (colors, fonts, sizes, weights)
  - Create quick reference JSON for common values
  
- **Responsive Analyzer** (`src/analyzers/responsive.mjs`)
  - Analyze layout across 7 standard breakpoints (mobile → desktop)
  - Track height compression ratios
  - Identify layout method changes (Grid/Flex)
  - Generate human-readable markdown reports
  
- **Comprehensive Site Analyzer** (`src/analyzers/comprehensive.mjs`)
  - Advanced element detection with multi-selector fallback
  - Section identification (hero, navigation, footer)
  - Background image detection for section discovery
  - Typography hierarchy analysis
  - Grid/Flex layout detection
  - Form element analysis
  - Full-page screenshot generation
  - **CRITICAL**: Class name preservation guidance for recreation
  
- **Element-Specific Analyzer** (`src/analyzers/elements.mjs`)
  - Deep analysis of specific components by selector
  - Comprehensive computed style extraction (50+ properties)
  - Bounding box and positioning data
  - Style inventory generation
  - Element type distribution analysis

#### Performance Features
- **Smart Caching System**
  - 24-hour automatic caching (30-60x performance improvement)
  - Per-tool cache directories (`.cache/media-queries/`, `.cache/responsive/`, etc.)
  - MD5-based cache keys for URLs
  - Cache age reporting
  - `--force` flag to bypass cache
  - `--clear-cache` flag to clear and refresh

#### Documentation
- Comprehensive `README.md` with feature overview and quick start
- Detailed `INSTALLATION.md` with platform-specific notes
- `QUICK_START.md` for 5-minute getting started
- `CONTRIBUTING.md` with development guidelines
- **Guides:**
  - `docs/guides/css-extraction.md` - Complete CSS extraction workflow
  - `docs/guides/media-queries.md` - Media query extraction methodology
  - `docs/guides/responsive-analysis.md` - Responsive analysis patterns
  - `docs/guides/caching.md` - Performance optimization guide
  - `docs/guides/text-elements.md` - Text element analysis enhancement spec
- **Roadmap:**
  - `docs/roadmap/v2.2.0.md` - Express/Detailed analysis modes planning
  - `docs/roadmap/v3.0.0.md` - Declarative extraction vision

#### npm Scripts
- `npm run extract:media-queries` - Extract CSS breakpoints
- `npm run extract:static-css` - Extract static CSS files
- `npm run extract:computed` - Analyze computed styles
- `npm run analyze:responsive` - Multi-breakpoint analysis
- `npm run analyze:comprehensive` - Complete site structure
- `npm run analyze:elements` - Component-specific analysis
- `npm run analyze:complete` - Run full analysis suite
- `npm run setup` - Create directories and install dependencies

### Project Structure
```
web-analysis-toolkit/
├── src/
│   ├── extractors/          # Raw data extraction
│   │   ├── media-queries.mjs
│   │   ├── static-css.mjs
│   │   └── computed-styles.mjs
│   ├── analyzers/           # Data analysis
│   │   ├── responsive.mjs
│   │   ├── comprehensive.mjs
│   │   └── elements.mjs
│   └── utils/               # Shared utilities (planned)
├── docs/
│   ├── guides/              # User guides
│   ├── examples/            # Usage examples (planned)
│   ├── api/                 # API docs (planned)
│   └── roadmap/             # Future planning
├── examples/                # Code examples (planned)
├── tests/                   # Unit tests (planned)
├── .cache/                  # Smart caching (gitignored)
├── analysis/                # Analysis outputs (gitignored)
├── package.json
├── README.md
├── INSTALLATION.md
├── QUICK_START.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE
```

### Migration Context

**Origin**: This toolkit originated in the `tqfa-development-best-practices` repository as CSS extraction tools for website recreation projects.

**Reason for Split**: 
- Broad applicability beyond TQFA projects
- Active development and feature expansion
- Standalone value as a general-purpose web analysis tool
- Clear separation of concerns (web analysis vs deployment practices)

**Version History from Origin Repository:**
- v2.1.1 - Class name preservation for viewport adjustments
- v2.1.2 - Project organization best practices
- v2.1.3 - Text element analysis enhancement specification
- v2.1.4 - Media query extraction tool with comprehensive documentation

**Cross-References:**
- Best Practices Repository: https://github.com/Texas-Quantitative/tqfa-development-best-practices
- For deployment and production patterns, see the best practices repo

### Technical Details

**Dependencies:**
- `puppeteer` ^23.3.0 - Headless browser automation
- `jsdom` ^24.1.0 - HTML/CSS parsing
- `node-fetch` ^3.3.2 - HTTP requests

**Requirements:**
- Node.js >= 18.0.0
- npm (comes with Node.js)
- ~500MB disk space

**Supported Platforms:**
- Windows 10/11 (PowerShell, Git Bash)
- macOS 12+ (Intel and Apple Silicon)
- Linux (Ubuntu, Debian, Fedora)

---

## [Unreleased]

### Planned for v1.1.0
- Utility commands for cache management
- Batch URL processing support
- Export to CSV and Markdown formats
- Performance benchmarking tools

### Planned for v2.0.0
- Express/Detailed analysis modes (quick vs thorough)
- Intelligent viewport detection
- Progressive complexity analysis
- Adaptive sampling strategies

### Planned for v3.0.0
- Natural language interface
- Declarative site extraction
- One-command complete recreation data
- AI-assisted element identification

---

## Version Numbering

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (x.Y.0)**: New features, backward compatible
- **Patch (x.y.Z)**: Bug fixes, documentation updates

---

**Legend:**
- 🎉 Initial Release
- ✨ New Feature
- 🐛 Bug Fix
- 📚 Documentation
- ⚡ Performance
- 🔒 Security
- ⚠️ Breaking Change
- 🗑️ Deprecation

---

[1.0.0]: https://github.com/Texas-Quantitative/web-analysis-toolkit/releases/tag/v1.0.0
[Unreleased]: https://github.com/Texas-Quantitative/web-analysis-toolkit/compare/v1.0.0...HEAD
