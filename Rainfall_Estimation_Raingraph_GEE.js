/*
Title: Calculating mean rainfall during cyclone Amphan
Author: Shahriar Rahman
Email: shahriar.env12@gmail.com
Acknowledgements: Google Earth Engine
*/

//Load CHIRPS rainfall collection
var CHIRPS= ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD');

//FAO Global Administrative Unit Layers 2015 
var admin = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");

//Khulna District of Bangladesh
var Khulna = admin.filter(ee.Filter.eq('ADM1_NAME', 'Khulna'));
var geometry = Khulna.geometry();

//Define the rainfall date range (Year 2020)
var rainfall = CHIRPS.filterDate('2020-01-01','2020-12-31');

//Plot full year (2020) rainfall data for Khulna district of Bangladesh
var total_rnfl = ui.Chart.image.series(rainfall, geometry, ee.Reducer.mean(),1000, 'system:time_start').setOptions({
title: 'Rainfall Time Series of Year 2020',
vAxis: {title: 'mm/pentad'}, });
print(total_rnfl);

//Rainfall during Amphan
var rnfl_amphan =CHIRPS.filterDate('2020-05-10','2020-05-30'); //Date from 10 May - 30 May 2020
var rnfl_apr_jun20 = ui.Chart.image.series(rnfl_amphan, geometry, ee.Reducer.mean(),1000, 'system:time_start').setOptions({
title: 'Rainfall (10 May 2020 - 30 May 2020)',
vAxis: {title: 'mm/pentad'}, });
print(rnfl_apr_jun20);

//Clip the rainfall based on Khulna
var total_rainfall = rnfl_amphan.mean().clip(geometry);

//Mean rainfall during Amphan
//Defining the colour palette
var mean_rnfl_amphan = rnfl_amphan.mean().clip(geometry).rename('mean_rnfl');
Map.addLayer(mean_rnfl_amphan, {min: 0, max: 40,
  palette:['green','orange','red']}, 'Mean Rainfall during Amphan');

// Export the image to your google drive
Export.image.toDrive({
  image: mean_rnfl_amphan,
  description: 'mean_rnfl',
  scale: 250, //change the spatial resolution according to your need
  region: geometry,
  maxPixels: 1e10});
  
//End of script!
//Please like, share and subscribe to my youtube channel.
//Be safe and stay at home. :)
