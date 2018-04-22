// Called from a ClaimReview form that's embedded in an annotation and served at step 3 (ifrmae.py).
// Writes possibly-changed values of editable fields into the annotation's extra JSON 

function update() {
  var id = document.getElementById('annotationId').innerText;
  var token= document.getElementById('token').innerText;
  var author = document.getElementById('author').value;
  var ratingIndex = document.getElementById('rating').selectedIndex;
  var rating = document.getElementById('rating')[ratingIndex].text;
  var url = 'https://hypothes.is/api/annotations/' + id;

  var opts = {
    method: 'get',
    url: url,
  };

  opts.headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json;charset=utf-8',
  };

  httpRequest(opts)
    .then( function(data) {
      var payload = JSON.parse(data.response);
      payload.extra.claimReview.itemReviewed.author.name = author;
      payload.extra.claimReview.reviewRating.alternateName = rating;
      updateAnnotation(id, token, JSON.stringify(payload));
    });

}