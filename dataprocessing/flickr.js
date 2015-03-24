/* 

jsonFlickrApi(

	photoset: {
		id: "72157635087018134",
		primary: "9518673634",
		owner: "100324530@N02",
		ownername: "bniajfi",
		photo: [
		{
			id: "9518673634",
			secret: "9823836d44",
			server: "5459",
			farm: 6,
			title: "Faith Garden/Chess Park (CG_0500)",
			isprimary: "1",
			ispublic: 1,
			isfriend: 0,
			isfamily: 0,
			tags: "cg0500",
			url_sq: "https://farm6.staticflickr.com/5459/9518673634_9823836d44_s.jpg",
			height_sq: 75,
			width_sq: 75,
			url_m: "https://farm6.staticflickr.com/5459/9518673634_9823836d44.jpg",
			height_m: "375",
			width_m: "500"
		}
*/

var fs = require('fs');
var https = require('https');
var async = require('async');

var config = {
	flickr: {
		key: "c6e9e1d37f7deffa5b5e1705c6464c0f",
		URL: "https://api.flickr.com/services/rest/?text=&user_id=[USER]&method=flickr.photosets.getPhotos&api_key=[KEY]&photoset_id=[PHOTOSET]&extras=tags,url_sq,url_m&format=json&per_page=[PER_PAGE]",
		users: [{
			user: "100324530@N02",
			photoset: "72157635087018134"
		}],
		pageSize: 1000,
	}
};

var queue = [],
	data = '';

process.on('uncaughtException', function(error) {
	console.log(error.stack);
});

var MongoClient = require('mongodb').MongoClient;
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/bniagreeninitiative';
MongoClient.connect(mongoUri, function(err1, db) {
	if (err1) throw err1;

	var collection = db.collection('sites');
	var url = config.flickr.URL.replace('[USER]', config.flickr.users[0].user).replace('[PHOTOSET]', config.flickr.users[0].photoset).replace('[KEY]', config.flickr.key).replace('[PER_PAGE]', config.flickr.pageSize);

	var flickrReq = https.request(url, function(flickrRes) {
		flickrRes.on('data', function(d) {
			data = data + d;
		});
		flickrRes.on('end', function() {
			var jsonPart = data.replace('jsonFlickrApi(','');
			var jsonData = JSON.parse(jsonPart.substr(0,jsonPart.length-1));
			jsonData.photoset.photo.forEach(function(itm){
				console.log(itm);
				queue.push(itm);
			});
			queue.push({
				done: true
			});
			async.eachSeries(queue, function(data, callback) {

				if (data.done) {
					console.log('done');
					process.exit(0);
					setImmediate(function() {
						callback();
					});
				} else {
					var site_id = data.tags.substr(0,2).toUpperCase() + '_' + data.tags.substr(2,4);
					collection.findOne({
						_id: site_id
					}, function(err, result) {
						if (err) {
							console.log(err);
							setImmediate(function() {
								callback();
							});
						} else {
							if (result != null) {
								console.log('Updating existing site for ' + site_id);
								if (data.url_sq) {
									result.properties.url_sq = data.url_sq;
								}
								if (data.url_m) {
									result.properties.url_m = data.url_m;
								}
								collection.update({
									_id: site_id
								}, result, function() {
									setImmediate(function() {
										callback();
									});
								});
							}
						}
					});
				}

			});

		});
	});

	flickrReq.end();

	flickrReq.on('error', function(err) {
		console.log(err);
	});

});