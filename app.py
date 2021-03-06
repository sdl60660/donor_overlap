from flask import Flask, render_template, request, jsonify, redirect
import json	
import os	
from urllib.parse import urlparse, urlunparse

SECRET_KEY = os.getenv('SECRET_KEY', '2345')	

FROM_DOMAIN = "donor-overlap.herokuapp.com"
TO_DOMAIN = "donor-overlap.samlearner.com"

app = Flask(__name__)	
app.secret_key = SECRET_KEY	

@app.before_request
def redirect_to_new_domain():
    urlparts = urlparse(request.url)
    if urlparts.netloc == FROM_DOMAIN:
        urlparts_list = list(urlparts)
        urlparts_list[1] = TO_DOMAIN
        return redirect(urlunparse(urlparts_list), code=301)

@app.after_request
def after_request(response):
    header = response.headers
    header['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/')	
def homepage():	
	return render_template('index.html')	

if __name__ == "__main__":	
    app.run(port=5453, debug=True)