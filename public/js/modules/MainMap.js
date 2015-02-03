var MainMap = React.createClass({
	displayName: 'MainMap',
	getInitialState: function() {
		return {
			center: config.defaultMapCenter
		};
	},
	setMapCenter: function(lat, lon, zoom) {
		this.setState({
			center: {
				lat: lat,
				lon: lon,
				zoom: zoom
			}
		});
	},
	componentDidMount: function() {
		this.createMap();
		this.addTileLayer();
		this.addWatersheds();
		this.addCityOutline();
		var ME = this;
		$('a.sel').click(function(ev) {
			ME.addGPBType(ev.target.classList[ev.target.classList.length - 1]);
		});
		$('.overlay').click(function(ev) {
			if (ev.target.hasClass('watersheds')) {

			} else if (ev.target.hasClass('city')) {

			}
		});
	},
	createMap: function() {
		this.map = L.map('mainmap').setView([this.state.center.lat, this.state.center.lon], this.state.center.zoom);
		this.fixMapSize();
		this.popup = L.popup();
	},
	addTileLayer: function() {
		L.tileLayer(this.props.tileServerUrl, {
			maxZoom: this.props.tileMaxZoom,
			attribution: this.props.tileAttribution
		}).addTo(this.map);
	},
	shapeHover: function(e) {
		var layer = e.target,
			props = layer.feature.properties,
			html = '';
		if (props.MDE8NAME) {
			layer.setStyle({
				weight: 5,
				color: '#666',
				dashArray: '',
				fillOpacity: 0.5
			});
			html = props.MDE8NAME;
		}
		$('.propinfo').html(html);
	},
	shapeMouseOut: function(e) {
		if (e.target.feature.properties.MDE8NAME) {
			(this.watersheds) ? this.watersheds.resetStyle(e.target): '';
		}
	},
	shapeClick: function(e) {
		var shape = e.target.feature,
			html,
			props = shape.properties,
			coords = shape.geometry.coordinates;

		if (props.site_name) {
			this.popup
				.setLatLng(e.latlng)
				.setContent(props.site_name)
				.openOn(this.map);
		} else {
			this.lastCoords = coords;
			this.lastWatershed = props.MDE8DIGT;
			this.map.fitBounds(e.target.getBounds());
		}
	},
	addWatersheds: function() {
		$('.loading').show();
		var ME = this;
		$.get("/api/watersheds").success(function(data, status) {
			ME.watersheds = L.geoJson(data, {
				style: ME.getWatershedStyle,
				onEachFeature: ME.onEachFeature
			}).addTo(ME.map);
			$('.loading').hide();
			L.control.layers(null, {
				"City Boundary": ME.city,
				"Watersheds": ME.watersheds
			}).addTo(ME.map);
		});
	},
	addCityOutline: function() {
		var ME = this;
		ME.city = L.geoJson(config.cityOutlineGeoJson, {
			color: "#ff7800",
			weight: 3,
			opacity: 0.45
		}).addTo(this.map);
	},
	addSites: function() {
		var ME = this;
		if (this.map.getZoom() > 10) {
			$('.loading').show();
			$.get("/api/sites?watershed=" + this.lastWatershed).success(function(data, status) {
				ME.sites = L.geoJson(data, {
					style: ME.getWatershedStyle,
					onEachFeature: ME.onEachFeature
				}).addTo(ME.map);
				$('.loading').hide();
			});
		}
	},
	addSearchResults: function(data) {
		if (data.features.length === 0) {
			return;
		}
		if (this.search) {
			this.map.removeLayer(this.search);
		}
		this.search = L.geoJson(data).addTo(this.map);
		this.map.fitBounds(this.search.getBounds());
	},
	addGPBType: function(type) {
		var ME = this;
		$.ajax({
			url: "/api/sites?gpb_type=" + type
		}).done(function(data) {
			if (data.features.length === 0) {
				return;
			}
			if (ME.gpbtype) {
				ME.map.removeLayer(ME.gpbtype);
			}
			ME.gpbtype = L.geoJson(data).addTo(ME.map);
			ME.map.fitBounds(ME.gpbtype.getBounds());
		});
	},
	getWatershedStyle: function(feature) {
		return {
			fillColor: "#137B80",
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: 3,
			fillOpacity: 0.35
		}
	},
	onEachFeature: function(feature, layer) {
		console.log(feature);
		layer.on({
			mouseover: this.shapeHover,
			mouseout: this.shapeMouseOut,
			click: this.shapeClick
		});
	},
	fixMapSize: function() {
		$('#mainmap').css({
			'width': $(window).width() + 'px',
			'height': $(window).height() + 'px'
		});
		this.map.invalidateSize();
	},
	render: function() {
		return React.DOM.div();
	}
});