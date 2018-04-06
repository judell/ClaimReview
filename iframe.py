import requests
import traceback
import pyramid
import logging
import re
import time
import urllib
import json
from urlparse import urlparse, urljoin, parse_qs
from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config

logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M',
                    filename='iframe.log',level=logging.DEBUG
                    )
logger = logging.getLogger('')
console = logging.StreamHandler()
console.setLevel(logging.DEBUG)
logger.addHandler(console)

server_scheme = 'http'
server_host = 'localhost'  
server_port = 8080

if server_port is None:
    server = '%s://%s' % (server_scheme, server_host)
else:
    server = '%s://%s:%s' % (server_scheme, server_host, server_port)

logger.info( 'server: %s' % server )

from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response

claimReviewTemplate = """
<html>
<head>
<link rel="stylesheet" href="https://jonudell.info/h/ClaimReview/claimReview.css">
<script src="https://jonudell.info/hlib/hlib.js"></script>
<script src="https://jonudell.info/h/ClaimReview/claimReview.js"></script>
<head>
<body>

<div style="display:none" id="annotationId">{id}</div>

<div style="display:none" id="token">{token}</div>

<div class="field">
  claim
  <div><input size="80" value="{claimReviewed}"></div>
</div>

<div class="field">
  url
  <div><input size="80" value="{urlReviewed}"></div>
</div>

<div class="field">
  author 
  <div><input id="author" size="40" value="{author}"> </div>
</div>

<div class="field">
  rating
  <div>
    {ratingSelect}
  </div>
</div>

<div>
<button onclick="update()">update</button>
</div>

<textarea class="claimReviewJson">
{claimReview}
</textarea>

</body>
</html>
"""

# Step 3 (for previous step 2, see index.html)
#
# Expects to be launched in the body of an annotation that is anchored to a selected claim, and 
# has a ClaimReview object in its extra JSON.
#
# Params are the ID of the annotation in which the iframe is embedded, and an H API token.
#
# Renders the ClaimReview data as a form with editable fields, and as viewable JSON.
#
# Wires the form's update action to the app in step 4 (claimReview.js)

def ratingSelector(rating):
    select = """
      <select id="rating">
      <option>---</option>
    """
    for option in ['True', 'False', 'Misleading', 'PantsOnFire']:
        selected = ''
        if option == rating:
            selected = 'selected'
        select += '<option %s>%s</option>' % ( selected, option )
    select += '</select>'
    return select

tokens = {
    "judell":"6879-358c122361d9fa61cc1bc825a78a3df5"
}

@view_config( route_name='claimReview' )
def claimReview(request):
    qs = parse_qs(request.query_string)
    id = qs['hypothesisAnnotationId'][0]
    user = urllib.unquote(qs['user'][0])
    token = tokens[user]
    print 'user %s, id %s, token %s' % (user, id, token)
    headers = {'Authorization':'Bearer %s' % token }    
    data = requests.get('https://hypothes.is/api/annotations/' + id, headers=headers).json()
    claimReview = data['extra']['claimReview']
    claimReviewed = claimReview['claimReviewed']
    urlReviewed = claimReview['itemReviewed']['author']['sameAs']
    author = claimReview['itemReviewed']['author']['name']
    rating = claimReview['reviewRating']['alternateName']
    ratingSelect = ratingSelector(rating)

    content = claimReviewTemplate.format(
        id=id,
        token=token,
        claimReviewed=claimReviewed,
        author=author,
        urlReviewed=urlReviewed,
        ratingSelect=ratingSelect,
        claimReview=json.dumps(claimReview, indent=2)
        );
    r = Response(body=content)
    return r

config = Configurator()

config.scan()

config.add_route('claimReview', '/claimReview')

app = config.make_wsgi_app()

if __name__ == '__main__': 

    server = make_server(server_host, server_port, app)
    server.serve_forever()
    
