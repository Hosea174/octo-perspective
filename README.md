# Octo Perspective

An Astro and GSAP experience exploring Wendy Taylor's Octo sculpture. The Figma background is currently a fixed image. Webcam face and hand tracking run locally in a worker; normal mouse, touch, and keyboard navigation remain available.

## Run

```sh
bun install
bun run dev
```

Open the local URL and allow camera access. Point to move the virtual cursor, pinch to click, and make a fist and move your hand to scroll. The browser downloads MediaPipe models when tracking starts. Camera access requires localhost or HTTPS.

## 3D scene

The Three.js and Spark prototype remains available at `/?scene=3d`, using `public/media/demoSplat.ply` as its temporary scene. The default route does not load the 3D scene. Replace the asset and adjust its framing in `src/scripts/playground.ts` when the custom scene is ready.

## Assets and type

The design uses locally installed Creators and Helvetica Now Display fonts where available; fallback fonts are provided. Font files are not included in the repository. The Octo sculpture scan is [Infinity Octo Art MK](https://superspl.at/scene/94b17a0d) by Natural Splats, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The temporary 3D scene is from [sensai-off-axis](https://github.com/V4C38/sensai-off-axis).

```sh
bun src/scripts/gestures.test.ts
bun run typecheck
bun run build
```
