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
		this.addNeighborhoods();
		this.addCityOutline();
		var ME = this;
		$('a.sel').click(function(ev) {
			ME.addGPBType(ev.target.classList[ev.target.classList.length - 1]);
		});
	},
	createMap: function() {
		var ME = this;
		/**removed zoom control to put it in a different location**/
		this.map = L.map('mainmap',{zoomControl: false}).setView([this.state.center.lat, this.state.center.lon], this.state.center.zoom);
		new L.Control.Zoom({position: 'topright'}).addTo(this.map);
		this.fixMapSize();
		this.popup = L.popup();
		this.map.on('move', function() {
		    // Construct an empty list to fill with onscreen markers.
		    var inBounds = [],
		    	html = '',
		    // Get the map bounds - the top-left and bottom-right locations.
		        bounds = ME.map.getBounds();

		    // For each marker, consider whether it is currently visible by comparing
		    // with the current map bounds.
		    if (ME.gpbtype) {
			    ME.gpbtype.eachLayer(function(marker) {
			        if (bounds.contains(marker.getLatLng())) {
			            inBounds.push(marker);
			        }
			    });
			  }

		    // use inBounds array to write to the html
		    html += '<ul>';
		    inBounds.forEach(function(itm){
		    	var props = itm.feature.properties;
		    	html += '<li><b>' + props.site_name + '</b><br/>' + props.bmp_type + '<br/>' + props.location + '</li>';
		    });
		    html += '</ul>';
		    $('#propdetails > .location').html(html);
		    
		});
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

			console.log(props);

		if (props.site_name || props.bmp_type) {
			this.popup
				.setLatLng(e.latlng)
				.setContent(props.site_name || props.bmp_type)
				.openOn(this.map);
		} else if (props.MDE8DIGT || props.Name) {
			this.lastCoords = coords;
			this.lastWatershed = props.MDE8DIGT || props.Name;
			this.map.fitBounds(e.target.getBounds());
		}
	},
	addWatersheds: function() {
		$('.loading').show();
		var ME = this;
		$.get("/api/watersheds").success(function(data, status) {
			ME.watersheds = L.geoJson(data, {
				style: {
					fillColor: "#137B80",
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: 3,
					fillOpacity: 0.35
				},
				onEachFeature: ME.onEachFeature
			}).addTo(ME.map);
			$('.loading').hide();
			ME.addLayersControl();
		});
	},
	addNeighborhoods: function() {
		$('.loading').show();
		var ME = this;
		$.get("/api/neighborhoods").success(function(data, status) {
			ME.neighborhoods = L.geoJson(data, {
				style: {
					fillColor: "#248724",
					weight: 2,
					opacity: 1,
					color: 'white',
					dashArray: 3,
					fillOpacity: 0.35
				},
				onEachFeature: ME.onEachFeature
			}).addTo(ME.map);
			$('.loading').hide();
			ME.addLayersControl();
		});
	},
	addLayersControl: function() {
		if (this.watersheds && this.neighborhoods) {
			L.control.layers(null, {
				"City Boundary": this.city,
				"Watersheds": this.watersheds,
				"Neighborhoods": this.neighborhoods
			}).addTo(this.map);
		}
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
			ME.gpbtype = L.geoJson(data, {
				pointToLayer: function (feature, latlng) {
		      return L.circleMarker(latlng, {
					    radius: 6,
					    fillColor: "#ff7800",
					    color: "#000",
					    weight: 1,
					    opacity: 1,
					    fillOpacity: 0.8
					});
		    },
				onEachFeature: ME.onEachFeature
			}).addTo(ME.map);
			ME.map.fitBounds(ME.gpbtype.getBounds());
		});
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