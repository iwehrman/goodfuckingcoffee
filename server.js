var http = require("http");
var url = require("url");
var fs = require("fs");


// see https://github.com/olalonde/node-yelp
var yelp = require("yelp").createClient({
  consumer_key: "JJ0WFEU5hEKjMkxoVAT63A", 
  consumer_secret: "kNAsL7p3lyXs7l_zrcyru8-o6T0",
  token: "pAv3WL5VlQhFyK9hyDd_-EXN_grChcNW",
  token_secret: "2XT75LHXEvm8Tz7d40US6urU5Ig"
});

function find_coffee(results) {
	var coffee = null;
	for (var i = 0; i < results.length; i++) {
		coffee = results[i];
		if (coffee.rating > 4.0 && !coffee.is_closed && coffee.location.cross_streets) {
			break;
		}
	}
	return coffee;
}

function coffee_to_json(coffee) {
	var obj = {};
	if (coffee != null) {
		obj.status = true;
		obj.coffee = coffee;
	} else {
		obj.status = false;
	}
	return JSON.stringify(obj);
}

function search_yelp(lat, lon, response) {
	// See http://www.yelp.com/developers/documentation/v2/search_api
	var latlon = lat + ","+ lon;
	var options = {term: "coffee shop", category_list: "coffee", 
		sort: 1, ll: latlon};
	yelp.search(options, function(error, data) {
		response.writeHead(200, "text/json");
		if (error) {
			console.log(error);
			response.write(coffee_to_json(null));
		} else {
			var results = data.businesses; 
			var coffee = find_coffee(results);
			response.write(coffee_to_json(coffee));
		}
		response.end();
	});

	
}

function onRequest(request, response) {
	var parsedurl = url.parse(request.url, true);
	var path = parsedurl.pathname;

	if (path === "/") {
		var stream = fs.createReadStream("client.html");
		response.writeHead(200, {"Content-Type": "text/html"});
		stream.pipe(response);
	} else if (path === "/y") {
	    var lat = parsedurl.query.lat;
	    var lon = parsedurl.query.lon;	    
	    search_yelp(lat, lon, response);
	} else {
		response.writeHead(404);
		response.write("No: " + path);
		response.end();
	}
}

http.createServer(onRequest).listen(8126);