var config = {},
	map,
	search;

config.cityOutlineGeoJson = {
	"type": "Feature",
	"properties": {
		"AREA": 2562713344.0
	},
	"geometry": {
		"type": "LineString",
		"coordinates": [
			[-76.711293669970217, 39.371957030672938],
			[-76.52967423510151, 39.371971900043278],
			[-76.529858300949158, 39.209622953304475],
			[-76.549725312649713, 39.197233450625106],
			[-76.583673126628199, 39.208120531796183],
			[-76.61161075881013, 39.234394547529099],
			[-76.711161349110256, 39.277838496606982],
			[-76.711293669970217, 39.371957030672938]
		]
	}
};

config.defaultMapCenter = {
	lat: 39.2854197594374,
	lon: -76.61796569824219,
	zoom: 12
};

config.flickr = {
	key: "c6e9e1d37f7deffa5b5e1705c6464c0f",
	URL: "https://api.flickr.com/services/rest/?text=&user_id=[USER]&method=flickr.photosets.getPhotos&api_key=[KEY]&photoset_id=[PHOTOSET]&extras=description,tags,machine_tags,url_sq,url_m&format=json&per_page=[PER_PAGE]",
	users: [{
		user: "100324530@N02",
		photoset: "72157635087018134"
	}],
	pageSize: 100,
};

$(window).resize(function() {
	$('#mainmap').css({
		'width': $(window).width() + 'px',
		'height': $(window).height() + 'px'
	});
	map.map.invalidateSize();
});

$(function() {
	map = React.renderComponent(MainMap({
		tileServerUrl: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		//tileServerUrl: 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg',
		tileMaxZoom: 22,
		tileAttribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
	}), document.getElementById('mainmap'));
	search = React.renderComponent(Search({
		map: map
	}), document.getElementById('search'));
});