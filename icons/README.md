Place your app icon files here so the web manifest and Safari links resolve.

Required file names (recommended):

- `icon-192.png` — 192×192 PNG
- `icon-512.png` — 512×512 PNG
- `apple-touch-icon.png` — recommended 180×180 PNG
- `safari-pinned-tab.svg` — SVG for pinned tab (optional)

If you have a single high-resolution image (for example the one you pasted), create PNGs at the sizes above and copy them into this folder with the listed names. The build system will copy `public/` to `dist/` so the icons will be available at the site root.
