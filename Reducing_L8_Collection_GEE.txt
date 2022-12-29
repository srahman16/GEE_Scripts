/*
Title: Reducing Landsat 8 Collection 2 Tier 1 Image Collection on GEE
Email: shahriar.env12@gmail.com
Acknowledgements: GEE
*/

//Geometry settings
var geometry = ee.Geometry.Point([150.45, -33.63]); //define as per your requirements
//Image Collection: Landsat 8 
var dataset_ls = ee.ImageCollection('LANDSAT/LC08/C02/T1')
    .filterDate('2020-05-01', '2021-06-01') //date range 1 May 2020 - 1 June 2021
    .filterBounds(geometry); //choose geometry as per your requirements

//Computes a Landsat TOA composite from a collection of Landsat scenes
var dataset = ee.Algorithms.Landsat.simpleComposite({
  collection: dataset_ls,
  cloudScoreRange: 10,
  asFloat: true
});

//Band combination for visualisation
var visualisation = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.0,
  max: 0.3,
};

//Setting the map center according to the provided geometry
Map.centerObject(geometry, 11);

//Adding a layer for the reduced Landsat 8 composite 
Map.addLayer(dataset, visualisation, "L8_RGB");

//End of script//
//Please like, share and subscribe for more videos!!!
//Thank you for watching! Happy New Year 2023!!! :)
