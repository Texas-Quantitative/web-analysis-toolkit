# Contributing to Web Analysis Toolkit

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues)
- Verify you're using the latest version
- Test with a fresh installation

**Bug Report Template:**
```markdown
**Description:** Clear description of the issue

**Steps to Reproduce:**
1. Run command: `npm run ...`
2. With URL: `https://example.com`
3. See error: ...

**Expected Behavior:** What should happen

**Actual Behavior:** What actually happens

**Environment:**
- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Node.js version: [e.g., v18.17.0]
- Toolkit version: [e.g., 1.0.0]

**Additional Context:** Screenshots, error logs, etc.
```

### Suggesting Features

**Feature Request Template:**
```markdown
**Feature Description:** What you want added

**Use Case:** Why this feature is needed

**Proposed Solution:** How it might work

**Alternatives Considered:** Other approaches you've thought about

**Priority:** Low / Medium / High (from your perspective)
```

### Pull Requests

**Before submitting a PR:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Update documentation if needed
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

**PR Guidelines:**
- One feature/fix per PR
- Include tests if applicable
- Update CHANGELOG.md
- Follow existing code style
- Provide clear description of changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/web-analysis-toolkit.git
cd web-analysis-toolkit

# Install dependencies
npm install

# Test your changes
npm run analyze:complete -- https://example.com
```

## Code Style

### JavaScript/Node.js Style

- **Use ES modules** (`import`/`export`, not `require`)
- **Use async/await** (not callbacks or raw promises)
- **Descriptive variable names** (`mediaQueryData`, not `mqd`)
- **Comments for complex logic**
- **Error handling** (try/catch for async operations)

**Example:**
```javascript
// ✅ Good
async function extractMediaQueries(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        // ... rest of logic
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// ❌ Avoid
function extract(u) {
    puppeteer.launch().then(b => {
        b.newPage().then(p => {
            // ... nested promises
        });
    });
}
```

### Documentation Style

- **Use Markdown** for all documentation
- **Clear headings** (H1 for title, H2 for sections, H3 for subsections)
- **Code examples** for all commands and features
- **Emoji for visual cues** (✅ success, ❌ error, 💡 tip, 🚨 warning)

## Project Structure

```
web-analysis-toolkit/
├── src/
│   ├── extractors/          # Raw data extraction tools
│   ├── analyzers/           # Data analysis and comparison tools
│   └── utils/               # Shared utilities (future)
├── docs/
│   ├── guides/              # User-facing documentation
│   ├── examples/            # Usage examples
│   ├── api/                 # API documentation
│   └── roadmap/             # Future planning
├── examples/                # Code examples
├── tests/                   # Unit tests (future)
├── package.json
├── README.md
├── INSTALLATION.md
├── QUICK_START.md
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Adding New Tools

### Extractor Template

Create in `src/extractors/your-tool.mjs`:

```javascript
#!/usr/bin/env node
/**
 * Your Tool Name
 * Brief description of what it does
 * 
 * Usage: node src/extractors/your-tool.mjs <url>
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Parse arguments
const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: node your-tool.mjs <url>');
    process.exit(1);
}

async function extractData(url) {
    console.log(`🔍 Extracting from: ${url}`);
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        const data = await page.evaluate(() => {
            // Your extraction logic here
            return { /* extracted data */ };
        });
        
        // Save results
        const filename = 'analysis/your-tool-output.json';
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        
        console.log(`✅ Results saved to: ${filename}`);
        return data;
        
    } finally {
        await browser.close();
    }
}

extractData(url).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
});
```

### Add npm Script

In `package.json`:

```json
{
  "scripts": {
    "your-tool": "node src/extractors/your-tool.mjs"
  }
}
```

### Add Documentation

Create `docs/guides/your-tool.md`:

```markdown
# Your Tool Name

## What It Does

Brief description.

## Usage

\`\`\`bash
npm run your-tool -- https://example.com
\`\`\`

## Output

Description of output format and location.

## Examples

Real-world usage examples.
```

### Update Main README

Add to tools table in `README.md`.

## Testing

Currently the toolkit doesn't have formal unit tests. When contributing:

1. **Manual Testing Required:**
   - Test with multiple websites
   - Test with different viewport sizes
   - Test error cases (invalid URLs, timeouts)
   - Test caching behavior

2. **Verification Checklist:**
   - [ ] Tool runs without errors
   - [ ] Output files created correctly
   - [ ] JSON is valid and well-formatted
   - [ ] Console output is clear and helpful
   - [ ] Cache works properly (if applicable)
   - [ ] Documentation is accurate

## Documentation Updates

**When to update docs:**
- Adding a new tool → Update README.md and create guide
- Changing a command → Update relevant guides
- Fixing a bug → Update CHANGELOG.md
- Adding a feature → Update roadmap if applicable

**Documentation files to maintain:**
- `README.md` - Main overview
- `INSTALLATION.md` - Setup instructions
- `QUICK_START.md` - 5-minute getting started
- `CONTRIBUTING.md` (this file) - Contribution guidelines
- `CHANGELOG.md` - Version history
- `docs/guides/*.md` - Feature-specific guides

## Commit Message Format

Use clear, descriptive commit messages:

```bash
# Format: <type>: <description>

# Types:
feat: New feature (e.g., "feat: Add viewport filtering to media query extraction")
fix: Bug fix (e.g., "fix: Handle CORS errors in static CSS extractor")
docs: Documentation only (e.g., "docs: Update installation guide for Windows")
refactor: Code restructuring (e.g., "refactor: Simplify cache key generation")
perf: Performance improvement (e.g., "perf: Reduce memory usage in responsive analyzer")
test: Adding tests (e.g., "test: Add unit tests for cache utilities")
chore: Maintenance (e.g., "chore: Update dependencies")
```

## Release Process

**For maintainers:**

1. Update `CHANGELOG.md` with new version
2. Update `package.json` version
3. Commit: `git commit -m "chore: Release v1.1.0"`
4. Tag: `git tag v1.1.0`
5. Push: `git push && git push --tags`
6. Create GitHub Release with notes from CHANGELOG

## Community Guidelines

- **Be respectful and constructive**
- **Focus on the issue, not the person**
- **Assume good intentions**
- **Help others learn**

## Questions?

- **General questions:** [Open a discussion](https://github.com/Texas-Quantitative/web-analysis-toolkit/discussions)
- **Bug reports:** [Open an issue](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues)
- **Feature requests:** [Open an issue with "Feature Request" label](https://github.com/Texas-Quantitative/web-analysis-toolkit/issues)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Web Analysis Toolkit!** 🙏
