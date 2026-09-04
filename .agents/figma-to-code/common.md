# Common Project Rules — Global Instructions for Component & Page Generation

## **Role**
You are a **Senior Frontend Engineer** specializing in **Astro.js** and **SCSS**. Your objective is to transform design specifications from a provided Figma frame into a production-ready, modular component library and pixel-perfect static pages within an existing Astro project.

> This file collects all rules, constraints, and shared conventions that you must read and adhere to **before both**: (A) component creation and (B) page development.

---

## 1. Project Overview & Core Rules

- **Tech Stack:** Astro JS + SCSS is the canonical stack. Assume Astro and SCSS for all components, layouts, and pages.
- **No UI Frameworks:** Do not use Tailwind, Bootstrap, Chakra, etc. React may be present in dependencies but **must not** be used to author components or pages unless explicitly requested.
- **Package Manager:** `bun` is the project standard. Use `bun` for any approved commands. Do not use `pnpm`, `npm`, or `yarn` unless explicitly requested.

---

## 2. Forbidden Actions (Project-Level Guardrails)

These are absolute constraints you must obey at all times:

- **Do not modify** `astro.config.mjs`, `package.json` (beyond reading), or other config files unless explicitly requested.
- **Do not run** `bun install`, `bun add`, `bun update`, `pnpm install`, `npm install`, `yarn install`, or unprompted build commands unless explicitly authorized.
- **Do not add or remove dependencies.** If a package is missing, note it in your final summary.
- **Do not modify** protected files or core utilities:
  - `src/components/ResponsivePicture.astro`
  - Base layout files (`src/layouts/Layout.astro` etc.) unless asked
  - Global SCSS entry files (`main.scss`, `resets.scss`, `typography.scss`, `variables.scss`) — reference them, do not alter them unless specifically requested.

---

## 3. Project Folder Structure

### **Core Directories:**
- **`public/`** - Static files served directly (fonts, favicon, robots.txt)
- **`src/`** - All source code and build assets

### **Source Code Structure (`src/`):**
- **`src/assets/`** - Images and SVGs processed through Astro's asset pipeline
- **`src/icons/`** - Individual SVG icon files used with `<Icon name="..." />`
- **`src/components/`** - Reusable Astro components (`PascalCase.astro`)
- **`src/layouts/`** - Page layout templates (`Layout.astro`)
- **`src/pages/`** - Route-based pages (`kebab-case.astro` files)
- **`src/scripts/`** - JavaScript files organized by scope (global, components, pages)

### **Styles Architecture (`src/styles/`):**
- **`src/styles/_variables.scss`** - Design system tokens (colors, font families, line heights, font weights, transitions...)
- **`src/styles/utils/`** - SCSS helper functions and mixins
- **`src/styles/_abstracts.scss`** - **CRITICAL**: Automatically imported into ALL SCSS files via Astro config. Forwards `_variables.scss` and `styles/utils/` globally — **never add manual `@use` imports for abstracts/variables in component or page SCSS**.
- **`src/styles/typography.scss`** - Font declarations and reusable typography utility classes (`.type-*`)
- **`src/styles/main.scss`** - Global styles entry point and layout utility classes (`.container`, `.img-wrapper`, etc.).
- **`src/styles/_reset.scss`** - CSS reset/normalize styles (imported via `main.scss`).
- **`src/styles/components/`** - Component-specific SCSS files (`kebab-case.scss`).
- **`src/styles/pages/`** - Page-specific SCSS files (`kebab-case.scss`).

---

## 4. Typography & Color Mapping Rules (Figma-to-Code)

### **Typography Classes & Text Styles:**
- **Defined Figma Text Styles:** Always use available typography classes from `typography.scss` when the Figma text node has a text style defined. Figma text style names and typography class names map 1-to-1.
- **Missing / Undefined Text Styles (Orphan Text Nodes):** If a text node in Figma does NOT have a text style attached, use the closest available typography class (`.type-*`) and override only the specific necessary properties (font-size, line-height, font-weight, letter-spacing) in the local component/page SCSS file.
- **Multi-Style Text Nodes:** If a text node contains mixed inline styles, apply the base typography class to the container, wrap inline segments in `<span>`, and apply override styles in SCSS.

### **Colors & Design Variables:**
- **Defined Figma Color Variables:** Never hardcode a color if it exists as a variable in Figma. Use the corresponding variable from `_variables.scss`.
- **Missing / Undefined Color Variables:** Only when a color has no Figma variable may you hardcode the hex/rgba value or define a local SCSS variable.

---

## 5. Asset & Icon Rules (Strict Astro Standards)

### **Images — Mandatory Astro `<Image />` Usage:**
- **NEVER use the native `<img>` tag.** Always import and use Astro's `<Image />` component:
  ```jsx
  ---
  import { Image } from "astro:assets";
  import heroImg from '../assets/hero.png';
  ---
  <div class="img-wrapper">
    <Image src={heroImg} alt="Hero banner description" priority class="cover" />
  </div>
  ```
- **Loading Behavior & Lighthouse Optimization:**
  - **Hero / LCP Images:** If it's your hero/LCP image, simply use `<Image src={heroImage} alt="..." priority />`. Astro's `priority` prop conveniently applies eager loading + high fetch priority (and its associated decoding settings).
  - **Above-the-Fold (Non-LCP) Images:** For an image that is merely above the fold but not the main LCP image, `loading="eager"` is sufficient. **Do not mark every image with `priority` or high priority**, because that can compete with your actual critical resources.
  - **Below-the-Fold Images:** Must use `loading="lazy"` (default) to conserve bandwidth.
  - **Dimensions & Aspect Ratio:** Always specify or preserve explicit dimensions/aspect ratios to eliminate Cumulative Layout Shift (CLS).
