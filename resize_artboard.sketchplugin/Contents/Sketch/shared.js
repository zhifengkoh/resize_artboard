var APP = [NSApplication sharedApplication];
// var DEBUG = true;

/*
 * resizeArtboard(artboard, ignoreHidden)
 * --------------------------------------
 * @param artboard An MSArtboardGroup object
 * @param ignoreHidden Boolean. Defaults to true.
 *
 * Resizes a single artboard by fitting its dimensions to its content size,
 * and then repositioning the content for a perfect fit.
 *
 * By default, hidden layers are not used to calculate content boundaries,
 * but are repositioned. This behaviour can be controlled using the
 * ignoreHidden parameter, which defaults to true. If this parameter is set to
 * false, hidden layers are used to calculate the size of the bounding box.
 */
function resizeArtboard(artboard, ignoreInvisibles) {

  var layers = artboard.layers();
  if (layers.count() == 0) {
    return; //If the artboard contains no layers, return and do nothing
  }

  ignoreInvisibles = ignoreInvisibles || true; // By default, ignore hidden layers
  var boundaryVarsInitialized = false;
  var layer;
  var r;
  var minX;
  var minY;
  var maxX;
  var maxY;

  //Find the dimensions of the bounding box surrounding all the immediate child layers of the artboard
  for (var i = 0; i < layers.count(); i++) {
    layer = layers.objectAtIndex(i);

    // There are three conditions to proceed, and only one where we don't count this layer as part of the bounding box
    if (!(!layer.isVisible() && ignoreInvisibles)) {
      r = layer.rect();

      if (!boundaryVarsInitialized) {
        minX = getLeftEdge(r);
        minY = getTopEdge(r);
        maxX = getRightEdge(r);
        maxY = getBottomEdge(r);
        boundaryVarsInitialized = true;
      }

      var leftEdge = getLeftEdge(r);
      var rightEdge = getRightEdge(r);
      var topEdge = getTopEdge(r);
      var bottomEdge = getBottomEdge(r);

      if (leftEdge < minX) minX = leftEdge;
      if (rightEdge > maxX) maxX = rightEdge;
      if (topEdge < minY) minY = topEdge;
      if (bottomEdge > maxY) maxY = bottomEdge;
    }
  }

  //Resize the artboard
  var r = artboard.rect();
  r.size.width = (maxX - minX);
  r.size.height = (maxY - minY);
  artboard.setRect(r);

  //Reposition all of the artboard's layers
  for (var i = 0; i < layers.count(); i++) {
    var layer = layers.objectAtIndex(i);
    var lr = layer.rect();
    lr.origin.x -= minX;
    lr.origin.y -= minY;
    layer.setRect(lr);
  }
}

/*
 * resizeSelectedArtboards(context)
 * ---------------------------------
 * @param context The context object
 *
 * Wrapper function for resizing one or more selected artboards.
 *
 * This function differs from resizeAllArtboardsOnPage() in how it checks
 * that at least one artboard was selected. In this function, a boolean variable
 * is used to verify that the user's selection (which can be anything) contained
 * at least one MSArtboardGroup. If not, it tells the user that they didn't select
 * an artboard!
 */
function resizeSelectedArtboards(context) {
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

/*
 * resizeAllArtboardsOnPage(context)
 * ---------------------------------
 * @param context The context object
 *
 * Wrapper function for resizing all artboards on the current page.
 *
 * Because this function doesn't depend on the user's selection, which can be
 * error prone, but finds the array of artboards programmatically using the
 * page object, we can verify up front that at least one artboard was found on
 * the page.
 */
function resizeAllArtboardsOnPage(context) {
  var page = context.document.currentPage();
  var artboards = page.artboards();
  if (artboards && artboards.count() > 0) {
    var iter = [artboards objectEnumerator];
    var artboard;
    while (artboard = [iter nextObject]) {
      if (artboard && artboard.className() == 'MSArtboardGroup') {
        resizeArtboard(artboard);
      }
    }
  } else exitWithError("No Artboards Found", "It looks like there are no artboards on the page named " + page.name() + ".");
}

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

// function debug(str) {
//   if (DEBUG) log(str);
// }

// Convenience functions to get the coordinates of the four edges of a CGRect
function getLeftEdge(cgrect) {
  return cgrect.origin.x;
}
function getRightEdge(cgrect) {
  return cgrect.origin.x + cgrect.size.width;
}
function getTopEdge(cgrect) {
  return cgrect.origin.y;
}
function getBottomEdge(cgrect) {
  return cgrect.origin.y + cgrect.size.height;
}

/*
 * resizeOneSelectedArtboard(context)
 * ----------------------------------
 * @param context The context object
 *
 * Wrapper function for resizing one selected artboard. This is not currently
 * used, because resizeSelectedArtboards does the same thing.
 */
function resizeOneSelectedArtboard(context) {
  // debug("[Function Call] resizeOneSelectedArtboard(context)");
  var artboard = context.selection.firstObject();
  //Check if the user selected an artboard. Otherwise, we can't proceed.
  if (artboard && artboard.className() == 'MSArtboardGroup') {
      resizeArtboard(artboard);
  } else {
    throwNoArtboardSelectedError();
  }
}
