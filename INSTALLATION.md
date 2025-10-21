# Installation Guide

## Prerequisites

Before installing the Web Analysis Toolkit, ensure you have:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)
- At least 500MB of free disk space

## Installation Methods

### Method 1: Clone from GitHub (Recommended)

```bash
# Clone the repository
git clone https://github.com/Texas-Quantitative/web-analysis-toolkit.git

# Navigate into the directory
cd web-analysis-toolkit

# Install dependencies
npm install

# Verify installation
npm run extract:media-queries -- --help
```

### Method 2: Download ZIP

1. Download the latest release from [GitHub Releases](https://github.com/Texas-Quantitative/web-analysis-toolkit/releases)
2. Extract the ZIP file
3. Navigate to the extracted directory
4. Run `npm install`

## Verify Installation

Test that everything is working:

```bash
# Should display help information
node src/extractors/media-queries.mjs --help

# Test with a real website
npm run analyze:comprehensive -- https://example.com
```

## Directory Structure

After installation, you should see:

```
web-analysis-toolkit/
├── src/
│   ├── extractors/          # Extraction tools
│   │   ├── media-queries.mjs
│   │   ├── static-css.mjs
│   │   └── computed-styles.mjs
│   ├── analyzers/           # Analysis tools
│   │   ├── responsive.mjs
│   │   ├── comprehensive.mjs
│   │   └── elements.mjs
│   └── utils/               # Shared utilities (future)
├── docs/                    # Documentation
├── examples/                # Usage examples (future)
├── node_modules/            # Dependencies (created by npm install)
├── package.json             # Project configuration
└── README.md                # Main documentation
```

## Dependencies

The toolkit automatically installs these dependencies:

- **[Puppeteer](https://pptr.dev/)** v23.3.0+ - Headless browser automation
- **[JSDOM](https://github.com/jsdom/jsdom)** v24.1.0+ - HTML/CSS parsing
- **[node-fetch](https://github.com/node-fetch/node-fetch)** v3.3.2+ - HTTP requests

## Configuration

### Cache Directory

By default, the toolkit creates a `.cache` directory for performance optimization:

```
.cache/
├── media-queries/           # Cached media query extractions
├── responsive/              # Cached responsive analyses
└── computed/                # Cached computed styles
```

**Cache behavior:**
- Automatic 24-hour cache duration
- Use `--force` to bypass cache
- Use `--clear-cache` to clear cache before running

### Output Directory

Analysis results are saved to:

```
analysis/
├── media-queries/           # Media query extraction results
│   └── YYYY-MM-DD/          # Date-stamped subdirectories
├── responsive/              # Responsive analysis data
└── screenshots/             # Visual documentation
```

## Troubleshooting

### Issue: Puppeteer Installation Fails

**Error:** `Error: Failed to download Chromium`

**Solution:**
```bash
# Install Puppeteer separately
npm install puppeteer --no-save

# Then install toolkit dependencies
npm install
```

### Issue: Permission Denied

**Error:** `EACCES: permission denied`

**Solution:**
```bash
# macOS/Linux: Use sudo (NOT recommended)
sudo npm install

# Better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Issue: Node Version Too Old

**Error:** `engine "node" is incompatible`

**Solution:**
```bash
# Check your Node version
node --version

# Upgrade Node.js to v18+ from https://nodejs.org/
# Or use nvm (Node Version Manager)
nvm install 18
nvm use 18
```

### Issue: Command Not Found

**Error:** `command not found: npm`

**Solution:**
- Ensure Node.js is installed: https://nodejs.org/
- Restart your terminal after installing Node.js
- Verify installation: `node --version` and `npm --version`

## Platform-Specific Notes

### Windows

- Use PowerShell or Git Bash (not Command Prompt)
- Path separators use backslash (`\`) but npm scripts handle this automatically
- Chromium download may take longer on first run

### macOS

- May need to grant Terminal access to folders in System Preferences
- Use built-in Terminal or iTerm2
- M1/M2 Macs: Puppeteer installs ARM-compatible Chromium automatically

### Linux

- May need additional dependencies for Chromium:
  ```bash
  # Debian/Ubuntu
  sudo apt-get install -y \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libxkbcommon0 libxcomposite1 \
    libxrandr2 libgbm1 libpango-1.0-0 libasound2
  ```

## Next Steps

Once installed:

1. **[Quick Start Guide](docs/guides/QUICK_START.md)** - Run your first analysis in 5 minutes
2. **[Complete Workflow](docs/guides/WORKFLOW.md)** - End-to-end website recreation process
3. **[Tool Reference](docs/guides/TOOL_REFERENCE.md)** - Detailed command documentation

## Updating

To update to the latest version:

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Verify update
npm run extract:media-queries -- --help
```

## Uninstalling

To remove the toolkit:

```bash
# Remove the directory
cd ..
rm -rf web-analysis-toolkit

# Or on Windows PowerShell
Remove-Item -Recurse -Force web-analysis-toolkit
```

---

**Need Help?** [Open an issue](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues) or check the [main README](README.md).
