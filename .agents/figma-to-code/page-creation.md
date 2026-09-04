# **Astro JS + SCSS Page Creation Guidelines**

You are converting a Figma design into a production-ready static site using **Astro JS + SCSS**, following a provided custom starter template. Adhere strictly to the conventions and workflow below.

---

### Understanding The Current State
- By the time you are asked to implement a page, the project workspace already contains the following:
  1. A full-fledged style guide (design tokens, typography classes, utility classes).
  2. Core shared components in `src/components/`.

---

### Project Structure & Reusability

- **Do not modify** existing layout files, global SCSS (`main.scss`, `resets.scss`, `typography.scss`, `variables.scss`), or pre-built components unless absolutely necessary.
- **Before coding a page**:
  1. Review all existing components in `src/components/` to reuse them instead of rebuilding custom markup.
  2. Study global SCSS files to leverage:
     - Utility & reusable classes (`main.scss`)
     - Typography classes (`typography.scss`) — use these for all headings/body text.
     - Design tokens (`_variables.scss`) — use for colors, spacing, etc.
  3. Check `src/assets/` and `src/icons/` for matching Figma layer names. Use real assets when available; otherwise, use project placeholders. Avoid Unsplash/stock images at all costs.

> **Do not**:
> - Add new utility classes, global variables, or components unless explicitly required.
> - Hardcode colors **unless** a needed color has no corresponding Figma variable or design token.
> - Create new typography classes — if no class matches the text you are styling, pick the closest one and **override only necessary properties** in the page's own `.scss` file.

---

### Page Development Rules

- Place all page content inside the default `<main>` tag.
- If you see a group in Figma that has a `-section` suffix in the layer name, make sure to structure that group into a `<section>` element.
- Section structure standard:

  ```html
  <section class="hero">
    <div class="container hero__wrapper">
      <!-- Content -->
    </div>
  </section>
  ```

  - Use the `.container` class specified in `main.scss` for max-width constraint (almost always on the direct child of `<section>` or top-level wrapper).
  - Use `&__wrapper` (not `.container`) for page-specific layout styling in SCSS.
  - Apply full-bleed section background images/colors to the `.section-class`, **not** `.section-class__wrapper`.

---

### Step-by-Step Execution: Section-by-Section Visual Verification Loop

To guarantee pixel-perfect fidelity and avoid compound styling errors, you must follow a strict **section-by-section iterative workflow**:

1. **Work on One Section at a Time:**
   - Focus exclusively on building the markup and SCSS for a single section (e.g., Hero section) before touching any subsequent section.
2. **Visual Inspection via Browser Tool:**
   - Open the local dev server URL (e.g., `http://localhost:4321/` or the target route) using your browser tool.
   - Capture a visual snapshot/screenshot of the rendered section in the live browser.
   - Compare the live rendering directly against the corresponding Figma section screenshot/design frame.
3. **Iterative Visual Refinement:**
   - Do **not** rely solely on raw Figma MCP output (which may have discrepancies in computed layout, spacing, SVG exports, or typography line heights).
   - Check alignment, font sizes, line heights, letter-spacing, padding, margins, gaps, colors, borders, image aspect ratios, and icon positions.
   - Make all necessary tweaks in the `.astro` markup and page `.scss` file.
   - Re-verify in the browser until the rendered section matches the Figma design pixel-perfectly.
4. **Strict Gatekeeping:**
   - **Never advance to the next section before verifying and perfecting the visuals of the current section.** Repeat this cycle sequentially for every section until the entire page is complete.

---

### SCSS Conventions

- Each page must have its own dedicated SCSS file in `src/styles/pages/[page-name].scss` (create if missing).
- In the Astro config, `_abstracts.scss` is automatically injected into every SCSS file. `_abstracts.scss` forwards `_variables.scss` and `utils/functions.scss`, so variables and functions are already available globally in page and component SCSS files. Do **not** add manual `@use` imports for variables, abstracts, or functions at the top of SCSS files.
- Import the page's SCSS file in the Astro frontmatter (`import '../styles/pages/[page-name].scss';`).
- SCSS structure example:
  ```scss
  // Hero Section Styles
  .hero {
    // Section-level spacing (e.g., margin-block), background images if any
    ...
    &__wrapper {
      // Container layout styling (display, grid, flex, gap)
    }
    // Other section element styles (BEM convention)
  }

  // Next Section Styles
  .about {
    // Similar structure
  }
  ```
