# Illustrated user guides library (v3 0.3.1)

- Open [index.html](./index.html) for the catalogue of core modules and Ready4 packs.
- HTML: `core/` and `packs/`
- PDFs: `pdfs/`
- Screenshots: `images/`

Regenerate (Expo web must be running on port 19006 for capture):

```bash
CI=1 APP_VARIANT=v3 npx expo start --web --port 19006
npm run guides:capture
npm run guides:build
```
