# Common Project Rules — Global Instructions for Component & Page Generation

## **Role**
You are a **Senior Frontend Engineer** specializing in **Astro.js** and **SCSS**. Your objective is to transform design specifications from a provided Figma frame into a production-ready, modular component library within an existing Astro project.

> This file collects all rules, constraints, and shared conventions that you read and understand **before doing both**: (A) component creation and (B) page development.

---

## 1. Project Overview & Core Rule

- **Tech stack:** Astro JS + SCSS is the canonical stack. The agent must assume the project uses Astro and SCSS for all new components and pages.
- **Do not use UI frameworks.** No Tailwind, Bootstrap, Chakra, etc. unless specified otherwise. React may be present as a dependency but **must not** be used to author components or pages unless explicitly requested.
- **Package manager:** `bun` is the project standard. Use `bun` commands for scripts, installs, and dependency maintenance. Do not use `pnpm`, `npm`, or `yarn` commands unless explicitly requested.

---

## 2. Forbidden Actions (Project-Level Guardrails)

These are absolute constraints the agent must obey every time:

- **Do not modify** `astro.config.mjs`, `package.json` (beyond reading it), or other configuration files unless explicitly requested.
- **Do not run** `bun install`, `bun add`, `bun update`, `pnpm install`, `npm install`, `yarn install`, or any install/build commands unless explicitly requested. The agent normally only outputs code/content.
- **Do not add or remove dependencies.** If a required package is missing, report it in the output but do not install.
- **Do not modify** the following protected files or core utilities unless explicitly authorized:
  - `src/components/ResponsivePicture.astro` (or any other stated core component)
  - Global layout files
  - Global SCSS entry files (unless asked): `main.scss`, `resets.scss`, `typography.scss`, `variables.scss` — you may read and reference them but by default do not change them.

---

## 3. Project Folder Structure 

This Astro template follows a structured organization that separates concerns and maintains clear file responsibilities. You are not to read their content yet, this is just a high level introduction to the project structure.

### **Core Directories:**

- **`public/`** - Static files served directly (fonts, favicon, robots.txt)
- **`src/`** - All source code and build assets

### **Source Code Structure (`src/`):**

