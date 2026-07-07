# Data Inventory

This folder contains copied source outputs used by the visualisation suite. The charts in `assets/app.js` currently use embedded values derived from these files; the files are retained here for provenance and later refactoring if the page is changed to load data dynamically.

## Source tables

| Copied file | Original source |
| --- | --- |
| `source_tables/overall_model_comparison_s2_vs_s1s2.csv` | `../2_sentinel1_sentinel2_model/outputs/tables/overall_model_comparison_s2_vs_s1s2.csv` |
| `source_tables/model_comparison_s2_vs_s1s2.csv` | `../2_sentinel1_sentinel2_model/outputs/tables/model_comparison_s2_vs_s1s2.csv` |
| `source_tables/model_predictions_vs_ukceh_overall_metrics.csv` | `../4_ukceh_benchmark_comparison/outputs/tables/model_predictions_vs_ukceh_overall_metrics.csv` |
| `source_tables/rf_sensitivity_delta_summary.csv` | `../5_rf_sensitivity_check/outputs/tables/rf_sensitivity_delta_summary.csv` |
| `source_tables/k_comparison_summary.csv` | `../6_crop_profile_geography/outputs/k_comparison_summary.csv` |
| `source_tables/zone_level_model_disagreement_k3.csv` | `../6_crop_profile_geography/outputs/k3/tables/zone_level_model_disagreement.csv` |
| `source_tables/zone_level_crome_ukceh_disagreement_k3.csv` | `../6_crop_profile_geography/outputs/k3/tables/zone_level_crome_ukceh_disagreement.csv` |
| `source_tables/crop_profile_cluster_centroids_k3.csv` | `../6_crop_profile_geography/outputs/k3/tables/crop_profile_cluster_centroids.csv` |

## Copied maps

| Copied file | Original source |
| --- | --- |
| `maps/crop_profile_cluster_map_k3.html` | `../6_crop_profile_geography/outputs/k3/maps/crop_profile_cluster_map.html` |
| `maps/selected_crop_intensity_map_k3.html` | `../6_crop_profile_geography/outputs/k3/maps/selected_crop_intensity_map.html` |
| `maps/zone_level_sar_reduction_map_k3.html` | `../6_crop_profile_geography/outputs/k3/maps/zone_level_sar_reduction_map.html` |

## Interpretation note

These outputs support agreement/disagreement visualisations. They should not be described as independent ground-truth accuracy.

