# Paper Figure Manifest

Drop a figure for each paper into this folder; `index.html` references the exact
filename directly. The site shows it automatically. Until a file exists, a
placeholder is shown (graceful fallback — nothing breaks).

> **Status (2026-07-05):** 7 of 13 papers now have user-supplied figures.
> - ✅ **Have a figure**: `Building-MLLM.png`, `CTSMatch.png`, `WSSS-ST.png`, `SE-PseudoGrid.png`, `CTS.jpg`, `industrial3d.jpg`, `longtail3d.jpg`
> - ❌ **Still needed** (6 figures): `omni-scan2bim.jpg`, `robot-scanning.jpg`, `vision-bim.jpg`, `object-verification.jpg`, `respointnet.jpg`, `parametric-bim.jpg` — all Elsevier/AIC, paywalled; drop your own manuscript figure using these filenames (any image format works, just update the `src` in `index.html` to match the extension).

## Recommended figure
Use the paper's **framework / architecture figure**, or the most visually
appealing result figure (e.g., a segmentation result). Any aspect ratio works —
`.paper-thumb` uses `object-fit: cover` on a 160×120 frame, so the image is
auto-cropped to fit.

## Filenames currently referenced in index.html (one per paper)

| Filename | Paper | Status |
|----------|-------|--------|
| `Building-MLLM.png` | From Geometric Labels to Semantic Understanding (Multimodal LLM) — S. Jing 1st author | AIC 2026 — ✅ user-supplied 2026-07-05 |
| `CTSMatch.png` | Semi-Supervised AI for Architectural Heritage Classification | ISPRS IJGI 2026 — ✅ user-supplied 2026-07-05 |
| `omni-scan2bim.jpg` | Omni-Scan2BIM | AIC 2024 — ❌ manual needed |
| `WSSS-ST.png` | Label-efficient weakly supervised segmentation | AIC 2023 — ✅ user-supplied 2026-07-05 |
| `robot-scanning.jpg` | Robot-assisted mobile scanning | AIC 2023 — ❌ manual needed |
| `SE-PseudoGrid.png` | SE-PseudoGrid piping classification | AIC 2022 — ✅ user-supplied 2026-07-05 |
| `CTS.jpg` | Chinese Traditional Settlements classification | Remote Sensing 2022 — ✅ user-supplied 2026-07-05 |
| `vision-bim.jpg` | Vision-assisted BIM reconstruction | AIC 2022 — ❌ manual needed |
| `object-verification.jpg` | Object verification for scan-to-BIM | AIC 2022 — ❌ manual needed |
| `respointnet.jpg` | ResPointNet++ | AIC 2021 — ❌ manual needed |
| `parametric-bim.jpg` | Fully automated parametric BIM for MEP | AIC 2021 — ❌ manual needed |
| `industrial3d.jpg` | Industrial3D dataset & benchmark | arXiv 2026 — ✅ (from `assets/industrial3D.pdf`) |
| `longtail3d.jpg` | Resolving Primitive-Sharing Ambiguity (LongTail3D) | arXiv 2026 — ✅ (from `assets/boudary-cb.pdf`) |

Superseded, no-longer-referenced files kept in this folder (harmless, unused):
`settlements.jpg`, `heritage-semisup.jpg`, `se-pseudogrid.jpg`, `geometric-labels-llm.jpg`,
`weakly-supervised.jpg` — replaced by the user-supplied files above. Safe to delete.

## Profile photos (two — hover swap)
The homepage shows a **formal** photo that swaps to a **casual** photo on hover.
Drop both one level up in `static/img/`:

| Filename | Use | Requirements |
|----------|-----|--------------|
| `profile.jpg` | Formal (default) | Square 1:1, ≥600×600px, JPG, face centered |
| `profile_casual.jpg` | Casual (on hover) | Square 1:1, ≥600×600px, JPG, same framing so the swap looks clean |

Both render as a 200px circle. Until you add them, friendly SVG placeholders are shown.

## Tip for remaining papers
- **Automation in Construction** (Elsevier, paywalled): use your own copy of the manuscript/figures.
- Drop the image using the exact filename listed above (or update the `src` in `index.html` if you use a different extension) — the site picks it up automatically.
