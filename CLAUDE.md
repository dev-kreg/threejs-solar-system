# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Interactive Three.js solar system simulation (TypeScript + Vite). Live at https://dev-kreg.github.io/threejs-solar-system/.

## Commands

```bash
npm run dev     # dev server on http://localhost:4200
npm run build   # vite build → dist/
```

No tests, no linter. Pushing to `main` auto-deploys to GitHub Pages via `.github/workflows/` (builds and pushes `dist/` to `gh-pages`).

## Vite quirks

- `root` is `src/`, `publicDir` is `assets` — textures are loaded by bare filename (e.g. `'sun.webp'`), resolved from `src/assets/`.
- `base` is `/threejs-solar-system/` for GitHub Pages; don't hardcode absolute URLs.

## Architecture

Single render loop in `src/main.ts` drives everything. All simulation time is **simulated seconds** returned by `TimeManager.updateTime()` — wall-clock delta × timeScale (default 100000x, adjustable in the GUI). Planet code converts this to days internally.

- `utils/SceneManager.ts` — singleton owning scene, camera, renderer, OrbitControls, and the EffectComposer (RenderPass + UnrealBloomPass). Everything renders through `effectComposer`, not `renderer.render()`. Access via `SceneManager.getInstance()` after `initialize(canvas)`.
- `scenes/SolarSystemScene.ts` — builds sun + planets, owns raycasting for hover/click. Click vs. drag is disambiguated by a 100ms mousedown-to-mousemove threshold. Asset loading goes through a shared `THREE.LoadingManager`; `TimeManager`/`GUIManager` are only created in `main.ts` once `isLoaded` flips true.
- `components/Planet.ts` — mesh + orbit line + invisible `TubeGeometry` orbit hitbox (radius scales with orbit distance so far planets stay clickable). Orbits are elliptical, derived from perihelion/aphelion, with inclination, and phased to the real J2000 epoch so planets start at roughly their actual current positions.
- `constants/PlanetaryData.ts` — per-planet data. `radius`/`orbitRadius`/`ring` radii are scene units; every other field is real NASA fact-sheet data displayed in the detail panel. Perihelion/aphelion (10^6 km) double as scene-unit orbit dimensions.
- `scenes/PlanetDetailScene.ts` — the click-to-inspect overlay: a DOM panel plus close-up render that tracks the selected planet's projected screen position each frame.
