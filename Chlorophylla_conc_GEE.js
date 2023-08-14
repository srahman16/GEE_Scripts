/*
Title: Calculate Chlorophyll-a Concentration in GEE and Export Chlorphyll-a mean images
Author: Shahriar Rahman
Email: shahriar.env12@gmail.com
Acknowledgements: Google Earth Engine
*/

//Chlorophyll-a image data from 1 Jan - 31 De 2020 from Global Change Observation Mission (GCOM)
//JAXA
/* Data CitatioN: Murakami, H. (Jan. 2020). ATBD of GCOM-C chlorophyll-a 
   concentration algorithm (Version 2). Retrieved from 
  https://suzaku.eorc.jaxa.jp/GCOM_C/data/ATBD/ver2/V2ATBD_O3AB_Chla_Murakami.pdf
*/
var GCOM_Img = ee.ImageCollection("JAXA/GCOM-C/L3/OCEAN/CHLA/V2")
                .filterDate('2020-01-01', '2020-12-31');
var GCOM = GCOM_Img.mean().multiply(0.0016).log10();
var geometry = AusOcean.geometry();
var GCOM_clp = GCOM.clip(geometry);

//Chart titles
var title = {
  title: 'Chlorophyll-a Concentration',
  hAxis: {title: 'Time'},
  vAxis: {title: 'mg/m^3'},
};

//Bar chart with CHLA (Chlorophyll-A) & CHLA_QA Flag
var chart = ui.Chart.image.series
(GCOM_Img,geometry, ee.Reducer.mean(), 4639,'system:time_start')
    .setOptions(title)
    .setChartType('ColumnChart');
print('Chlorophyll-a Concentration from 1 Jan - 31 Dec 2020');
print(chart);

//Export mean Chlorophyll-a (two bands)images to GoogleDrive
Export.image.toDrive({
  image: GCOM_clp,
  description: 'GCOM_ChlorA',
  region: geometry,
  scale: 4639,
  crs:'epsg:4326',
  maxPixels:4e10,
});

//End of script.
//Thank you for watching.
//Please subscribe to my youtube channel.
