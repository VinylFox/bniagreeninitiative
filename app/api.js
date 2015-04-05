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
	} else if (req.query.search) {
		this.data.query(res, 'sites', {
			'$text': {
				'$search': req.query.search
			}
		}, 'geojson', cb);
	} else if (req.query.gpb_type) {
		if (req.query.refinement) {

		} else {
			this.data.query(res, 'sites', {
				'properties.gpb_type': req.query.gpb_type
			}, 'geojson', cb);
		}
	} else {
		this.data.query(res, 'sites', {}, 'geojson', cb);
	}

};

Api.prototype.watersheds = function(req, res, cb) {

	this.doBoundsSearch(req, res, cb, [
		[-76.711293669970217, 39.371957030672938],
		[-76.52967423510151, 39.371971900043278],
		[-76.529858300949158, 39.209622953304475],
		[-76.549725312649713, 39.197233450625106],
		[-76.583673126628199, 39.208120531796183],
		[-76.61161075881013, 39.234394547529099],
		[-76.711161349110256, 39.277838496606982],
		[-76.711293669970217, 39.371957030672938]
	], 'watersheds', 'LineString');

};

Api.prototype.neighborhoods = function(req, res, cb) {

	this.data.query(res, 'neighborhoods', {}, 'geojson', cb);

};

Api.prototype.csas = function(req, res, cb) {

	this.data.query(res, 'csa', {}, 'geojson', cb);

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

Api.prototype.doBoundsSearch = function(req, res, cb, bounds, collection, type) {

	var query = {
		"geometry": {
			"$geoIntersects": {
				"$geometry": {
					type: (type) ? type : "Polygon",
					coordinates: bounds
				}
			}
		}
	};

	console.log(JSON.stringify(query));

	this.data.query(res, collection, query, 'geojson', cb);

};

Api.prototype.refinements = function(req, res, cb, type, field) {
	var query = [{
		'$match': {
			'properties.gpb_type': type
		}
	}, {
		'$group': {
			_id: '$properties.' + field
		}
	}];
	query[0]['$match']['properties.' + field] = {
		'$ne': ''
	};

	console.log(JSON.stringify(query));

	this.data.aggregate(res, 'sites', query, 'json', cb);

}

module.exports = Api;