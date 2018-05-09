/*
 Step 1. 

 This script expects to be launched, from a bookmarklet, on a page with a selected statement that will be the subject
 of a fact check. It also expects that http://jonudell.net/hlib/StandaloneAnchoring.js is providing the variable
 `anchoring` and that it in turn provides TextQuoteAnchor and TextPositionAnchor, as per 
 https://github.com/judell/StandaloneAnchoring/tree/only-export-textquote-and-text-position

 It gathers the URL of the page and the text of the selection, then redirects to a single-page app
 that posts an annotation initialized with this data as extra JSON.

 Next step: see index.html.
*/

function gather() {

  var selection = document.getSelection();
  if (! selection.rangeCount ) {
    alert("claimReview: Please select a statement to review.");
    return;
  }

  var range = selection.getRangeAt(0);
  var quoteSelector = anchoring.TextQuoteAnchor.fromRange(document.body, range);
  var exact = quoteSelector.exact;
  var prefix = quoteSelector.prefix;

  var positionSelector = anchoring.TextPositionAnchor.fromRange(document.body, range);
  var start = positionSelector.start;
  var end = positionSelector.end;

  var data = {
    uri: location.href,
    exact: exact,
    prefix: prefix,
    start: start,
    end: end,
  }

  var encodedData = encodeURIComponent(JSON.stringify(data));

  location.href = `https://jonudell.info/h/ClaimReview?data=${encodedData}`;
}

var script = document.createElement('script');
script.src='https://jonudell.info/hlib/StandaloneAnchoring.js';
document.head.appendChild(script);
setTimeout(gather, 1000); // wait for anchoring support to load

