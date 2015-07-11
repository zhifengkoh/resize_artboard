var APP = [NSApplication sharedApplication];
var DEBUG = true;

/*
 * resizeArtboard(artboard)
 * ------------------------
 * @param artboard An MSArtboardGroup object
 *
 * Resizes a single artboard by fitting its dimensions to its content size,
 * and then repositioning the content for a perfect fit
 */
function resizeArtboard(artboard) {
  debug("[Function Call] resizeArtboard()");

  var layers = artboard.layers();
  if (layers.count() == 0) {
    return; //If the artboard contains no layers, return and do nothing
  }

  var minX = 0;
  var minY = 0;
  var maxX = 0;
  var maxY = 0;

  //Find the dimensions of the bounding box surrounding all the immediate child layers of the artboard
  for (var i = 0; i < layers.count(); i++) {
    var layer = layers.objectAtIndex(i);
    var frame = layer.frame();
    var r = layer.rect(); //rect() returns a CGRect object

    var leftEdge = r.origin.x;
    var rightEdge = leftEdge + r.size.width;
    var topEdge = r.origin.y;
    var bottomEdge = topEdge + r.size.height;

    //Reset the boundaries of the bounding box to be the first layer for a baseline
    if (i == 0) {
      minX = leftEdge;
      minY = topEdge;
      maxX = rightEdge;
      maxY = bottomEdge;
    }

    if (leftEdge < minX) minX = leftEdge;
    if (rightEdge > maxX) maxX = rightEdge;
    if (topEdge < minY) minY = topEdge;
    if (bottomEdge > maxY) maxY = bottomEdge;
  }

  //Resize the artboard
  var r = artboard.rect();
  r.size.width = (maxX - minX);
  r.size.height = (maxY - minY);
  artboard.setRect(r);

  //Reposition all of the artboard's layers
  for (var i = 0; i < layers.count(); i++) {
    var layer = layers.objectAtIndex(i);
    var frame = layer.frame();
    frame.subtractX(minX);
    frame.subtractY(minY);
  }
}

/*
 * resizeOneSelectedArtboard(context)
 * ----------------------------------
 * @param context The context object
 *
 * Wrapper function for resizing one selected artboard
 */
function resizeOneSelectedArtboard(context) {
  debug("[Function Call] resizeOneSelectedArtboard(context)");
  debug("with param 'context'");
  debug(context);
  var artboard = context.selection.firstObject();
  //Check if the user selected an artboard. Otherwise, we can't proceed.
  if (artboard && artboard.className() == 'MSArtboardGroup') {
      resizeArtboard(artboard);
  } else {
    throwNoArtboardSelectedError();
  }
}

/*
 * resizeMultipleSelectedArtboards(context)
 * ----------------------------------------
 * @param context The context object
 *
 * Wrapper function for resizing multiple selected artboards
 */
function resizeMultipleSelectedArtboards(context) {
  var artboards = context.selection;
  var iter = [artboards objectEnumerator];
  var atLeastOneArtboardResized = false;
  var artboard;

  while (artboard = [iter nextObject]) {
    if (artboard && artboard.className() == 'MSArtboardGroup') {
      resizeArtboard(artboard);
      atLeastOneArtboardResized = true;
    }
    //Since we are looping over multiple artboards, we will do nothing if an object in the loop is not an artboard
  }

  //If the user's selection contained NO artboards, we should inform them
  if (!atLeastOneArtboardResized) {
    throwNoArtboardSelectedError();
  }
}

// function resizeAllArtboardsOnPage(context) {
//
// }
//
// function resizeAllArtboards(context) {
//
// }

function throwNoArtboardSelectedError() {
  exitWithError("No artboard selected", "You need to select an artboard");
}

function exitWithError(title, message) {
  [APP displayDialog:message withTitle:title];
  throw(nil);
}

function debug(str) {
  if (DEBUG) log(str);
}