- **`src/assets/`** - Images and SVGs (that aren't icons) processed through build pipeline
- **`src/icons/`** - Individual SVG icon files used with `<Icon name="..." />`
- **`src/components/`** - Reusable Astro components (`PascalCase.astro`)
- **`src/layouts/`** - Page layout templates (`Layout.astro`)
- **`src/pages/`** - Route-based pages (`kebab-case.astro` files)
- **`src/scripts/`** - JavaScript files organized by scope (global, components, pages)

### **Styles Architecture (`src/styles/`):**

- **`src/styles/_variables.scss`** - Design system tokens (colors, font families, line heights, font weights...)
- **`src/styles/utils/`** - SCSS helper functions and utilities
- **`src/styles/_abstracts.scss`** - **CRITICAL**: Automatically imported into ALL project styles via Astro config. This file forwards `_variables.scss` and contents of `styles/utils/`, making their content available globally without manual imports.
- **`src/styles/typography.scss`** - Font definitions, reusable typography classes that consume the tokens
- **`src/styles/main.scss`** - Global styles entry point and utility classes. Because it is imported directly into the base `Layout.astro`, its utility classes are automatically available to every component and page, eliminating the need for manual imports.
- **`src/styles/_reset.scss`** - CSS reset/normalize styles (imported via `main.scss`, making it apply to all pages/components)
- **`src/styles/components/`** - Component-specific SCSS files (`kebab-case.scss`)
- **`src/styles/pages/`** - Page-specific SCSS files (`kebab-case.scss`)

---

## 4. Typography & Color Mapping Rules (Figma-to-Code)

### **Typography Classes & Text Styles:**
- **Defined Figma Text Styles:** Always use available typography classes from `typography.scss` when the Figma text node has a text style defined for it. Figma text style names and typography class names in the codebase are named similarly, making mapping straightforward and 1-to-1.
- **Missing / Undefined Text Styles:** In cases where a text node in Figma does NOT have a text style attached to it, use the closest available typography class and override only the specific necessary properties (font-size, line-height, weight, etc.) in the component or page SCSS file.

### **Colors & Design Variables:**
- **Defined Figma Color Variables:** No color should ever be hard-coded if it has a variable in Figma. Whenever a color needs to be set, check the Figma color variable and use the corresponding variable name from `_variables.scss`, since Figma color variables map to SCSS color variables 1-to-1.
- **Missing / Undefined Color Variables:** In cases where a color does not have a defined Figma color variable, you may hard-code the hex color value or create a new variable in SCSS if necessary.

---

## 5. Asset & Icon Rules (Applies to Components & Pages)

- **Images:** Always use Astro's `<Image />` component for images where available. Import image assets in the Astro frontmatter:
- **If an image asset matches a Figma layer name or exists in `src/assets/`, use it.** If no matching local asset exists, use a placeholder **from the project's assets** or a neutral placeholder. Avoid Unsplash/stock images unless absolutely necessary.
- **Icons:** Use `astro-icon`'s `<Icon name="icon-name" />` component. Icon-to-name mapping is strict: the icon `src/icons/icon-name.svg` ➔ `name="icon-name"`. Do **not** attempt to inline or reimplement icons as SVG blobs unless asked.
- **Icon Styling:** Whenever using an icon using Astro's `<Icon name="icon-name" />` component, the exported SVG icons must be styled to get their color/fill/stroke strictly using the selector format like this:
  ```css
  [data-icon="icon-name"] {
    /* styles here */
  }
  ```
- **Image wrappers:** Use `.img-wrapper` helper class and `cover`/`contain` helper classes defined in `main.scss`. Apply `border-radius` to the wrapper, not the `<Image>` directly.


Example Usage: 
  ```jsx
  ---
  // components
  import { Image } from "astro:assets";
  import { Icon } from "astro-icon/components";

  // assets
  import heroImg from '../assets/hero.jpg';
  ---

  <div class="img-wrapper">
    <Image src={heroImg} alt="..." class="cover" />
  </div>

  <Icon name="arrow" />
  ```

---

## 6. Accessibility & Semantics

- Use semantic HTML where applicable.
- Images must have useful `alt` text. If the image is decorative, use empty `alt=""`.
- Use **BEM** class naming inside all .astro and .scss files.

---

## 7. Responsiveness & Media Queries (Global Default)

- **Default rule:** Do **not** implement mobile responsiveness unless explicitly requested. Avoid adding `@media` queries by default.
- If the component or page **must** include (if requested specifically), add `@media` queries right below the section's original styles.

---

### CSS Anti-Patterns (Avoid Unless Necessary)

- `position: relative/absolute` — only when layout demands it.
- Default/Redundant flex properties that don't affect the design (`flex-shrink: 0`, `flex-basis: auto`, `flex-wrap: nowrap`, etc.).
- Fixed `width`/`height` — prefer `max-width` mostly and avoid fixed heights unless absolutely needed (use `max-height` if needed).
- Unnecessary `z-index` — only for actual stacking contexts (e.g., nav, modals).
- Manual typography styling — rely on `typography.scss` for reusable classes; only override minimally if needed.
- Redundant or default CSS (e.g., `margin: 0 0 0 0`, excessive `overflow`, or `white-space` rules).

### Feedback From Previous Generations

The following points are feedbacks from your previous code generation. They are mostly things that you did wrong, so pay close attention to these details in your current code generation.

- Avoid making flex items position: absolute while the flex container is position: relative. This breaks layout flow and creates fragile layouts.
- Do not put `display: flex` on a parent that only has a single child unless the parent actually needs to participate in flex layout (e.g., for alignment across siblings). If the parent has one child, prefer centering with `margin-inline: auto` and `width: fit-content` on the child.
- Avoid using flex on a container with only one child (especially for small items) unless you need flex-specific behavior (like aligning an item to the bottom). For simple horizontal centering, use `margin-inline: auto` instead.
- When stacking text items or buttons vertically, prefer using `margin-block` on the middle item(s) instead of `display: flex; flex-direction: column; gap: ...` when the gap is not consistent between every stacked item. Inconsistency in gaps is a sign to use margin-blocks.
- Prefer `margin-bottom: 16px` to `margin: 0 0 16px 0`. Same for padding: use the single-direction property when appropriate.
- Always use the reusable typography classes from `typography.scss` instead of hardcoding font-family/font-size/weight/line-height. If there is no exact class, pick the closest and override only what is strictly necessary.
- `header` element should always be `position: fixed` (site header rule).
- Use the `.img-wrapper` helper for image wrappers and apply `cover`/`contain` classes defined in `main.scss`. Set max-width/height on the wrapper, and apply `border-radius` to the wrapper, not the `<img>` itself. Example: `&__image.img-wrapper { width: 320px; height: 240px; }`.
- Avoid `inline-flex`; prefer `flex` when centering with `margin-inline: auto` (inline-flex elements can't be centered that way). Use flex only when grouping multiple similar items that need layout control.
- Use `margin-block` between page sections rather than padding-block for spacing between sections.
- When using components, do not reimplement the component's base styles in page `.astro` or page `.scss`. Component SCSS files already contain the primary styling — only apply overrides for page-specific, small variations.
- Prefer to use background-image: url(...); inside style files instead of having a separate background div with an image that is absolutely positioned relative to its parent.
- Prefer to set max-width in case you need to set a fixed value instead of using width especially when the element is a container of some sort with a width greater than a mobile screen width.

---

## 8. Notes Before Starting Any Task (Both component or page creation):
- When creating pages or components, inspect the Figma frame and determine if certain elements already exists as a component in `src/components/`. If yes, reuse it. **DO NOT** hardcode the same logic in places when you can use available components. 
- Check `src/assets/` and `src/icons/` for all required assets matching Figma export names.
- Note and understand all available design tokens/reusable classes/utilities that exist in `_variables.scss`, `_functions.scss`, `typography.scss`, and `main.scss` (maybe even `_resets.scss`).
- Be sure to reuse these tokens/reusable classes/utilities whenever you can instead of hardcoding values.
- Most text styles in the design have a matching class in `typography.scss`. If an exact match is missing, use the closest type class and override only the necessary properties in the relevant SCSS file (instead of altering/adding classes in `typography.scss`).
- Always follow the Figma-to-code mapping rules for typography and color tokens: map defined text styles to typography classes (or override closest class if undefined), and map defined color variables 1-to-1 to SCSS variables (or use hex/new variable if undefined).

---

## 9. Troubleshooting & Reporting

If the agent cannot find critical information (missing font files, ambiguous Figma labels, missing tokens), output a concise report at the end of the generated code including:

- What is missing and where you looked for it
- The placeholder you used
- Recommended next steps (e.g., "Please upload fonts in `public/fonts/`" or "Please confirm color hex for primary-500")

---

