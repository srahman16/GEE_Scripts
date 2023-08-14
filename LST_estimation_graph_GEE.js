/*
Title: Mean Temperature Calculation & Temperature Graph Generation in GEE
Author: Shahriar Rahman
Acknowledgements: Google Earth Engine
*/
//FAO Global Administrative Unit Layers 2015 
var admin = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1");
//Khulna District of Bangladesh
var Khulna = admin.filter(ee.Filter.eq('ADM1_NAME', 'Khulna'));
var geometry = Khulna.geometry();

//MODIS Day-time temperature
var modisLSTD = MODIS_LST.select('LST_Day_1km')
.filterDate('2020-04-01', '2020-06-30'); //selected date 

//Converting Temperature from Kelvin to Celsius
modisLSTD = modisLSTD.map(function(image){
  return image.multiply(0.02).subtract(273.15).copyProperties(image, ['system:time_start']);
});

//Chart titles
var title = {
  title: 'Day Temperature',
  hAxis: {title: 'Time'},
  vAxis: {title: 'Temperature C'},
};

//Chart for day time temperature
var chart = ui.Chart.image.series
(modisLSTD,geometry, ee.Reducer.mean(), 1000,'system:time_start')
    .setOptions(title)
    .setChartType('ColumnChart');
print('Day Surface Temperature in Celsius');
print(chart);

//Add LST layer in GEE
var landSurfaceTemperatureVis = {
  min: -10,
  max: 40.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};
Map.addLayer(modisLSTD.select('LST_Day_1km').mean().clip(geometry), landSurfaceTemperatureVis,'Land Surface Temperature (Day)');

//Export the mean LST image in 30m spatial resolution
Export.image.toDrive({
  image: modisLSTD.mean().clip(geometry),
  description: 'Land_Surface_Temp_Day',
  region: geometry,
  scale: 30,
  crs:'epsg:4326',
  maxPixels:1e10,
});

//End of script//
//Please like, share and subscribe to my youtube channel.
//Be safe and take care :)
