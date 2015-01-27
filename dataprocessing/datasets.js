/* 
	site_id,
	site_name,
	address,
	location,
	block,
	lot,
	POINT_X,
	POINT_Y,
	Watershed,
	Subwatersh,
	site_use,
	status,
	drain_acres,
	pct_imp,
	Imp_acres,
	An_Runoff,
	Retrofit_Type,
	bmp_type,
	feasibility,
	design_difficulty,
	watershed_benefit,
	priority,
	oldsiteid,
	gpb_type,
	bmp_drainiage,
	bmp_impervious,
	bmp_imptreat,
	costs_est,
	costs_maintenance,
	resp_party,
	organizations,
	contact,
	CSA
*/

var fs = require('fs');
var csv = require('csv-parse');
var async = require('async');

var queue = [];

process.on('uncaughtException', function(error) {
	console.log(error.stack);
});

var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://127.0.0.1:27017/bniagreeninitiative', function(err1, db) {
	if (err1) throw err1;

	var collection = db.collection('sites');
	var cvsrs = csv({
		delimiter: ',',
		quote: '"',
		columns: true
	});
	var rs = fs.createReadStream('./data/BCDPW_sites_v3.csv', {
			autoClose: true
		}).pipe(cvsrs)
		.on('error', function(err) {
			console.error(err);
		})
		.on('end', function() {
			async.eachSeries(queue, function(data, callback) {

				console.log(data);

				console.log(data.site_id);
				collection.findOne({
					_id: data.site_id
				}, function(err, result) {
					console.log('result of find being processed');
					if (err) {
						console.log(err);
						setImmediate(function() {
							callback();
						});
					} else {
						console.log('result of find has no error');
						if (result != null) {
							console.log('Updating existing site for ' + data.site_id);
							result.geometry = {
								"type": "Point",
								"coordinates": [parseFloat(data.POINT_X), parseFloat(data.POINT_Y)]
							}
							result.properties = data;
							collection.update({
								_id: data.site_id
							}, result, function() {
								setImmediate(function() {
									callback();
								});
							});
						} else {
							if (result == null) {
								console.log('No site exists yet, adding one for ' + data.site_id);
								var newitem = {};
								newitem._id = data.site_id;
								newitem.properties = data;
								newitem.geometry = {
									"type": "Point",
									"coordinates": [parseFloat(data.POINT_X), parseFloat(data.POINT_Y)]
								}
								collection.insert(newitem, {
									w: 1
								}, function(err, result2) {
									if (err) {
										console.log(err);
									} else {
										console.log(result2[0].site_id);
									}
									setImmediate(function() {
										callback();
									});
								});
							} else {
								console.log('Result is something else : ' + result);
								setImmediate(function() {
									callback();
								});
							}
						}
					}
				});

			});

		})
		.on('data', function(data) {
			queue.push(data);
		});
});