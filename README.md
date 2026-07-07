# Dissertation Visualisation Suite

This folder is the HTML-first visualisation layer for the dissertation. It does not rerun the classification workflow. It turns completed outputs from folders 1-6 into dissertation-ready figure candidates and interactive map previews.

## Main file

- `index.html` - main visual dashboard.
- `assets/styles.css` - visual style system.
- `assets/app.js` - embedded data and SVG chart rendering.
- `data/source_tables/` - copied CSV source outputs used to derive the embedded chart values.
- `data/maps/` - copied k=3 Folium HTML maps used by the map preview tabs.
- `data/DATA_INVENTORY.md` - copied-data provenance table.

The page can be opened directly in a browser. The charts are generated as SVG, and each chart panel has an SVG export button. The map iframe paths now point to copied HTML maps inside this folder, so the page is less dependent on the folder 6 output location.

## Source outputs used

- `code/2_sentinel1_sentinel2_model/outputs/tables/overall_model_comparison_s2_vs_s1s2.csv`
- `code/2_sentinel1_sentinel2_model/outputs/tables/model_comparison_s2_vs_s1s2.csv`
- `code/4_ukceh_benchmark_comparison/outputs/tables/model_predictions_vs_ukceh_overall_metrics.csv`
- `code/5_rf_sensitivity_check/outputs/tables/rf_sensitivity_delta_summary.csv`
- `code/6_crop_profile_geography/outputs/k_comparison_summary.csv`
- `code/6_crop_profile_geography/outputs/k3/tables/zone_level_model_disagreement.csv`
- `code/6_crop_profile_geography/outputs/k3/tables/zone_level_crome_ukceh_disagreement.csv`
- `code/6_crop_profile_geography/outputs/k3/maps/*.html`

## Figure candidates

| Candidate | Dashboard section | Dissertation role |
| --- | --- | --- |
| Overall model comparison | Model Comparison | Main Results |
| UKCEH benchmark comparison | Model Comparison | Secondary benchmark / Results |
| Class-level F1 gain | Class-Level Gains | Main Results |
| RF sensitivity range | Robustness | Robustness / sensitivity check |
| Crop-profile zone disagreement | Crop-Profile Geography | Spatial extension / Results |
| k sensitivity table | Crop-Profile Geography | Results or appendix |
| k=3 crop-profile maps | Maps | Figure screenshot or appendix HTML |

## Interpretation rule

Use agreement/disagreement wording. The dashboard intentionally avoids describing CROME or UKCEH as independent ground truth.
