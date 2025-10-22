#!/usr/bin/env node

/**
 * Version Bump Script for Web Analysis Toolkit
 * 
 * Automates semantic versioning with interactive prompts
 * Updates: package.json, CHANGELOG.md
 * 
 * Usage:
 *   node scripts/bump-version.mjs [patch|minor|major]
 *   node scripts/bump-version.mjs          # Interactive mode
 * 
 * Based on TQFA best practices, adapted for Node.js toolkit
 */

import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Parse semantic version string to components
 */
function parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
        throw new Error(`Invalid version format: ${version}`);
    }
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10)
    };
}

/**
 * Increment version based on bump type
 */
function bumpVersion(currentVersion, bumpType) {
    const { major, minor, patch } = parseVersion(currentVersion);
    
    switch (bumpType) {
        case 'major':
            return `${major + 1}.0.0`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        default:
            throw new Error(`Invalid bump type: ${bumpType}. Use 'patch', 'minor', or 'major'.`);
    }
}

/**
 * Read package.json
 */
function readPackageJson() {
    const packagePath = join(PROJECT_ROOT, 'package.json');
    const content = readFileSync(packagePath, 'utf8');
    return JSON.parse(content);
}

/**
 * Update package.json with new version
 */
function updatePackageJson(newVersion) {
    const packagePath = join(PROJECT_ROOT, 'package.json');
    const pkg = readPackageJson();
    pkg.version = newVersion;
    writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`${colors.green}✓${colors.reset} Updated package.json to version ${colors.bright}${newVersion}${colors.reset}`);
}

/**
 * Update CHANGELOG.md with new version section
 */
function updateChangelog(newVersion) {
    const changelogPath = join(PROJECT_ROOT, 'CHANGELOG.md');
    let content;
    
    try {
        content = readFileSync(changelogPath, 'utf8');
    } catch (error) {
        console.log(`${colors.yellow}⚠${colors.reset} CHANGELOG.md not found, skipping...`);
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const versionHeader = `\n## [${newVersion}] - ${today}\n\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n`;

    // Find where to insert (after title and before first version)
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^## \[[\d.]+\]/)) {
            insertIndex = i;
            break;
        }
    }

    if (insertIndex === -1) {
        // No existing version sections, add after the initial content
        const firstVersionLine = lines.findIndex(line => line.trim().startsWith('##'));
        if (firstVersionLine !== -1) {
            lines.splice(firstVersionLine, 0, versionHeader);
        } else {
            lines.push(versionHeader);
        }
    } else {
        lines.splice(insertIndex, 0, versionHeader);
    }

    writeFileSync(changelogPath, lines.join('\n'), 'utf8');
    console.log(`${colors.green}✓${colors.reset} Updated CHANGELOG.md with version ${colors.bright}${newVersion}${colors.reset} section`);
}

/**
 * Prompt user for input
 */
function prompt(question) {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Interactive mode - ask user for bump type
 */
async function interactiveMode(currentVersion) {
    const { major, minor, patch } = parseVersion(currentVersion);
    
    console.log(`\n${colors.bright}Current version:${colors.reset} ${colors.cyan}${currentVersion}${colors.reset}\n`);
    console.log('Select version bump type:\n');
    console.log(`  ${colors.green}1${colors.reset}. Patch (${major}.${minor}.${patch + 1}) - Bug fixes, documentation updates`);
    console.log(`  ${colors.yellow}2${colors.reset}. Minor (${major}.${minor + 1}.0) - New features, backward-compatible`);
    console.log(`  ${colors.red}3${colors.reset}. Major (${major + 1}.0.0) - Breaking changes, architecture overhaul`);
    console.log(`  ${colors.blue}4${colors.reset}. Cancel\n`);

    const answer = await prompt('Enter choice (1-4): ');
    
    switch (answer) {
        case '1':
            return 'patch';
        case '2':
            return 'minor';
        case '3':
            return 'major';
        case '4':
            console.log(`\n${colors.yellow}Version bump cancelled.${colors.reset}\n`);
            process.exit(0);
        default:
            console.log(`\n${colors.red}Invalid choice. Please run again.${colors.reset}\n`);
            process.exit(1);
    }
}

/**
 * Confirm version bump
 */
async function confirmBump(currentVersion, newVersion, bumpType) {
    console.log(`\n${colors.bright}Version Bump Summary:${colors.reset}`);
    console.log(`  Current: ${colors.cyan}${currentVersion}${colors.reset}`);
    console.log(`  New:     ${colors.green}${newVersion}${colors.reset}`);
    console.log(`  Type:    ${colors.yellow}${bumpType}${colors.reset}\n`);

    const answer = await prompt('Proceed with version bump? (y/n): ');
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(`\n${colors.yellow}Version bump cancelled.${colors.reset}\n`);
        process.exit(0);
    }
}

/**
 * Display post-bump instructions
 */
function showPostBumpInstructions(newVersion) {
    console.log(`\n${colors.bright}${colors.green}✓ Version bump complete!${colors.reset}\n`);
    console.log('Next steps:\n');
    console.log(`  1. ${colors.cyan}Review changes:${colors.reset}`);
    console.log(`     git diff package.json CHANGELOG.md\n`);
    console.log(`  2. ${colors.cyan}Update CHANGELOG.md:${colors.reset}`);
    console.log(`     Edit the [${newVersion}] section with actual changes\n`);
    console.log(`  3. ${colors.cyan}Commit version bump:${colors.reset}`);
    console.log(`     git add package.json CHANGELOG.md`);
    console.log(`     git commit -m "Release v${newVersion} - [brief description]"\n`);
    console.log(`  4. ${colors.cyan}Tag release (optional):${colors.reset}`);
    console.log(`     git tag -a v${newVersion} -m "Version ${newVersion}"`);
    console.log(`     git push origin v${newVersion}\n`);
    console.log(`  5. ${colors.cyan}Push changes:${colors.reset}`);
    console.log(`     git push\n`);
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log(`\n${colors.bright}${colors.blue}Web Analysis Toolkit - Version Bump${colors.reset}\n`);

        // Read current version
        const pkg = readPackageJson();
        const currentVersion = pkg.version;

        // Determine bump type
        let bumpType = process.argv[2];
        
        if (!bumpType) {
            bumpType = await interactiveMode(currentVersion);
        } else if (!['patch', 'minor', 'major'].includes(bumpType)) {
            console.error(`${colors.red}Error:${colors.reset} Invalid bump type '${bumpType}'`);
            console.error(`Usage: node scripts/bump-version.mjs [patch|minor|major]`);
            process.exit(1);
        }

        // Calculate new version
        const newVersion = bumpVersion(currentVersion, bumpType);

        // Confirm bump
        await confirmBump(currentVersion, newVersion, bumpType);

        // Perform updates
        updatePackageJson(newVersion);
        updateChangelog(newVersion);

        // Show next steps
        showPostBumpInstructions(newVersion);

    } catch (error) {
        console.error(`\n${colors.red}Error:${colors.reset} ${error.message}\n`);
        process.exit(1);
    }
}

// Run script
main();
