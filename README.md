# Octo Perspective

An Astro and GSAP experience exploring Wendy Taylor's Octo sculpture. The Figma background is currently a fixed image. Webcam face and hand tracking run locally in a worker; normal mouse, touch, and keyboard navigation remain available.

## Run

```sh
bun install
bun run dev
```

Open the local URL and allow camera access. Point to move the virtual cursor, pinch to click, and make a fist and move your hand to scroll. The browser downloads MediaPipe models when tracking starts. Camera access requires localhost or HTTPS.

## 3D scene

The default route renders `public/media/octo.spz` with Three.js and Spark. The still image is used as a fallback if the scene cannot load. Adjust the asset and its camera framing in `src/scripts/playground.ts` to use a different scene.

The build includes precompressed MediaPipe WASM files. Run `bun run preview` after building to serve them locally with content negotiation. Production hosting must also serve the `.br` or `.gz` version in response to `Accept-Encoding`, with the appropriate `Content-Encoding` and `application/wasm` content type; the original files remain available for hosts that do not support this.

## Assets and type

The design uses local Creators and Helvetica Now Display font files. The Octo sculpture scan is [Infinity Octo Art MK](https://superspl.at/scene/94b17a0d) by Natural Splats, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

```sh
bun src/scripts/gestures.test.ts
bun run typecheck
bun run build
```
