/*
Title: Fire Mapping using FIRMS & Sentinel-2 Data for Australian Black Summer Bushfires (2019-2020) 
Email: shahriar.env12@gmail.com
Acknowledgements: GEE
*/

//Defining administrative boundary
var NSW = ee.FeatureCollection("FAO/GAUL/2015/level1") 
                .filter(ee.Filter.eq("ADM1_NAME","New South Wales")); 

//Import and filter FIRMS fire hotspot data
var FIRMS = ee.ImageCollection("FIRMS")
              .filterBounds(NSW).filterDate("2019-10-01","2020-02-15");

//Import and filter Sentinel-2 dataset
var S2 = ee.ImageCollection("COPERNICUS/S2")
            .filter(ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 10))
            .filterBounds(NSW).filterDate("2019-10-01","2020-02-15");
            
//Setting map centre with zoom level 8
Map.centerObject(NSW, 8);

//Create and add a true colour composite layer of Sentinel-2 images (median value)
Map.addLayer(S2.median(),{min:0,max:5000,bands:["B4", "B3", "B2"]},"True Colour Composite");

//Add FIRMS fire hotspot layer (brightness temperature in Kelvin)
Map.addLayer(FIRMS.max(), {min:300, max:509.29, bands:"T21", palette:"yellow, orange, red"}, "Brightness Temperature (K)");

//End of script//
//Please like, share and subscribe for more videos!!!
//Thank you for watching! 
//Happy New Year 2023!!! :)
