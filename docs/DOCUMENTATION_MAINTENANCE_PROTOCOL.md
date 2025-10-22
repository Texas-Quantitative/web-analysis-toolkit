# Documentation Maintenance Protocol

**Purpose**: Ensure documentation remains accurate, current, and useful as the toolkit evolves.

**Last Modified**: 2025-10-22

---

## 🎯 Core Principles

### 1. **Living Documentation**
Documentation is not a "write once and forget" artifact. It must evolve with the codebase to remain valuable.

### 2. **Agent Context Preservation**
Clear, current documentation enables seamless handoffs between AI agents and human developers.

### 3. **Real-World Validation**
Documentation should reflect actual usage patterns from website recreation projects, not theoretical use cases.

---

## 📋 Documentation Types & Update Requirements

### **Critical Documentation (Update IMMEDIATELY)**

Files that MUST be updated whenever code changes:

| File | Update Trigger | Required Changes |
|------|---------------|------------------|
| `README.md` | New tool added | Add to features list, tools table, use cases |
| `CHANGELOG.md` | Any change | Document in "Unreleased" or version section |
| `package.json` | New tool added | Add npm script |
| `.github/copilot-instructions.md` | Architecture change | Update patterns, standards, examples |

### **Feature Documentation (Update BEFORE Release)**

Files that should be updated before merging to main:

| File | Update Trigger | Required Changes |
|------|---------------|------------------|
| `docs/guides/[feature].md` | New analyzer/extractor | Create comprehensive guide with real examples |
| `QUICK_START.md` | New common workflow | Add to getting started section |
| `INSTALLATION.md` | New dependency | Document installation steps |

### **Maintenance Documentation (Update AS NEEDED)**

Files updated periodically or when issues arise:

| File | Update Trigger | Required Changes |
|------|---------------|------------------|
| `docs/roadmap/` | Planning session | Add planned features, version targets |
| `docs/examples/` | New use case discovered | Add real-world example output |
| `CONTRIBUTING.md` | Process change | Update contribution guidelines |

---

## 🗓️ Last Modified Date Protocol

### **Mandatory Footer for All Guide Files**

Every file in `docs/guides/` MUST include a footer with last modified date:

```markdown
---

**Last Modified**: 2025-10-22
**Toolkit Version**: 1.1.0
**Status**: Current
```

### **Update Procedure**

1. **Before editing**: Check current "Last Modified" date
2. **After editing**: Update to current date (YYYY-MM-DD format)
3. **Update toolkit version**: Match current package.json version
4. **Set status**: 
   - `Current` - Reflects current toolkit state
   - `Deprecated` - Feature replaced or removed
   - `Draft` - Work in progress, not yet released

### **Files Requiring Last Modified Dates**

- ✅ All files in `docs/guides/`
- ✅ `.github/copilot-instructions.md`
- ✅ `docs/DOCUMENTATION_MAINTENANCE_PROTOCOL.md` (this file)
- ✅ Major version roadmap files in `docs/roadmap/`
- ❌ NOT needed: README.md, CHANGELOG.md (version-controlled)

---

## 🔄 Update Workflows

### **Workflow 1: Adding a New Analyzer/Extractor**

**Example**: Adding `src/analyzers/scroll-behavior.mjs`

**Checklist**:
- [ ] Create tool implementation
- [ ] Add npm script to `package.json`
- [ ] Create `docs/guides/scroll-behavior.md` with:
  - Purpose and use cases
  - Quick start example
  - Real-world example with actual URL
  - Output interpretation guide
  - Integration with other tools
  - Troubleshooting section
  - Last Modified footer
- [ ] Update `README.md`:
  - Add to "Features" section
  - Add to "Available Tools" table
  - Add to relevant "Use Cases" section
  - Update tools count (currently 11)
- [ ] Update `CHANGELOG.md`:
  - Add to "Unreleased" section or next version
  - Document what problem it solves
- [ ] Update `.github/copilot-instructions.md`:
  - Add to "Available Tools & Commands" section
  - Add to "When to Use Each Tool" section
  - Update Last Modified date

### **Workflow 2: Enhancing Existing Tool**

**Example**: Adding `--output-format` parameter to responsive analyzer

