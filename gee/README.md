# GEE crop-profile app

This app visualises the dissertation's frozen k=3 crop-profile outputs. It does
not retrain the local scikit-learn models in Earth Engine.

## Prepare the upload

From `code/7_dissertation_visualisations`, run:

```powershell
node tools/prepare_gee_grid.js
```

This creates:

```text
data/gee/crop_profile_grid_k3_gee.geojson
data/gee/crop_profile_grid_k3_gee.csv
```

The GeoJSON contains 144 retained 10 km grid cells. Long source field names are
shortened for Earth Engine, and each cell receives the relevant zone-level
sample count and disagreement metrics. The CSV contains the same records with
GeoJSON geometry in the `.geo` column and is the file used by the Earth Engine
Asset Manager.

## Publish in Earth Engine

1. In Earth Engine Assets, upload `crop_profile_grid_k3_gee.csv` as a CSV table
   asset.
2. Use the asset ID expected by `crop_profile_sar_explorer.js`, or update
   `GRID_ASSET` in that script.
3. Paste `crop_profile_sar_explorer.js` into a new Earth Engine script and run
   it.
4. Check all map variables, the Zone filter, and a click in each Zone.
5. Publish the script as a public Earth Engine App.
6. Set `GEE_APP_URL` near the top of `assets/app.js` to the published URL.

Once `GEE_APP_URL` is set, the dissertation webpage automatically reveals the
full-width GEE App section and its navigation link.
