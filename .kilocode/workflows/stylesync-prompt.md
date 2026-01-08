Please apply the CSS changes provided in the JSON input to the appropriate `.scss` files in the codebase.

You will receive one or both of the following JSON formats:

**Format 1: Direct Edits to Existing Styles or Media Queries**

This format provides individual property changes, additions, or deletions.

```json
[
  {
    "oldProperty": "property: value;",
    "newProperty": "property: value;",
    "cssSelector": ".selector",
    "mediaQuery": "min-width: 768px" // or null
  }
  // ... more changes
]
```

**Interpretation for Format 1:**

- **`cssSelector`**: The CSS selector for the rule to be modified.
- **`mediaQuery`**:
  - If `null`: The change applies to the default (non-media query) styles of the `cssSelector`.
  - If a string (e.g., `"min-width: 768px"`): The change must be applied within an _existing_ media query block that matches this query for the `cssSelector`.
- **`oldProperty`** and **`newProperty`**:
  - If `oldProperty` is specified and `newProperty` is `null`: Delete the `oldProperty` from the rule.
  - If `oldProperty` is `null` and `newProperty` is specified: Add the `newProperty` to the rule.
  - If both are specified and `oldProperty`'s value differs from `newProperty`'s value: Update the `oldProperty` to the `newProperty`'s value.
- **Grouping Changes**: If multiple changes share the same `cssSelector` and `mediaQuery` (or both are `null`), group them under a single CSS rule block to avoid redundancy.

**Format 2: New Media Query Rules**

This format defines new responsive styles within specific media query conditions.

```json
[
  {
    "mediaMatch": "max-width: 750px",
    "changes": [
      {
        "selector": ".selector",
        "defaultStyle": {
          "property": "value"
        },
        "responsiveStyle": {
          "property": "value"
        }
      }
      // ... more changes for this mediaMatch
    ]
  }
  // ... more mediaMatch blocks
]
```

**Interpretation for Format 2:**

- **`mediaMatch`**: Describes the media query condition. You must translate this into a standard CSS `@media` rule.
- **`changes`**: An array of style changes to apply within this `mediaMatch` block.
  - **`selector`**: The CSS selector for the rule.
  - **`defaultStyle`**: The original style, used for context (this will tell you which declaration is being changed inside the new `@media` rule).
  - **`responsiveStyle`**:
    - If a property has a new value: Update the property with the new value inside the newly created `@media` rule.
    - If a property's value is `"initial"`: The property should be reset to its initial value.
    - If `responsiveStyle` is `null` for a selector, it means the entire rule for that selector should be removed within this media query.

**General Instructions for both formats:**

1.  **Identify Target File**: Determine the correct `.scss` file to edit. This could be the page's SCSS file (provided separately as `PAGE_NAME`) or a component's SCSS file if the `cssSelector` clearly belongs to a component.

2.  **Use Variables**: Whenever possible, replace hardcoded values with variables from `variables.scss` (e.g., `$spacing-md`, `$color-primary`, `$breakpoint-md`).

3.  **SCSS Organization and Media Query Placement**:
    - **Place media queries at the end of each section/component block**: Always add media queries directly after the default styles within their relevant section or component. Precede the media queries with a comment such as "Responsive Styles for Hero Section" or "Responsive Styles for Button Component".
    - **Use proper SCSS syntax**: All nested selectors within media queries must use the `&__` prefix, pertaining to BEM naming convention (e.g., `&__header`, `&__title`, `&__content`).
    - **Maintain proper cascade**: Media queries should be positioned after all default styles in their section to ensure correct CSS cascade order.
    - **Merge related media queries**: If multiple media queries affect the same section, consolidate them within that section's block.
    - **Order breakpoints properly**: Within each section, order media queries from largest to smallest breakpoint.

    **Correct SCSS structure:**

    ```scss
    .hero {
      // ... existing default styles
      // ... nested element styles

      // Responsive Styles for Hero Section
      @media (max-width: 1280px) {
        &__wrapper {
          flex-direction: column;
        }

        &__title {
          text-align: center;
        }
      }

      @media (max-width: 780px) {
        &__image {
          height: 300px;
        }
      }
    }
    ```

    - If an equivalent media query already exists within the target section's SCSS, add the new responsive rules inside that existing media query block instead of creating a duplicate.

4.  **Specificity**: Ensure that any new responsive rules match or exceed the specificity of the default styles they are intended to override. Typically done by putting the `@media` rules below the default styles.

    **IMPORTANT NOTE**

- **Relevant SCSS Files Analysis**: Before making any changes, carefully review only the `.scss` file(s) directly imported by the `.astro` page you are working on, as well as the `.scss` files for any components imported into that page. Do not review `.scss` files from other pages or components that are not imported into the current `.astro` file. To determine the correct `.astro` page, refer to the `CURRENT PATH` value at the bottom of this file. For example, if `CURRENT PATH` is `/`, the corresponding `.astro` file is `src/pages/index.astro`. Always use the path to identify the target page and its relevant styles first.

- **Change Mapping**: Before modifying any file, for the JSON changes, create a comprehensive plan/todo list mapping out:
  - The exact `.scss` file(s) to modify.
  - The specific section, block, or component where the selector or media query resides.
  - Whether the change should be added to an existing rule/media query or if a new rule/media query block is required... etc.
- **Avoid Redundancy**: Only create new selector or media query blocks if no suitable existing block is present. Otherwise, merge changes into existing rules to keep the codebase DRY and organized.
- **Modification Scope**: Restrict edits to `.scss` files unless a change explicitly requires updates elsewhere. Document your planned changes before implementation to ensure clarity and minimize errors.
- **Follow the JSON Exactly**: Only modify what is explicitly described in the JSON file(s).
- **Final Note**: Only review files inside the `ai-prompts/stylesync` directory—ignore all other folders in `ai-prompts/`.

**CURRENT PATH**: `/`

---