**Checklist**:
- [ ] Update tool implementation
- [ ] Update tool's guide in `docs/guides/`:
  - Document new parameter
  - Add usage examples
  - Update Last Modified date
- [ ] Update `README.md` if behavior changes significantly
- [ ] Update `CHANGELOG.md` in "Unreleased" section
- [ ] Update `.github/copilot-instructions.md` if pattern changes

### **Workflow 3: Bug Fix**

**Example**: Fix caching issue in media-queries extractor

**Checklist**:
- [ ] Fix bug in code
- [ ] Update `CHANGELOG.md`:
  - Add to "Unreleased" > "Fixed" section
  - Describe what was broken and how it's fixed
- [ ] Update relevant guide ONLY if behavior changes
- [ ] Consider adding to troubleshooting section if common issue

### **Workflow 4: Documentation Refresh**

**When**: Every major version release (X.0.0)

**Checklist**:
- [ ] Review all guides for accuracy
- [ ] Update Last Modified dates on changed files
- [ ] Verify all code examples still work
- [ ] Check all links (internal and external)
- [ ] Update screenshots if UI changed
- [ ] Verify toolkit version in all footers

---

## 🚨 Critical Documentation Anti-Patterns

### **❌ DON'T: Create Documentation After the Fact**

**Wrong**:
```
1. Implement tool
2. Test tool
3. Merge to main
4. "We'll add docs later" ← NEVER HAPPENS
```

**Right**:
```
1. Implement tool
2. Create comprehensive guide
3. Update README and CHANGELOG
4. Test tool AND documentation
5. Merge to main
```

### **❌ DON'T: Copy-Paste Without Adapting**

**Wrong**:
- Copy another guide's structure but leave placeholder text
- Reference wrong tool names
- Include irrelevant sections

**Right**:
- Adapt guide structure to specific tool's needs
- Use actual examples from testing
- Remove inapplicable sections

### **❌ DON'T: Document Theoretical Use Cases**

**Wrong**:
> "This tool can analyze any website's scroll behavior and detect lazy loading patterns."

*Problem*: No proof this actually works or is useful.

**Right**:
> "During the e-commerce-site project, this tool detected 3 different lazy loading implementations at scroll positions 500px, 1200px, and 2000px, saving 45 minutes of manual inspection."

*Better*: Real example with specific results.

### **❌ DON'T: Let Documentation Drift**

**Warning Signs**:
- Last Modified dates >6 months old
- Examples reference old tool versions
- Links to deprecated tools
- Screenshots show old output formats

**Fix**:
- Schedule quarterly documentation review
- Update during each major version release
- Remove or mark deprecated content clearly

---

## 📊 Documentation Quality Checklist

### **For Every New Guide in `docs/guides/`**

- [ ] **Clear Purpose Statement**: First paragraph explains what problem it solves
- [ ] **Quick Start Section**: 5-minute example to see results immediately
- [ ] **Real-World Example**: Actual URL tested, with actual output shown
- [ ] **Command Reference**: All CLI flags and parameters documented
- [ ] **Output Interpretation**: Explains what the data means and how to use it
- [ ] **Integration Guide**: Shows how tool works with other toolkit tools
- [ ] **Troubleshooting Section**: Common issues and solutions
- [ ] **Last Modified Footer**: Date, version, status included
- [ ] **Code Examples Test**: All examples actually run successfully
- [ ] **Screenshots Current**: Images match current tool output

### **For README.md Updates**

- [ ] **Features List Updated**: New capabilities added with ⭐ NEW badge for current version
- [ ] **Tools Table Updated**: Command, purpose, and version added noted
- [ ] **Use Cases Updated**: Real scenarios showing when to use new tool
- [ ] **Tools Count Accurate**: Update "11 comprehensive tools" count
- [ ] **Links Valid**: All documentation links point to existing files

### **For CHANGELOG.md Updates**

- [ ] **Version Section**: Changes under correct version heading
- [ ] **Category Correct**: Added/Changed/Fixed/Removed/Deprecated
- [ ] **Description Clear**: Non-technical users can understand impact
- [ ] **Link to Guide**: Reference to detailed documentation if complex feature

---

## 🤖 AI Agent Collaboration Guidelines

### **For AI Agents: Documentation Update Protocol**

When implementing features, follow this sequence:

