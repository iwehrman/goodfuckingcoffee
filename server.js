var http = require("http");
var url = require("url");
var fs = require("fs");

// see https://github.com/olalonde/node-yelp
var yelp = require("yelp").createClient({
  consumer_key: "JJ0WFEU5hEKjMkxoVAT63A", 
  consumer_secret: "kNAsL7p3lyXs7l_zrcyru8-o6T0",
  token: "XLSKFxgcoB_z0oiUBOxT73wYMwCA0D2_",
  token_secret: "tAJaUQrFzgqNLbejiV8NhYN5Db4"
});

function find_good_shop(shops, omit) {
	var good_shop = null;
	var shop;
	for (var i = 0; i < shops.length; i++) {
		shop = shops[i];
		if (shop.rating > 4.0 && !shop.is_closed && 
			shop.location.postal_code && shop.location.address &&
			shop.location.address.length > 0 &&
			!(shop.id in omit)) {
			good_shop = shop;
			break;
		}
	}
	return good_shop;
}

function search_yelp(lat, lon, omit, response) {
	// See http://www.yelp.com/developers/documentation/v2/search_api
	var latlon = lat + ","+ lon;
	var options = {term: "coffee shop", category_list: "coffee", 
		sort: 1, ll: latlon};
	yelp.search(options, function(error, data) {
		if (error) {
			response.writeHead(404);
			console.log(error);
		} else {
			var shops = data.businesses; 
			var good_shop = find_good_shop(shops, omit);
			if (good_shop) {
				response.writeHead(200, "text/json");
				response.write(JSON.stringify(good_shop));	
			} else {
				response.writeHead(404);
			}
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
	    var omit = JSON.parse(parsedurl.query.omit);
	    search_yelp(lat, lon, omit, response);
	} else if (path === "/s") {
	    var lat = parsedurl.query.lat;
	    var lon = parsedurl.query.lon;
	    var shop = parsedurl.query.shop;
	    console.log("Sucks: " + shop + " at " + lat + "," + lon + " on " + new Date());
	    response.writeHead(200);
	    response.end();
	} else {
		response.writeHead(404);
		response.write("No: " + path);
		response.end();
	}
}

http.createServer(onRequest).listen(8126);