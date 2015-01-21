var mongo = require('mongodb');
var Data = require('./Data.js');

var Api = function(config) {
	for (var prop in config) this[prop] = config[prop];
	this.data = new Data(this);
};

Api.prototype.lineDistance = function(point1, point2) {
	var xs = 0;
	var ys = 0;

	xs = point2[1] - point1[1];
	xs = xs * xs;

	ys = point2[0] - point1[0];
	ys = ys * ys;

	return Math.sqrt(xs + ys);
};

Api.prototype.sites = function(req, res, cb) {
	var me = this;
	if (req.query.bbox) {
		this.doBoxSearch(req, res, cb, 'sites')
	} else if (req.query.bounds) {
		this.doBoundsSearch(req, res, cb, bounds, 'sites');
	} else if (req.query.watershed) {
		this.data.query(res, 'watersheds', {
			"properties.MDE8DIGT": req.query.watershed
		}, 'json', function(resp) {
			var bounds = (resp.data[0] && resp.data[0].geometry && resp.data[0].geometry.coordinates) ? resp.data[0].geometry.coordinates : [];
			me.doBoundsSearch(req, res, cb, bounds, 'sites');
		});
	} else {
		this.data.query(res, 'sites', {}, 'geojson', cb);
	}

};

Api.prototype.watersheds = function(req, res, cb) {

	this.data.query(res, 'watersheds', {}, 'geojson', cb);

};

Api.prototype.doBoxSearch = function(req, res, cb, collection) {

	if (!req.query.bbox) res.jsonp({
		error: ['no bbox specified']
	});

	var bbox = req.query.bbox.split(',').map(function(e) {
		return parseFloat(e);
	});

	var topLeft = [bbox[1], bbox[2]];
	var topRight = [bbox[3], bbox[2]];
	var botRight = [bbox[3], bbox[0]];
	var botLeft = [bbox[1], bbox[0]];

	//var dist = this.lineDistance([bbox[1], bbox[0]], [bbox[3], bbox[2]]);

	var bounds = [
		[topLeft, topRight, botRight, botLeft, topLeft]
	];

	this.doBoundsSearch(req, res, cb, bounds, collection)

};

Api.prototype.doBoundsSearch = function(req, res, cb, bounds, collection) {

	var query = {
		"geometry": {
			"$geoIntersects": {
				"$geometry": {
					type: "Polygon",
					coordinates: bounds
				}
			}
		}
	};

	console.log(JSON.stringify(query));

	this.data.query(res, collection, query, 'geojson', cb);

};

module.exports = Api;