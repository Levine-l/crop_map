# Figure Plan for Dissertation Draft

## Recommended main-text figures

1. Overall model comparison against held-out CROME labels
   - Use the `Model Comparison` SVG chart.
   - Caption wording: agreement with held-out CROME labels, not independent ground-truth accuracy.

2. Class-level F1 gain from adding Sentinel-1 SAR
   - Use the `Class-Level Gains` SVG chart.
   - Main argument: largest gains occur in classes where optical-only classification was weaker or more confused.

3. Random Forest sensitivity range
   - Use the `Robustness` SVG chart.
   - Main argument: S1+S2 remains ahead across the tested parameter grid.

4. Crop-profile zone disagreement reduction
   - Use the `Crop-Profile Geography` SVG chart and/or table.
   - Main argument: SAR-related disagreement reduction is positive in all k=3 zones, with the largest reduction in the mixed wheat-barley-beet zone.

5. k=3 crop-profile map
   - Use the embedded folder 6 map as a preview.
   - For final Word insertion, export a cleaner static screenshot or redraw the map with a categorical legend.

## Recommended appendix figures

- Full S2-only and S1+S2 confusion matrices.
- UKCEH benchmark confusion matrices.
- k=2 and k=4 crop-profile maps.
- Selected-crop intensity map.
- Zone-level SAR reduction map.
- Feature importance tables/plots.

## Notes for final polish

- The current map previews reuse Folium outputs from folder 6. They are useful for exploration, but the final dissertation may benefit from static versions with tighter legends and captions.
- Keep UKCEH and CROME language cautious: reference product, benchmark, agreement, disagreement, spatial consistency.
- Do not describe the dashboard metrics as independent ground-truth accuracy.

