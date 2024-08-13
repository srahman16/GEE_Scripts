/*
Title: Extracting forest and non-forest data from FNF4 product of GEE
Author: Shahriar Rahman
Email: shahriar.env12@gmail.com
Acknowledgements: Google Earth Engine
*/

var geometry = ee.FeatureCollection('users/shahriar***/KangarooIsland'); //your shapefile (here, I have uploaded my zipped shape file as an asset to my GEE code environment
var years = [2017, 2018, 2019, 2020, 2021]; // List of years I am interested (if you need only 2019 to 2021, then chose only three, example: var years = [2019, 2020, 2021]
var dataset = ee.ImageCollection('JAXA/ALOS/PALSAR/YEARLY/FNF4'); // Load the ALOS PALSAR FNF dataset

// Function to clip and export data for every year individually
years.forEach(function(year) {
  var filtered = dataset.filter(ee.Filter.calendarRange(year, year, 'year'));
  var collectionSize = filtered.size().getInfo();
  print('Year:', year, 'Number of images:', collectionSize);
  if (collectionSize > 0) {
    var image = filtered.first();
    if (image && image.bandNames().size().getInfo() > 0) {
      var clippedImage = image.clip(geometry);
      Export.image.toDrive({
        image: clippedImage,
        description: 'ALOS_PALSAR_' + year,
        scale: 25,  //25m spatial resolution
        region: geometry,
        fileFormat: 'GeoTIFF',
        maxPixels: 1e13
      });
      print('Export task created for year ' + year);
    } else {
      print('Year:', year, 'No valid image or bands available.'); //used it to check whether data for the respective year is present or not
    }
  } else {
    print('No images found for year ' + year);
  }
});

//End of script.
