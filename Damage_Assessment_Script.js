/*
Title: Agricultural Damage Assessment Land due to Cyclone Amphan in Khulna District
Email: shahriar.env12@gmail.com
Acknowledgements: UN-SPIDER.org
*/
//Please follow this video after calculating the floodwater extent
//Watch my previous video, Title: "Flood mapping using Sentinel-1 (GRD) in Google Earth Engine (GEE)"

//Image Collection: MCD12Q1.006 MODIS Land Cover Type Yearly Global 500m (2001-2019)
var landcover = ee.ImageCollection('MODIS/006/MCD12Q1')
  .filterDate('2015-01-01',after_end)
  .sort('system:index',false)
  .select("LC_Type1")
  .first()
  .clip(geometry);

//Considering only agricultural land
var mask_crp = landcover
  .eq(12)
  .or(landcover.eq(14));
var croparea = landcover
  .updateMask(mask_crp);
  
//Defining projection
var MODISprojection = landcover.projection();

var flooded_reproj = flooded_area
    .reproject({
    crs: MODISprojection
  });

//Clipping agricultural land based on the final flooded area
var Affected_agriculture = flooded_reproj
  .updateMask(croparea).rename('affected_agri');

//Calculating area of the affected agricultural land in Khulna
var pixel_agri_total = Affected_agriculture
  .multiply(ee.Image.pixelArea());
var agri_pix = pixel_agri_total.reduceRegion({
  reducer: ee.Reducer.sum(),             
  geometry: geometry,
  scale: 500,
  maxPixels: 1e9
  });
var affected_agri = ee.Number(agri_pix.get('affected_agri')).divide(10000);
print('Affected Agricultural Area in Khulna (Ha)',affected_agri);

//Adding and visualising the afffected agricultural land in GEE
//Remember that MCD12Q1 is a 500m spatial resolution product
var agriVis = {
  min: 0,
  max: 14.0,
  palette: ['Yellow'],
};
Map.addLayer(Affected_agriculture, agriVis, 'Affected Agriculture Land'); 
//End of script//
//Please like, share and subscribe for more videos!!!
//Thank you for watching! :)
