var data = {}

/*
 Step 1. 

 This script expects to be launched, from a bookmarklet, on a page with a selected statement that will be the subject
 of a fact check. 

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
  data.url = encodeURIComponent(location.href);
  data.claim = '';
  var range = selection.getRangeAt(0);
  if ( range.startContainer === range.endContainer ) {
    data.claim += range.startContainer.textContent.slice(range.startOffset, range.endOffset);
  }
  else {
    var selectedTextNodes = getTextNodesBetween(document.getSelection());
    data.claim = selectedTextNodes[0];
    for (var i=1; i<selectedTextNodes.length; i++ ) {
      if ( i != selectedTextNodes.length ) {
        data.claim += ' ' + selectedTextNodes[i];
      }
      else {
        data.claim += selectedTextNodes[i].slice(0, range.endOffset);
      }
    }
  }

  data.claim = encodeURIComponent(data.claim);
  location.href = `https://jonudell.info/h/ClaimReview?url=${data.url}&claim=${data.claim}`;
}

// Get all *text* nodes contained in a selection object.
// Adapted from code by Tim Down.
// http://stackoverflow.com/questions/4398526/how-can-i-find-all-text-nodes-between-to-element-nodes-with-javascript-jquery
function getTextNodesBetween(selection) {
  var range = selection.getRangeAt(0), rootNode = range.commonAncestorContainer,
    startNode = range.startContainer, endNode = range.endContainer,
    startOffset = range.startOffset, endOffset = range.endOffset,
    pastStartNode = false, reachedEndNode = false, textNodes = [];
  function getTextNodes(node) {
    var val = node.nodeValue;
    if(node == startNode && node == endNode && node !== rootNode) {
      if(val) textNodes.push(val.substring(startOffset, endOffset));
      pastStartNode = reachedEndNode = true;
    } else if(node == startNode) {
      if(val) textNodes.push(val.substring(startOffset));
      pastStartNode = true;
    } else if(node == endNode) {
      if(val) textNodes.push(val.substring(0, endOffset));
      reachedEndNode = true;
    } else if(node.nodeType == 3) {
      if(val && pastStartNode && !reachedEndNode && !/^\s*$/.test(val)) {
        textNodes.push(val);
      }
    }
    for(var i = 0, len = node.childNodes.length; !reachedEndNode && i < len; ++i) {
      //      if(node !== sumterDialog) getTextNodes(node.childNodes[i]);
      getTextNodes(node.childNodes[i]);
    }
  }
  getTextNodes(rootNode);
  return textNodes;
}

// Lazy Range object detection.
function isRange(obj) {
  return ('type' in obj && obj.type === 'Range');
}

// Good-enough Range object comparison.
function rangeChange(data1, data2) {
  return (data1.type !== data2.type || data1.focusNode !== data2.focusNode || data1.focusOffset !== data2.focusOffset);
}

debugger;

gather();