/*
Title: Calculating annual average evapotranspiration using MOD16A2.006 (ET) data
Author: Shahriar Rahman
Email: shahriar.env12@gmail.com
Acknowledgements: Google Earth Engine, Stack Exchange
*/

//MOD16A2.006 data product settings
//We are using total evapotranspiration data for this video
var MOD16A2 = ee.ImageCollection('MODIS/006/MOD16A2') //Data product MOD16A2.006: Terra Net Evapotranspiration 8-Day Global 500m (has data from 2001-2022)
var start_year = 2001; 
var end_year = 2022; 
var startdate = ee.Date.fromYMD(start_year,1, 1);
var enddate = ee.Date.fromYMD(end_year + 1, 1, 1);
var years = ee.List.sequence(start_year, end_year); //setting the year bounds (line 11-15)

//study area settings (change the area as per your requirements)
var admin = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level1"); //FAO GAUL 500m: Global Administrative Unit Layers 2015 used
var Khulna = admin.filter(ee.Filter.eq('ADM1_NAME', 'Khulna')); //here I have considered Khulna from Bangladesh, but you can choose the geographic area of your choice
var geometry = Khulna.geometry(); //getting the geometry of the study area

var ET = MOD16A2.select("ET") //it has four other products, here I am using "ET" or evapotranspiration product

//function to get yearly evapotranspiration
var yearly_ET = ee.ImageCollection.fromImages(
  years.map(function (year) {
    var annual = ET
        .filter(ee.Filter.calendarRange(year, year, 'year'))
        .sum()
        .multiply(0.1);
    return annual
        .set('year', year)
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1));
}));

//creating bar chart of annual average evapotranspiration for Khulna, Bangladesh from 2001 to 2022
var title = {
  title: 'Annual Average Evapotranspiration from 2001-2022 (Khulna, Bangladesh)',
  hAxis: {title: 'Year'},
  vAxis: {title: 'ET (mm)'},
};

//chart settings for plotting...
var chart = ui.Chart.image.seriesByRegion({
  imageCollection: yearly_ET, 
  regions: Khulna,
  reducer: ee.Reducer.mean(),
  band: 'ET',
  scale: 2000,
  xProperty: 'system:time_start',
  seriesProperty: 'SITE'
}).setOptions(title)
  .setChartType('ColumnChart'); //change the chart type as per your requirements
  print(chart);

//map visualisation of ET distribution over Khulna, Bangladesh
var annual_avgET = yearly_ET.mean().clip(Khulna); //yearly average evapotranspiration of Khulna, Bangladesh
var ET_Vis = {
  min: 0, 
  max: 600, //depends on your data range...when we will run the script then you will see why I put it to 600 :)
  palette: '152106, 225129, 369b47, 30eb5b, 387242' //you can choose your own colour palette
};
Map.centerObject(Khulna, 5);
Map.addLayer(annual_avgET, ET_Vis, 'Annual Average ET');

//End of script!
//Please like, share and subscribe to my youtube channel (https://www.youtube.com/channel/UCvH8JoH8zMLPjyT2S0T8s9g).
