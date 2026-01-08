# 🎨 Style Guide Implementation Task

## 📋 Overview

Modify the following SCSS files in this Astro project based on the **attached style guide screenshot**:

### 📁 Files to Update:

- `main.scss`
- `typography.scss`
- `variables.scss`

> **Note:** The files already contain boilerplate code. Use the existing structure as an example and update it to match the attached style guide. Ensure there're no boilerplate oversights.

---

## 🚀 Implementation Instructions

### 1. **variables.scss**

**Target:** Update design system variables

#### 🎨 **Color Variables**

- Update color variables using the hex codes from the screenshot
- **Three color groups:**
  - `primary`
  - `secondary`
  - `neutral`
- I mostly use these three, but feel free to use different grouping based on the attached style guide

#### 📊 **Color Structure**

Each group includes different shades (e.g, 50, 100, 200, 300, ..., 900)

> **Action:** Use the specific shades' suffix and hex code from the screenshot to define variables

#### 🔤 **Typography Variables**

- **Font families:** header, body, (and optionally accent)
- **Font properties:** weights, sizes, letter spacing, and line heights (based on typography section)

> **Convention:** Use naming conventions from current example/template files

---

### 2. **typography.scss**

**Target:** Define font system and reusable classes

#### 🔤 **Font Declarations**

- Define all `@font-face` declarations at the top
- **Assumption:** All fonts are in `.woff`/`.woff2` format inside `public/fonts/`

#### 📚 **Reusable Classes**

Create classes for each font category shown in the screenshot:

- Use **SCSS variables** for:
  - `font-family`
  - `weight`
  - `size`
  - `spacing`
  - `line-height`

> **Flexibility:** Add/remove/modify classes as needed

> **Convention:** Use class naming conventions from current template files

---

### 3. **main.scss**

**Target:** Update global styles with brand consistency

#### 🏗️ **Structure**

- Keep the file structure **mostly unchanged**

#### 🖱️ **Custom Scrollbar**

- Update custom scrollbar styles to match brand colors
- **Source:** Use primary color shades from `variables.scss`
- **Goal:** Ensure colors match the brand palette

---

## ⚠️ Important Constraints

### ✅ **DO:**

- Follow the existing file structure
- Use current naming conventions
- Match the design system from the screenshot

### ❌ **DO NOT:**

- Modify any other files
- Install dependencies
- Run unrelated commands
- Touch files with outdated variables/styles (unless specified)

---

## 🎯 **Completion Criteria**

**Once you finish updating these files, your job is DONE.**

> **Remember:** Focus only on the three specified SCSS files and their specific requirements.