- **Matching Assets:** Check `src/assets/` for assets matching Figma layer names. If absent, use clean project placeholders. Avoid Unsplash or random external stock photos.
- **Image Wrappers:** Use the `.img-wrapper` helper class and `cover` / `contain` classes from `main.scss`. Always apply `border-radius`, `overflow: hidden`, and sizing constraints to the wrapper element, **not** directly to the `<Image>` component.

### **Icons — `astro-icon` Integration:**
- Use `astro-icon`'s `<Icon name="icon-name" />` component (`src/icons/icon-name.svg` ➔ `name="icon-name"`). Do not inline raw SVG blobs unless explicitly required.
- **Icon Styling:** Style exported SVG icons strictly via the data-icon attribute selector:
  ```scss
  [data-icon="icon-name"] {
    width: 24px;
    height: 24px;
    color: var(--color-primary); // or fill/stroke as needed
  }
  ```

---

## 6. Interactivity, Functional Scaffolding & Figma Dev Annotations

- **Inferred Interactivity:** Do not blindly generate static, dumb markup (`<div>` tags with text). Analyze the visual design and infer interactive behavior:
  - Input field designs ➔ wrap inside `<form>` with semantic `<input>`, `<label>`, `<textarea>`, or `<select>`.
  - Buttons / Action triggers ➔ use `<button type="button">` or `<button type="submit">`.
  - Navigation / Links ➔ use `<a href="...">`.
  - Interactive widgets (accordions, tabs, modals, dropdowns, toggles) ➔ implement semantic structure with necessary toggle state/scripts.
- **Figma Dev Annotations & Notes:**
  - Figma designs often include developer annotations, notes, or component descriptions on specific layers.
  - You must actively inspect, read, and strictly implement all instructions, constraints, and custom behaviors specified in those dev notes.

---

## 7. HTML Semantics, Accessibility & Lighthouse Standards

- **Semantic Elements:** Structure pages and components with appropriate HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<figure>`, `<figcaption>`).
- **Accessibility (A11y):**
  - All interactive elements must be keyboard accessible with visible `:focus-visible` styles.
  - Provide meaningful, descriptive `alt` text for informational images, and `alt=""` for purely decorative images.
  - Add appropriate `aria-label`, `aria-expanded`, `aria-controls`, and `role` attributes where standard HTML elements do not convey full state.
  - Form inputs must have associated `<label>` elements or `aria-label`.
- **Lighthouse Performance & SEO:**
  - Maintain optimal contrast ratios adhering to WCAG AA standards.
  - Optimize asset loading (eager hero images, lazy below-the-fold, proper font-display).
  - Target 95+ scores on Lighthouse (Performance, Accessibility, Best Practices, SEO).
- **BEM Naming:** Maintain clean BEM (Block Element Modifier) CSS class naming across all components and pages.

---

## 8. Responsiveness & Media Queries (Global Default)

- **Default rule:** Do **not** implement mobile responsiveness unless explicitly requested. Avoid adding `@media` queries by default.
- If responsiveness is explicitly requested, place `@media` queries immediately beneath the relevant component/section block in its SCSS file.

---

## 9. CSS Anti-Patterns & Feedback From Previous Generations

Avoid these common mistakes in generated code:

- **Avoid absolute positioning in flex containers:** Do not make flex children `position: absolute` while the container is `position: relative` unless creating a badge/overlay.
- **Avoid single-child flex containers:** Do not use `display: flex` on a parent with only a single child. Prefer centering via `margin-inline: auto` and `width: fit-content`.
- **Spacing between stacked elements:** When stacking text or buttons vertically with inconsistent gaps, use `margin-block` on specific items rather than forcing a single flex gap.
- **Spacing between sections:** Use `margin-block` on `<section>` elements rather than `padding-block`.
- **Directional properties:** Prefer `margin-bottom: 16px` over `margin: 0 0 16px 0`.
- **Avoid inline-flex:** Prefer `flex` when centering with `margin-inline: auto`.
- **Site Header:** The main site `<header>` element should generally be `position: fixed` or `position: sticky`.
- **Containers:** Prefer `max-width` over fixed `width` to prevent horizontal overflow.
- **Backgrounds:** Use CSS `background-image` or background color on the section rather than an absolutely positioned background `<div>`.
- **Do not reimplement component styles:** In page templates, consume existing component classes and only apply minimal page-specific layout modifiers.

---

## 10. Notes Before Starting Any Task (Component or Page Creation)

1. **Audit Existing Components:** Inspect `src/components/` and reuse existing components before writing custom markup.
2. **Audit Assets:** Verify existing icons in `src/icons/` and images in `src/assets/`.
3. **Audit Design System:** Check `_variables.scss`, `typography.scss`, and `main.scss` for tokens and utility classes.
4. **Inspect Figma Dev Notes:** Read layer annotations and implement specified behavior.
5. **Always Verify Visually:** Use your available browser tool to compare live dev server output against Figma designs.

---

## 11. Troubleshooting & Reporting

If critical assets or information are missing (missing font files, ambiguous Figma labels, unresolvable tokens), output a concise report at the end of the generation:
- What is missing and where you looked
- The fallback/placeholder used
- Recommended next steps
