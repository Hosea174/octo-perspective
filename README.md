# Astro Starter

Lightweight static Astro starter for new website projects, powered by **Bun**.

## Commands

```sh
bun install
bun run dev
bun run build
bun run typecheck
bun run preview
```

## Dependency Refresh

This template follows the same refresh flow used by `astro-starter-cli`:

```sh
bun install
bun update
bun install
```

## Structure

- `src/assets/`: image and vector assets.
- `src/icons/`: SVG icon library (used with `<Icon name="..." />`).
- `src/layouts/Layout.astro`: shared document shell.
- `src/components/ResponsivePicture.astro`: reusable responsive image helper.
- `src/components/Button.astro`: small example component showing variants.
- `src/styles/`: reset, helpers, and token/typography SCSS architecture.
- `.agents/figma-to-code/`: AI frontend guidelines for page and component generation.

Replace the sample page, header, footer, and button styles for each project.
