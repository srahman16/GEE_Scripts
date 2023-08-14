/*
Title: Flood Mapping at Khulna District due to Cyclone Amphan (16 May - 21 May 2020)
Email: shahriar.env12@gmail.com
Acknowledgements: UN-SPIDER.org
*/

// Before and After Flood Dates
var before_start = '2020-05-01';
var before_end = '2020-05-15';
var after_start = '2020-05-16';
var after_end = '2020-05-31';

//FAO Global Administrative Unit Layers 2015 
var admin = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");

//Khulna District of Bangladesh
var Khulna = admin.filter(ee.Filter.eq('ADM1_NAME', 'Khulna'));
var geometry = Khulna.geometry();
print('Khulna District Area (Ha)',geometry.area().divide(10000));
Map.addLayer(geometry, {color: 'silver'}, 'Khulna');

// Collection of S1 GRD images (only one polarisation 'VH' is used)
var collection= ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode','IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING')) 
  .filter(ee.Filter.eq('resolution_meters',10))
  .filterBounds(geometry)
  .select(['VH']);
	
print(collection.first()); //to get the additional parameters of the collection of Sentinel-1 images

//Filtering collection of images based on before and after flood
var before_collection = collection.filter(ee.Filter.date(before_start, before_end));
var after_collection = collection.filter(ee.Filter.date(after_start, after_end));

//Clipping before and after images based on the Khulna District
var before = before_collection.mosaic().clip(geometry);
var after = after_collection.mosaic().clip(geometry);

//Add layers of before and after flood images
Map.addLayer(before, {min:-25,max:0},'Before Flood', false);
Map.addLayer(after, {min:-25,max:0},'After Flood', false);

//Reducing radar speckles using smoothing technique
var smoothing_radius = 25;
var before_filtered = before.focal_mean(smoothing_radius, 'square', 'meters');
var after_filtered = after.focal_mean(smoothing_radius, 'square', 'meters');
Map.addLayer(before_filtered, {min:-25,max:0},'Before Flood (Filtered)', false);
Map.addLayer(after_filtered, {min:-25,max:0},'After Flood (Filtered)', false);

//Calculating preliminary floodwater extent
var difference = after_filtered.divide(before_filtered);
var diff_threshold = 1.25; 
var flooded_area = difference.gt(diff_threshold).rename('flood_water').selfMask();
Map.addLayer(flooded_area, {min:0,max:1, palette: ['orange']}, 'Floodwater Extent', false);

//Masking the perennial water
var perennialWater = GSW.select('seasonality').gte(8).clip(geometry);
var flooded_area = flooded_area.where(perennialWater,0).selfMask();
Map.addLayer(perennialWater.selfMask(), {min:0, max:1, palette: ['Aqua']}, 'Perennial Water', false);

//Masking areas greater than 0.05 percent slope
//Khulna is a low-lying area, use the slope threshold based on the local geography
var slope_threshold = 0.05;
var terrain = ee.Algorithms.Terrain(Hydro_DEM); //Hydrosheds void-filled DEM used
var slope = terrain.select('slope');
var flooded_area = flooded_area.updateMask(slope.lt(slope_threshold));
//Layer of the elevated area
Map.addLayer(slope.gte(slope_threshold).selfMask(), {min:0, max:1, palette: ['Teal']}, 'Elevated Area', false);

//Remove unclustered pixels
//Clustered pixel threshold and connected pixel counts should be selected based on local contexts and knowledge
var clustered_pix_threshold = 5; 
var clustered = flooded_area.connectedPixelCount(15);
var flooded_area = flooded_area.updateMask(clustered.gt(clustered_pix_threshold));
//Layer of the final floodwater extent
Map.addLayer(flooded_area, {min:0,max:1, palette: ['Red']}, 'Final Floodwater extent', false);

//Calculate total flooded area (in Hectares) of Khulna District after Cyclone Amphan
var stats = flooded_area.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 30,
  maxPixels: 1e10});
var floodedArea = ee.Number(stats.get('flood_water')).divide(10000);
print('Total Flooded Area in Khulna (Ha)',floodedArea);

//End of script//