1. **Implement Code** → Tool works correctly
2. **Create Guide** → Comprehensive documentation in `docs/guides/`
3. **Update README** → Add to features, tools, use cases
4. **Update CHANGELOG** → Document in unreleased section
5. **Update Copilot Instructions** → If architectural pattern added
6. **Test All Documentation** → Run examples, verify screenshots
7. **Add Last Modified Dates** → Current date on all changed files

### **Documentation as Code Review**

Before marking task complete:

```markdown
## Pre-Completion Checklist
- [ ] Code implements feature correctly
- [ ] Guide created in docs/guides/ with real examples
- [ ] README.md updated (features, tools, use cases)
- [ ] CHANGELOG.md updated with clear description
- [ ] npm script added to package.json
- [ ] All code examples tested and working
- [ ] Last Modified dates updated
- [ ] Links verified (no 404s)
```

### **Handoff Documentation**

When completing work session, document:

1. **What Was Changed**: Files modified and why
2. **Documentation Updated**: Which docs reflect changes
3. **Pending Documentation**: What still needs updating
4. **Testing Status**: What's been validated vs needs testing

---

## 🔍 Documentation Maintenance Schedule

### **Weekly (During Active Development)**
- Update CHANGELOG.md with unreleased changes
- Review Last Modified dates (should be current)

### **Before Each Release**
- Verify all features documented
- Update toolkit version in all guide footers
- Test all code examples
- Check all links

### **Quarterly (Maintenance Mode)**
- Review all guides for accuracy
- Update stale examples
- Refresh screenshots
- Archive deprecated documentation

### **Annually**
- Complete documentation audit
- Reorganize if structure has evolved
- Update copilot instructions with lessons learned
- Archive old version-specific documentation

---

## 📚 Reference Documentation Standards

### **Internal Links (Relative Paths)**

**Preferred**:
```markdown
See [CSS Extraction Guide](../guides/css-extraction.md) for details.
```

**Avoid**:
```markdown
See CSS Extraction Guide at https://github.com/... (external link)
```

### **External Links (Full URLs)**

For TQFA best practices or external resources:

```markdown
**Reference**: [TQFA Best Practices](https://raw.githubusercontent.com/Texas-Quantitative/tqfa-development-best-practices/master/README.md)
```

### **Code Examples**

Always include:
1. **Command to run**
2. **Expected output** (sample)
3. **What to look for** (interpretation)

**Example**:
```markdown
### Example Usage

\`\`\`bash
npm run analyze:responsive -- https://example.com
\`\`\`

**Output**: Creates `analysis/responsive-example-com.json` with breakpoint data.

**Look for**: The `layoutShifts` array showing major responsive changes at 768px and 1024px.
```

---

## ✅ Success Metrics

**Documentation is succeeding when**:

- ✅ New users can run their first analysis in <5 minutes
- ✅ AI agents can implement features by following copilot instructions
- ✅ Guides reflect actual usage patterns from real projects
- ✅ Last Modified dates are current (within last 3 months for active tools)
- ✅ Zero broken links in documentation
- ✅ Code examples run successfully without modification
- ✅ Handoffs between agents are smooth (no context loss)

**Documentation is failing when**:

- ❌ Users ask questions already answered in docs (docs not discoverable)
- ❌ Examples don't work (outdated code)
- ❌ Last Modified dates >6 months old (documentation drift)
- ❌ AI agents recreate existing functionality (copilot instructions unclear)
- ❌ Real-world usage differs significantly from documented use cases

---

## 🆘 Recovering from Documentation Debt

**If documentation has fallen behind**:

1. **Triage**:
   - List all undocumented features
   - Identify broken examples
   - Note missing guides

2. **Prioritize**:
   - P0: Copilot instructions, README, CHANGELOG
   - P1: Guides for most-used tools
   - P2: Advanced feature guides
   - P3: Edge case documentation

3. **Execute**:
   - Fix P0 immediately
   - Schedule P1 before next release
   - P2/P3 as time permits

4. **Prevent**:
   - Add "Documentation Complete" to definition of done
   - Block merges without documentation updates
   - Schedule regular documentation reviews

---

**Last Modified**: 2025-10-22
**Toolkit Version**: 1.1.0
**Status**: Current
