# **Astro JS + SCSS Page Creation Guidelines**

You are converting a Figma design into a production-ready static site using **Astro JS + SCSS**, following a provided custom starter template. Adhere strictly to the conventions below.

### Understanding The Current State
- by the time you are asked to implement a page, the project workspace already contains the following:
  1. A full fledge style guide (design tokens, utility classes)

### Project Structure & Reusability

- **Do not modify** existing layout files, global SCSS (`main.scss`, `resets.scss`, `typography.scss`, `variables.scss`), or pre-built components unless absolutely necessary.
- **Before coding a page**:
  1. Review all existing components to reuse them instead of rebuilding.
  2. Study global SCSS files to leverage:
     - Utility & reusable classes (`main.scss`)
     - Typography classes (`typography.scss`) â€” use these for all headings/body text.
     - Design tokens (`variables.scss`) â€” use for colors, spacing, etc.
  3. Check `src/assets/` and `src/icons/` for matching Figma layer names. Use real assets when available; otherwise, use placeholders. Avoid using unsplash images at all cost. Check if the assets already exist in the specified folders and use those in either scss or astro files. or just use the direct asset link. Only if you have no options should you use stock images.

> **Do not**:
>
> - Add new utility classes, global variables, or components unless explicitly required.
> - Hardcode colors **unless** a needed color has no corresponding variable.
> - Create new typography classes â€” if no class matches the text you are styling, pick the closest one and **override only necessary properties** in the page's own `.scss` file.

### Page Development Rules

- Place all page content inside the default `<main>` tag.
- If you see a group in figma that has a `-section` suffix in the layer name, make sure to make that group into a `<section>`.
- Section structure example:

  ```html
  <section class="hero">
    <div class="container hero__wrapper">
      <!-- Content -->
    </div>
  </section>
  ```

  - Use the `.container` class specified in `main.scss` for max-width constraint (almost always on the direct child of `<section>` or top-level wrapper).
  - Use `&__wrapper` (not `.container`) for page-specific styling in SCSS.
  - Apply full-bleed section background images to the `.section-class`, **not** `.section-class__wrapper`.

### SCSS Conventions

- Each page must have its own SCSS file (create if missing).
- In the Astro config, `_abstracts.scss` is automatically injected into every SCSS file. `_abstracts.scss` forwards `_variables.scss` and `utils/functions.scss`, so variables and functions are already available globally in page and component SCSS files. Do **not** add manual `@use` imports for variables, abstracts, or functions at the top of SCSS files.
- Import the page's SCSS file in the Astro frontmatter.
- SCSS structure example for the most part (adjust if needed):
  ```scss
  // Hero Section Styles
  .hero {
    // Section-level spacing (e.g., margin-block), background images if any
    ...
    &__wrapper {
      // Other top level styles if needed
    }
    // Other section elements styles
  }

  // About Section Styles
  .about {
    // Similar structure
  }
  ```

