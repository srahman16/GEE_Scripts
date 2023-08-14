/* Title: Land Cover Classification using CART Regression Tree in GEE
Script and Demo: Shahriar Rahman
Please like, share and subscribe to my youtube channel!!!
Email: shahriar.env12@gmail.com
Courtesy: Google Earth Engine (GEE), GEARS-LAB.
*/

// Image selection
var image = imageCollection
            .filterDate('2021-01-01','2021-05-29')
            .filterBounds(ROI)
            .sort('CLOUD_COVER') //  sort the collection by cloud cover
            .first(); // Now lets select the first image out of this collection
print(image);

// Clipping the image data based on the bounding box
var image = image.clip(Bounding_Box);

// Centres the map view on a given object
Map.centerObject(Bounding_Box, 13); //zoom level: 13

// Adding a given EE object to the map as a layer
Map.addLayer(image,{bands:['B4','B3','B2'], min: 0, max:0.3},'True Color Image', false);

// Merge features into one FeatureCollection
var trainingfc= Urban.merge(Water).merge(Vegetation).merge(Barren);

// Band selection for machine learning algorithm 
var bands = ['B1','B2','B3','B4','B5','B6','B7'];

// Sample the reflectance values for each training point
var training= image.select(bands).sampleRegions({
  collection: trainingfc,
  properties: ['landcover'],
  scale: 30 // 
});
print (training);

// Splitting the data using random sampling technique
var withRandom = training.randomColumn('random');

//Here, training will be on 70%, and the rest is for testing
var split = 0.7;  
var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
var testingPartition = withRandom.filter(ee.Filter.gte('random', split));

// Setting up the model (here, CART Regression Tree)
var classifier = ee.Classifier.smileCart().train({
 features: trainingPartition,
 classProperty: 'landcover',
 inputProperties: bands
});

// Run the classification
var classified = image.select(bands).classify(classifier);

// Display the classification map
Map.addLayer(classified,lc_cls,'classification');

// Generating a confusion matrix considering resubstituion error matrix 
var trainAccuracy = classifier.confusionMatrix();
print('Resubstitution error matrix: ', trainAccuracy);
print('Overall training accuracy: ', trainAccuracy.accuracy());

// Testing data
print ('Data before classification',testingPartition);

// Classifying the testing data
var test = testingPartition.classify(classifier);

// Results after run...
print (' The classified set"',test);

// Print the confusion matrix.
var confusionMatrix = test.errorMatrix('landcover', 'classification');
print('Confusion Matrix', confusionMatrix);
print('Validation accuracy: ',confusionMatrix.accuracy());

// Export the classified image to Google Drive
Export.image.toDrive({
 image: classified,
 description:"LULC_WesternSydney",
 scale: 30,
 region:Bounding_Box,
 maxPixels:3e10
});
// End of the Script!!!
