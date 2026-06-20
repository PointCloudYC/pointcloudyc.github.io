# Paper Figure Manifest

Drop a figure for each paper into this folder using the **exact filename** below.
The site shows it automatically. Until a file exists, a placeholder is shown
(graceful fallback — nothing breaks).

> **Status (2026-06-20):** Partial auto-fetch completed using the web-access skill (Jina + pub.mdpi-res.com CDN + arXiv HTML).
> - ✅ **Already fetched** (5 figures): `longtail3d.jpg`, `industrial3d.jpg`, `heritage-semisup.jpg`, `se-pseudogrid.jpg`, `settlements.jpg`
> - ❌ **Still needed** (8 figures): all Elsevier/AIC papers — these are paywalled and CAPTCHA-protected; no open-access preprints found.
>
> **To get the remaining Elsevier figures, choose one:**
> 1. **CDP browser mode** — Enable remote debugging in Chrome/Edge (`chrome://inspect/#remote-debugging` → "Allow remote debugging for this browser instance"), make sure you're logged in to ScienceDirect via your institutional proxy, then ask Claude to retry.
> 2. **Manual** — Drop your own framework/result figures from your manuscript files using the filenames below.

## Recommended figure
Use the paper's **framework / architecture figure**, or the most visually
appealing result figure (e.g., a segmentation result). Crop to roughly **4:3**
(e.g., 640×480). JPG or PNG both work, but keep the `.jpg` filename below
(or update the `src` in index.html if you prefer `.png`).

## Filenames (one per paper on the homepage)

| Filename | Paper | Source |
|----------|-------|--------|
| `geometric-labels-llm.jpg` | From Geometric Labels to Semantic Understanding (Multimodal LLM) | AIC 2026 (accepted) |
| `geometric-labels-llm.jpg` | From Geometric Labels to Semantic Understanding (Multimodal LLM) | AIC 2026 — **manual needed** |
| `heritage-semisup.jpg` | Semi-Supervised AI for Architectural Heritage Classification | ISPRS IJGI 2026 — **✅ fetched** (IJGI g014, building sample grid, 2077×1988 PNG) |
| `omni-scan2bim.jpg` | Omni-Scan2BIM | AIC 2024 — **manual needed** |
| `weakly-supervised.jpg` | Label-efficient weakly supervised segmentation | AIC 2023 — **manual needed** |
| `robot-scanning.jpg` | Robot-assisted mobile scanning | AIC 2023 — **manual needed** |
| `se-pseudogrid.jpg` | SE-PseudoGrid piping classification | AIC 2022 — **✅ fetched** (GitHub fig8, framework diagram, 2000×484 PNG) |
| `settlements.jpg` | Chinese Traditional Settlements classification | Remote Sensing 2022 — **✅ fetched** (RS g005, 3339×977 PNG) |
| `vision-bim.jpg` | Vision-assisted BIM reconstruction | AIC 2022 — **manual needed** |
| `object-verification.jpg` | Object verification for scan-to-BIM | AIC 2022 — **manual needed** |
| `respointnet.jpg` | ResPointNet++ | AIC 2021 — **manual needed** |
| `parametric-bim.jpg` | Fully automated parametric BIM for MEP | AIC 2021 — **manual needed** |
| `industrial3d.jpg` | Industrial3D dataset & benchmark | arXiv 2026 — **✅ fetched** (graphical abstract, 4271×3258 PNG) |
| `longtail3d.jpg` | Resolving Primitive-Sharing Ambiguity (LongTail3D) | arXiv 2026 — **✅ fetched** (arXiv HTML x2, framework, 947×414 PNG) |

## Profile photos (two — hover swap)
The homepage shows a **formal** photo that swaps to a **casual** photo on hover.
Drop both one level up in `static/img/`:

| Filename | Use | Requirements |
|----------|-----|--------------|
| `profile.jpg` | Formal (default) | Square 1:1, ≥600×600px, JPG, face centered |
| `profile_casual.jpg` | Casual (on hover) | Square 1:1, ≥600×600px, JPG, same framing so the swap looks clean |

Both render as a 200px circle. Until you add them, friendly SVG placeholders are shown.

## Source notes for auto-fetched figures
| File | Source URL |
|------|-----------|
| `longtail3d.jpg` | `https://arxiv.org/html/2601.19128v1/x2.png` (Fig. 2, framework) |
| `industrial3d.jpg` | `https://arxiv.org/html/2603.28660v1/figures/graphical_abstract_v6.png` |
| `heritage-semisup.jpg` | `https://pub.mdpi-res.com/ijgi/ijgi-15-00221/...ijgi-15-00221-g014.png` (Fig. 14, sample grid) |
| `se-pseudogrid.jpg` | `https://github.com/PointCloudYC/se-pseudogrid/raw/main/images/fig8-SE-PseudoGrid.png` |
| `settlements.jpg` | `https://pub.mdpi-res.com/remotesensing/remotesensing-14-05000/...remotesensing-14-05000-g005.png` (Fig. 5) |

## Tip: how to replace an auto-fetched figure
Just drop a better image with the same filename. The site picks it up automatically.

## Tip for remaining papers
- **Automation in Construction** (Elsevier, paywalled): use your own copy of the manuscript/figures.
- **CDP mode (optional)**: enable Chrome/Edge remote debugging and ask Claude to retry — it can then use your browser session to access ScienceDirect.
