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
		this.map.on('zoomend', this.addSites, this);
		this.map.on('moveend', this.addSites, this);
	},
	createMap: function() {
		this.map = L.map('mainmap').setView([this.state.center.lat, this.state.center.lon], this.state.center.zoom);
		this.fixMapSize();
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
				fillOpacity: 0.7
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
		this.lastCoords = coords;
		this.lastWatershed = props.MDE8DIGT;
		this.map.fitBounds(e.target.getBounds());
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
		});
	},
	addSites: function() {
		if (this.map.getZoom() > 10) {
			$('.loading').show();
			/*var ME = this,
				bounds = this.map.getBounds(),
				n = bounds.getNorth(),
				s = bounds.getSouth(),
				e = bounds.getEast(),
				w = bounds.getWest(),
				bbox = "bbox=" + n + ',' + w + ',' + s + ',' + e;
			if (this.lastCoords) {
				"bounds=" + JSON.stringify(this.lastCoords);
			}*/

			$.get("/api/sites?watershed=" + this.lastWatershed).success(function(data, status) {
				ME.sites = L.geoJson(data, {
					style: ME.getWatershedStyle,
					onEachFeature: ME.onEachFeature
				}).addTo(ME.map);
				$('.loading').hide();
			});
		}
	},
	getWatershedStyle: function(feature) {
		return {
			fillColor: "#137B80",
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: 3,
			fillOpacity: 0.65
		}
	},
	onEachFeature: function(feature, layer) {
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