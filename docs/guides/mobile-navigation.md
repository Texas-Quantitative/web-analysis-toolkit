# Mobile Navigation & Modal Analysis Guide

> **Detecting hamburger menus, analyzing mobile navigation patterns, and extracting modal dialog specifications**

## Overview

The Mobile Menu/Modal Analyzer is designed to automatically detect and analyze mobile navigation patterns, including:

- **Hamburger menu icons** and their styling
- **Mobile navigation swaps** (when desktop nav disappears and mobile menu appears)
- **Modal dialogs** and slide-in menus
- **Modal positioning** and dimensions at specific breakpoints
- **Animations and transitions**
- **Z-index layering**
- **Modal content** (links, buttons, phone numbers)

## Quick Start

### Basic Usage

```bash
# Analyze mobile menu at default breakpoint (767px)
npm run analyze:mobile-menu -- https://example.com

# Analyze at custom breakpoint
npm run analyze:mobile-menu -- https://example.com 991
```

### Output

The analyzer generates three files:

1. **JSON data**: `analysis/mobile-menu/YYYY-MM-DD-example-com-mobile-menu.json`
2. **Markdown report**: `analysis/mobile-menu/YYYY-MM-DD-example-com-mobile-menu.md`
3. **Screenshots**: 
   - Before interaction: `analysis/screenshots/YYYY-MM-DD-example-com-mobile-before.png`
   - After interaction: `analysis/screenshots/YYYY-MM-DD-example-com-mobile-after.png`

## Common Mobile Menu Patterns

### 1. Hamburger Icon Types

The analyzer detects various hamburger icon implementations:

#### SVG Icons
```html
<button class="navbar-toggler">
  <svg viewBox="0 0 24 24">
    <!-- SVG paths -->
  </svg>
</button>
```

#### Font Awesome
```html
<button class="menu-toggle">
  <i class="fa fa-bars"></i>
</button>
```

#### CSS-Based (Three Lines)
```html
<button class="hamburger">
  <span></span>
  <span></span>
  <span></span>
</button>
```

### 2. Modal Positioning Patterns

#### Right Slide-In (Most Common)
```css
.mobile-modal {
  position: fixed;
  top: 0;
  right: 0;
  width: 75%;
  max-width: 280px;
  height: 100vh;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.mobile-modal.show {
  transform: translateX(0);
}
```

#### Left Slide-In
```css
.mobile-modal {
  position: fixed;
  left: 0;
  transform: translateX(-100%);
}
```

#### Full-Screen Overlay
```css
.mobile-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
```

#### Centered Modal
```css
.mobile-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
}
```

### 3. Navigation Swap Detection

The analyzer identifies the exact breakpoint where navigation changes:

**Desktop Navigation (visible at ≥768px):**
```css
.desktop-nav {
  display: flex;
}

@media (max-width: 767px) {
  .desktop-nav {
    display: none;
  }
}
```

**Mobile Menu (visible at <768px):**
```css
.mobile-menu-toggle {
  display: none;
}

@media (max-width: 767px) {
  .mobile-menu-toggle {
    display: block;
  }
}
```

## Real-World Example: Dental Practice Website

### Findings from Analysis

**Breakpoint:** 767px

**Hamburger Icon:**
- Type: SVG
- Color: `#ffffff`
- Position: `top: 20px, right: 20px`
- Size: `24px × 24px`

**Modal Dialog:**
- Position: `fixed; right: 0; top: 0`
- Width: `75%`
- Max-width: `280px`
- Border-radius: `12px 0 0 12px` (rounded left corners)
- Background: `rgba(255, 255, 255, 0.98)`
- Box-shadow: `-2px 0 8px rgba(0,0,0,0.1)`
- Transform: `translateX(100%)` → `translateX(0)` when shown
- Transition: `transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

**Modal Content:**
- Navigation links: 5 items
- Phone number: `(555) 123-4567`
- CTA button: "Book Appointment"

**Z-Index Layers:**
- Backdrop: `z-index: 1000`
- Modal: `z-index: 1001`

## Analysis Output Interpretation

### JSON Structure

```json
{
  "url": "https://example.com",
  "breakpoint": 767,
  "hamburgerIcon": {
    "selector": ".navbar-toggler",
    "iconType": "svg",
    "position": { "top": 20, "left": 1200 },
    "styles": {
      "color": "#ffffff",
      "backgroundColor": "transparent"
    }
  },
  "modal": [{
    "selector": ".mobile-modal",
    "positioning": {
      "position": "fixed",
      "right": "0",
      "width": "75%",
      "maxWidth": "280px"
    },
    "styling": {
      "borderRadius": "12px 0 0 12px"
    },
    "transform": {
      "transform": "translateX(100%)",
      "transition": "transform 0.3s ease"
    }
  }],
  "modalOpenState": {
    "modalsOpen": [{
      "content": {
        "links": [...],
        "phoneNumbers": [...],
        "buttons": [...]
      }
    }]
  }
}
```

### Markdown Report Sections

1. **Desktop vs Mobile Navigation** - Visibility changes at breakpoint
2. **Hamburger Icon** - Type, styling, position, accessibility
3. **Modal Dialogs** - Initial state, positioning, styling
4. **Modal Open State** - Content structure after interaction
5. **Z-Index Layers** - Stacking order visualization

## Common Use Cases

### 1. Recreating a Mobile Menu

**Workflow:**
```bash
# Step 1: Analyze mobile menu
npm run analyze:mobile-menu -- https://original-site.com 767

