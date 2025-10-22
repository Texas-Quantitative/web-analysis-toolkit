# Changelog

All notable changes to the Web Analysis Toolkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.1.0] - 2025-10-22

### 🎉 Major Feature Release: Interactive Analysis & Advanced Tools + Development Standards

**Inspiration**: Based on real-world experience from dental-static project, addressing gaps discovered during pixel-perfect website recreation workflows. Added production-ready development standards from TQFA Best Practices.

### Added

#### Development Standards & Infrastructure

- **Copilot Instructions** (`.github/copilot-instructions.md`) - Comprehensive AI agent guidance (750+ lines) adapted from TQFA template
- **Documentation Maintenance Protocol** (`docs/DOCUMENTATION_MAINTENANCE_PROTOCOL.md`) - Living documentation principles and update workflows
- **Agent Handoff Template** (`docs/templates/AGENT_HANDOFF_STATUS_TEMPLATE.md`) - Multi-agent collaboration protocol
- **Automated Version Bumping** (`scripts/bump-version.mjs`) - Interactive CLI for semantic versioning
- **Last Modified Dates** - Added to all 7 guide files with standard footer format
- **Enhanced .gitignore** - Added 50+ toolkit-specific patterns (analysis/, .cache/, temp/, screenshots/)
- **README Best Practices Section** - Links to copilot instructions, documentation standards, and contribution guidelines

#### New Analyzers

- **Mobile Menu/Modal Analyzer** (`src/analyzers/mobile-menu.mjs`) ⭐ **HIGH PRIORITY**
  - Automatically detects hamburger menu icons (SVG, Font Awesome, CSS-based)
  - Analyzes modal dialog positioning and dimensions at specific breakpoints
  - Extracts animation and transition properties (slide-in direction, timing)
  - Captures z-index layers and stacking order
  - Interactive analysis: clicks hamburger and captures modal open state
  - Extracts modal content (navigation links, buttons, phone numbers)
  - Generates before/after screenshots
  - Default breakpoint: 767px (customizable)
  - **Use case**: Recreating mobile navigation patterns with exact specifications
  - **Command**: `npm run analyze:mobile-menu -- <url> [breakpoint]`

- **Interactive Element State Analyzer** (`src/analyzers/interactive-states.mjs`)
  - Analyzes hover states (`:hover` CSS rules)
  - Analyzes focus states (`:focus`, `:focus-visible`)
  - Analyzes active/pressed states (`:active`)
  - Detects toggle elements (accordions, dropdowns, tabs)
  - Captures transition and animation properties
  - Supports custom selector filtering
  - **Use case**: Capturing button hover effects, form input focus styles
  - **Command**: `npm run analyze:interactive -- <url> [selectors]`

- **Relative Positioning Calculator** (`src/analyzers/relative-positioning.mjs`)
  - Calculates exact pixel positions relative to container
  - Computes vertical and horizontal gaps between adjacent elements
  - Detects negative margins and overlapping elements
  - Identifies center-aligned elements (horizontal and vertical)
  - Highlights container and children in screenshots
  - **Use case**: Solving difficult spacing issues during pixel-perfect recreation
  - **Real-world example**: Discovered -64px negative margin needed for overlapping input field
  - **Command**: `npm run analyze:positioning -- <url> <container-selector>`

#### New Extractors

- **Font File Analyzer** (`src/extractors/font-files.mjs`)
  - Detects all `@font-face` declarations in stylesheets
  - Extracts font file URLs (WOFF2, WOFF, TTF, OTF, EOT)
  - Maps font-family names to actual font files
  - Detects font-weight values in font files (not just CSS declarations)
  - **Optional**: Downloads font files for local use (`--download` flag)
  - Generates ready-to-use CSS with `@font-face` declarations
  - Captures computed fonts from actual elements
  - **Use case**: Discovering that "MontserratMedium" is a font-family, not font-weight: 500
  - **Command**: `npm run extract:fonts -- <url> [--download]`

#### Enhanced Tools

- **Media Query Extractor Enhancement** - Complexity Scoring
  - Calculates complexity score (0-100) based on:
    - Number of unique breakpoints (25% weight)
    - Properties changed per breakpoint (30% weight)
    - Nested/combined media queries (20% weight)
    - Breakpoint overlaps/conflicts (15% weight)
    - Total media query count (10% weight)
  - Provides complexity level: Simple, Moderate, Complex, Very Complex, Extremely Complex
  - Recommends appropriate analysis approach
  - Identifies "problem breakpoints" with excessive property changes
  - **Use case**: Understanding site complexity before starting recreation

### Documentation

- **Mobile Navigation Guide** (`docs/guides/mobile-navigation.md`)
  - Comprehensive guide to analyzing hamburger menus and modals
  - Common mobile menu patterns (right slide-in, left slide-in, full-screen, centered)
  - Real-world example from dental practice website
  - Output interpretation and recreation tips
  - Integration with other toolkit tools

- **Iterative Refinement Guide** (`docs/guides/iterative-refinement.md`)
  - When to pursue pixel-perfect matching vs acceptable approximation
  - Systematic iteration strategies (binary search, incremental adjustment)
  - Real-world case study: 18 iterations across 4 properties for hero section
  - Using browser DevTools effectively for live editing
  - Documenting iteration history (inline comments, separate logs, git commits)
  - Common refinement patterns (spacing, negative margins, breakpoint-specific)
  - Tool integration workflow for complete refinement pipeline

### Updated

- **README.md**
  - Added new tools to feature list and tools table
  - Expanded use cases section with 8 comprehensive examples
  - Updated documentation links to include new guides
  - Added ⭐ NEW badges for v1.1.0 features

- **package.json**
  - Added `npm run analyze:mobile-menu` script
  - Added `npm run analyze:interactive` script
  - Added `npm run analyze:positioning` script
  - Added `npm run extract:fonts` script

### Technical Improvements

- All new analyzers follow established patterns:
  - Puppeteer-based browser automation
  - Smart output directory creation
  - JSON + Markdown dual output format
  - Screenshot generation with visual highlights
  - Comprehensive error handling
  - CLI-friendly with helpful usage messages

### Real-World Validation

All new features tested and validated against dental-static project:
- Mobile menu analyzer: Successfully detected hamburger icon and modal at 767px
- Interactive states: Captured button hover effects and form focus states
- Relative positioning: Revealed -64px negative margin for overlapping input
- Font analyzer: Discovered MontserratMedium vs font-weight distinction
- Iterative refinement: Documented 18-iteration process for hero section

### Breaking Changes

None. All changes are additive and backward-compatible.

---

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
