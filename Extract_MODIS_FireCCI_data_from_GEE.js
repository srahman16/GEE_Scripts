/*
Title: Extract MODIS Fire_cci Burned Area Pixel Product with it's three bands from GEE
Email: shahriar.env12@gmail.com
Acknowledgements: UN-SPIDER.org
*/

var geometry = ee.FeatureCollection('users/shahriar***/KangarooIsland'); // shapefile
var dataset = ee.ImageCollection('ESA/CCI/FireCCI/5_1')
                .map(function(image) {
                  return image.toInt16(); // I set it to Integer 16bit, but it may vary for different dataset
                });
//Data date
var startYear = 2019;
var endYear = 2020;
var bandNames = ['BurnDate', 'ConfidenceLevel', 'LandCover']; //FireCCI51 v5.1 has these three bands
//loop through monthly data, mosaic each band and export data
for (var year = startYear; year <= endYear; year++) {
  for (var month = 1; month <= 12; month++) {
    var startDate = ee.Date.fromYMD(year, month, 1);
    var endDate = startDate.advance(1, 'month');
    var monthlyCollection = dataset.filterDate(startDate, endDate);
    var collectionSize = monthlyCollection.size().getInfo();
    print('Year:', year, 'Month:', month, 'Number of images:', collectionSize);
    if (collectionSize > 0) {
      var mosaicImage = monthlyCollection.mosaic().clip(geometry);
      bandNames.forEach(function(bandName) {
        var singleBandImage = mosaicImage.select(bandName);
        print('Exporting band:', bandName, 'for', year + '-' + month);
        Export.image.toDrive({
          image: singleBandImage,
          description: 'FireCCI_' + year + '_' + month + '_' + bandName + '_250m',
          folder: 'EarthEngineImages', // Optional: Specify a folder in Google Drive
          fileNamePrefix: 'FireCCI_' + year + '_' + month + '_' + bandName + '_250m', // filename
          scale: 250,  // spatial resolution: here, 250m
          region: geometry,
          fileFormat: 'GeoTIFF',
          maxPixels: 1e13
        });
        print('Export task created for ' + year + '-' + month + ' ' + bandName + ' at 250m resolution.');
      });
    } else {
      print('No images found for Year:', year, 'Month:', month);
    }
  }
}
//End of script//