# Step 2: Review the generated report
cat analysis/mobile-menu/*-mobile-menu.md

# Step 3: Extract exact specifications
# - Hamburger icon: SVG source, color, size
# - Modal: positioning values, dimensions, border-radius
# - Animations: transition properties
# - Content: navigation links structure

# Step 4: Implement in your recreation
# Use the exact values from the JSON output
```

### 2. Comparing Breakpoints

```bash
# Analyze at multiple breakpoints
npm run analyze:mobile-menu -- https://example.com 575  # Phone
npm run analyze:mobile-menu -- https://example.com 767  # Tablet
npm run analyze:mobile-menu -- https://example.com 991  # Small desktop
```

### 3. Extracting Animation Properties

The analyzer captures:
- `transform` properties (slide-in direction)
- `transition-duration` (animation speed)
- `transition-timing-function` (easing)
- `transition-delay` (start delay)

**Example Output:**
```json
{
  "transform": {
    "transform": "translateX(100%)",
    "transitionDuration": "0.3s",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)",
    "transitionDelay": "0s"
  }
}
```

## Best Practices

### 1. Choose the Right Breakpoint

Common breakpoints:
- **575px**: Small phones (portrait)
- **767px**: Tablets (portrait) - **most common for mobile menu**
- **991px**: Tablets (landscape) / small laptops
- **1199px**: Desktop

### 2. Verify Hamburger Icon Accessibility

Check the analysis for:
- `aria-label`: Should describe the action ("Toggle menu", "Open navigation")
- `aria-expanded`: Should toggle true/false
- `role="button"`: If not using `<button>` element

### 3. Modal Positioning Recreation Tips

**For right slide-in menus:**
```css
.mobile-modal {
  position: fixed;
  top: 0;
  right: 0;
  width: 75%;              /* From analysis */
  max-width: 280px;        /* From analysis */
  height: 100vh;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.mobile-modal.show {
  transform: translateX(0);
}
```

**For centered modals:**
```css
.mobile-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
}
```

### 4. Z-Index Layer Management

Use the z-index analysis to recreate proper stacking:

```css
.modal-backdrop {
  z-index: 1000;  /* From analysis */
}

.modal {
  z-index: 1001;  /* From analysis */
}

.modal-close-button {
  z-index: 1002;  /* From analysis */
}
```

## Troubleshooting

### Hamburger Not Detected

**Possible reasons:**
- Hidden by default (only appears at certain widths)
- Custom class names not in the selector list
- JavaScript-rendered element (delay in page load)

**Solution:**
Try a smaller viewport width or check the screenshots to manually identify the selector.

### Modal Not Opening

**Possible reasons:**
- JavaScript required to add `.show` class
- Animation delay too long
- Modal requires multiple clicks or gestures

**Solution:**
Check the `modalOpenState` in the JSON. If empty, the modal may require JavaScript interaction that wasn't triggered.

### Missing Content

**Content extraction is limited to visible elements.**

If modal content is missing:
- Check if content is lazy-loaded
- Verify the modal actually opened (check screenshots)
- Look for iframe or shadow DOM content

## Advanced Techniques

### Custom Viewport Sizes

```javascript
// Modify the analyzer to test unusual widths
node src/analyzers/mobile-menu.mjs https://example.com 600
```

### Analyzing Multiple Modals

Some sites have multiple modal patterns (navigation, search, cart). The analyzer captures all detected modals.

**Filtering in the JSON:**
```javascript
const navModal = analysis.modal.find(m => 
  m.selector.includes('nav') || m.selector.includes('menu')
);
```

## Integration with Other Tools

### Combine with Responsive Analyzer

```bash
# Get breakpoint overview
npm run analyze:responsive -- https://example.com

# Then analyze specific mobile menu behavior
npm run analyze:mobile-menu -- https://example.com 767
```

### Combine with Interactive States Analyzer

```bash
# Analyze hamburger button states
npm run analyze:interactive -- https://example.com ".navbar-toggler"

# Then analyze modal behavior
npm run analyze:mobile-menu -- https://example.com 767
```

### Combine with Positioning Calculator

```bash
# Analyze exact positions within modal
npm run analyze:positioning -- https://example.com ".mobile-modal"
```

## Summary

The Mobile Menu/Modal Analyzer automates the tedious process of:

1. ✅ Detecting when mobile navigation appears
2. ✅ Identifying hamburger icon type and styling
3. ✅ Extracting modal positioning and dimensions
4. ✅ Capturing modal content structure
5. ✅ Recording animation and transition properties
6. ✅ Documenting z-index layers
7. ✅ Taking before/after screenshots

This saves hours of manual inspection and ensures pixel-perfect recreation of mobile navigation patterns.

---

**Next Steps:**
- [Iterative Refinement Guide](./iterative-refinement.md) - Fine-tuning spacing and positioning
- [Responsive Analysis Guide](./responsive-analysis.md) - Multi-breakpoint analysis
- [Interactive States Guide](./interactive-states.md) - Hover, focus, and click behaviors

---

**Last Modified**: 2025-10-22  
**Toolkit Version**: 1.1.0  
**Status**: Current
