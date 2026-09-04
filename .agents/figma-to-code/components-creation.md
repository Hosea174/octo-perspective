# **Astro JS + SCSS Component Creation Guidelines**

## Inherited Design System — Understanding The Current State

You'll inherit an Astro + SCSS project whose global design system is pre-aligned to the style guide. Treat these foundations as authoritative and Single Source of Truth rather than creating other globals or hard-coding values.

### Usage & Constraints

- Reuse tokens (`_variables.scss`), typography classes (`typography.scss`), utility functions (`_functions.scss`), and global classes (`main.scss`) for creating components. Your first step should be reading these files.
- Avoid adding new global variables or utilities unless strictly necessary.
- Do not modify the current global styles.
- A few pre-made example/template components already exist in `src/components/` (e.g., `Button.astro`, `Header.astro`, `Footer.astro`).

---

## Context & Objectives
Your task is to analyze the provided Figma design frame to:
*   **Analyze** the design to identify all unique components, interactive controls, and their different states/variants.
*   **Synchronize** the project file system by creating the necessary `.astro`, `.scss`, and optional `.js` files.
    *   *Note: If a file already exists, do not recreate it; simply prepare to populate it or modify it.*
*   **Implement** the full logic, semantic markup, inferred interactivity, and styling for every identified component.
*   **Showcase & Visually Verify** all created components on the homepage (`index.astro`) using browser inspection against the Figma component designs.

---

## Execution Workflow

### Phase 1: File System Management
1.  **Identify Components:** Locate component labels in the Figma "Components" frame. Within each "Component Preview Slot", extract the component's name from layers named `Component / ComponentName` and use `ComponentName` as the official name for file creation, noting any associated states or variants.
2.  **File Generation:** For every identified component, ensure the following files are created (or already exist):
    *   `src/components/[ComponentName].astro`
    *   `src/styles/components/[component-name].scss`
    *   `src/scripts/components/[component-name].js` *(only if complex interactivity is required)*
3.  **Naming Conventions:**
    *   **Astro Components:** `PascalCase` (e.g., `Card.astro`, `ProductCard.astro`).
    *   **SCSS Partials:** `kebab-case` (e.g., `card.scss`, `product-card.scss`).
4.  **Main Goal:** Do not write any component code yet in this phase. Simply ensure the required `.astro` and `.scss` component files exist.

### Phase 2: Architecture & Implementation
1.  **Astro Frontmatter:**
    *   Import the corresponding `.scss` file at the top of the `.astro` file.
    *   Define TypeScript interfaces for `Props` to handle content, variant selection, sizes, and states.
    *   Import necessary assets (images, icons, subcomponents) as required.
2.  **SCSS Strategy:**
    *   **Global Abstracts:** Astro config automatically injects `_abstracts.scss` into every SCSS file. `_abstracts.scss` forwards `_variables.scss` and `utils/functions.scss`, so variables and functions are already available globally in component SCSS files. Do **not** add manual `@use` imports for variables, abstracts, or functions at the top of component SCSS files.
    *   **Consolidation:** Do **not** create separate files for variants. Instead use descriptive class names and SCSS nesting for variants (e.g., `.btn`, `.btn--primary`, `.btn--outline`, `.btn--large`) within the primary component style file.
    *   Follow all rules and instructions in `common.md` (interactivity inference, semantic tags, Astro `<Image />` component, accessibility, dev annotations).

### Phase 3: Component Showcase & Visual Verification Loop
Once all components have been implemented:
1.  **Mount Showcase on Homepage (`src/pages/index.astro`):**
    *   Edit `src/pages/index.astro` to serve as a comprehensive component showcase/catalog.
    *   Import and render every newly created and modified component with realistic props, demonstrating **all variants, states (default, hover, active, disabled), sizes, and edge cases**.
    *   Organize the showcase clearly with descriptive titles/labels for each component and variant.
2.  **Browser Visual Audit:**
    *   Use your available browser tool to open the local dev server (`http://localhost:4321/` or active dev server URL).
    *   Capture visual screenshots of the rendered components on the showcase page.
    *   Compare the live rendered components directly against the Figma "Components" frame design screenshot.
3.  **Iterative Polish:**
    *   Check colors, typography, paddings, borders, border-radii, hover transitions, focus rings, and icon alignments.
    *   Iterate and tweak `.astro` and `.scss` files until the live components match the Figma design pixel-perfectly.

---

## Component Standardization Blueprints
The project contains standard starter components to illustrate the expected architectural patterns:

### 1. Button Component
*   **Reference Standard:** Use `Button.astro` and `button.scss` as the authoritative blueprint for prop mapping, variant logic, and architecture.
*   **Implementation Logic:** Retain the existing structure of `Button.astro` for handling dynamic classes for different variants (e.g., variant, size, icon placement). Modify variant names and styles to match the Figma design.
*   **Clean Slate Styling:** Read `button.scss` to understand the variant styling patterns, then rebuild its contents to match the new Figma design.

### 2. Header Component
*   **Reference Standard:** Treat `Header.astro`, `header.scss`, and `header.js` as primary architectural blueprints for all headers/navbars.
*   **Technical Audit:** Extract patterns for:
    *   Scalable `navItems` data structure in the frontmatter.
    *   Code structure and importing `header.js`.
    *   Mobile menu toggling and responsiveness.
    *   **GSAP-based** scroll animations (show/hide on scroll if applicable).
    *   Dynamic `--active` state assignment for navigation links.
*   **Implementation Logic:** Rebuild header styles and structure to match the new Figma design.

### 3. Footer Component
*   Include a small inline script or frontmatter logic to dynamically insert the current year into the copyright notice.

---

## Summary of Steps for Component Creation:
* Create `Component.astro` in `src/components/` and `component.scss` in `src/styles/components/`.
* Import the SCSS file at the top of `Component.astro` frontmatter (along with `<Icon />` or `<Image />` if needed).
* Import required assets by checking `src/assets/` and `src/icons/` for matching Figma layer names.
* Define `interface Props` to handle component inputs and destructure from `Astro.props`.
* Check and implement any Figma Dev Notes / Annotations.
* Infer interactive elements (e.g., inputs in `<form>`, buttons, links).
* For complex JS, create `component.js` in `src/scripts/components/`; use inline `<script>` tags for lightweight interactions.
* Update `src/pages/index.astro` to display all component variants.
* Open dev server in browser tool, compare with Figma screenshots, and iterate until pixel-perfect.

---

## Strict Constraints & Guardrails

*   **Component Focus:** When in component creation mode, focus on standalone, reusable components.
*   **Naming Alignment:** Use the component labels provided in the Figma frame to name project files and CSS classes.
*   **No Environment Changes:**
    *   **Do not** run `bun install`, `bun add`, `bun update`, `pnpm install`, `yarn install`, or `npm install` unless explicitly requested. Assume needed packages are already installed.
    *   **Do not** modify `astro.config.mjs` unless explicitly instructed.
*   **Protected Files:** **Do not modify `ResponsivePicture.astro`** or other core foundational utilities unless explicitly instructed.
