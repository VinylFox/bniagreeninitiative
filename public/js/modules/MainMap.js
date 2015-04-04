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
		this.addCsas();
		this.addCityOutline();
		var ME = this;
		$('a.sel').click(function(ev) {
			$('a.sel').removeClass('selected');
			$(ev.target).addClass('selected');
			ME.addGPBType(ev.target.classList[ev.target.classList.length - 2]);
		});
	},
	createMap: function() {
		var ME = this;
		/**removed zoom control to put it in a different location**/
		this.map = L.map('mainmap', {
			zoomControl: false
		}).setView([this.state.center.lat, this.state.center.lon], this.state.center.zoom);
		new L.Control.Zoom({
			position: 'topright'
		}).addTo(this.map);
		this.fixMapSize();
		this.popup = L.popup();
		this.map.on('move', function() {
			// Construct an empty list to fill with onscreen markers.
			var inBounds = [],
				inBoundsSiteIds = [],
				html = '',
				// Get the map bounds - the top-left and bottom-right locations.
				bounds = ME.map.getBounds();

			// For each marker, consider whether it is currently visible by comparing
			// with the current map bounds.
			if (ME.gpbtype) {
				ME.gpbtype.eachLayer(function(marker) {
					if (bounds.contains(marker.getLatLng())) {
						inBounds.push(marker);
						inBoundsSiteIds.push(marker.feature.properties.site_id);
					}
				});
			}

			if (ME.search) {
				ME.search.eachLayer(function(marker) {
					if (bounds.contains(marker.getLatLng())) {
						inBounds.push(marker);
						inBoundsSiteIds.push(marker.feature.properties.site_id);
					}
				});
			}

			// use inBounds array to write to the html
			ME.addResultsList(inBounds);
			change_photo_set(inBoundsSiteIds);


		});
	},
	addResultsList: function(results) {
		var html = '<ul>';
		results.forEach(function(itm) {
			var props = (itm.feature) ? itm.feature.properties : itm.properties;
			html += '<li>' + ((props.url_sq) ? "<img width=50 src='" + props.url_m + "'>" : "") + '<b>' + props.site_name + '</b><br/>' + props.address + '</li>';
		});
		html += '</ul>';
		$('#propdetails > .location').html(html);
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

		if (props.site_id) {
				if(props.gpb_type == 'cmos'){
					var urls = get_photos_by_site(props.site_id,'CG');
					html = "<h2>" + (props.site_name || "UNNAMED SITE") + "</h2></br>" +
					((urls) ? "<img width=200 src='" + urls[0] + "'>" : "<img width=200 src='/public/img/placeholder.png'>") + "</br>" +
					"Location: " + (props.address || 'NO DATA') + "</br>" +
					"Site Use: " + (props.site_use || "NO DATA") + "</br>" +
					"Responsible Party: " + (props.resp_party || "NO DATA") + "</br>" +
					"For more information, contact: " + (props.contact || "NO DATA");

				}
				if(props.gpb_type == 'stormwater'){
					var urls = get_photos_by_site(props.site_id,'SW');
					html = "<h2>" + (props.site_name || "UNNAMED SITE") + "</h2></br>" +
					((urls) ? "<img width=200 src='" + urls[0] + "'>" : "<img width=200 src='/public/img/placeholder.png'>") + "</br>" +
					"Location: " + (parseFloat(props.POINT_X).toFixed(6) + ", " + parseFloat(props.POINT_Y).toFixed(6) || 'NO DATA') + "</br>" +
					"BMP Type: " + props.bmp_type + "</br>" +
					"Status: " + (props.status || 'NO DATA');
				}
			this.popup
				.setLatLng(e.latlng)
				.setContent(html)
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
					fillOpacity: 0.20
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
					weight: 3,
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
	addCsas: function() {
		$('.loading').show();
		var ME = this;
		$.get("/api/csas").success(function(data, status) {
			ME.csas = L.geoJson(data, {
				style: {
					fillColor: "#007DB6",
					weight: 3,
					opacity: 1,
					color: 'white',
					dashArray: 3,
					fillOpacity: 0.65
				},
				onEachFeature: ME.onEachFeature
			}).addTo(ME.map);
			$('.loading').hide();
			ME.addLayersControl();
		});
	},
	addLayersControl: function() {
		if (this.watersheds && this.neighborhoods && this.csas) {
			L.control.layers(null, {
				"City Boundary": this.city,
				"Watersheds": this.watersheds,
				"Neighborhoods": this.neighborhoods,
				"Csas":this.csas
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
		if (this.search) {
			this.map.removeLayer(this.search);
		}
		if (this.gpbtype) {
			this.map.removeLayer(this.gpbtype);
		}
		this.search = L.geoJson(data, {
			pointToLayer: function(feature, latlng) {
				return L.circleMarker(latlng, {
					radius: 6,
					fillColor: "#ff7800",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 0.8
				});
			},
			onEachFeature: this.onEachFeature
		}).addTo(this.map);
		if (data.features.length === 1) {
			var ctr = new L.LatLng(data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);
			this.map.setView(ctr, 17);
		} else {
			var bounds = this.search.getBounds();
			this.map.fitBounds(bounds);
		}
	},
	boundsSize: function(bounds) {
		return bounds.getNorthWest().distanceTo(bounds.getSouthEast()).toFixed(0);
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
				pointToLayer: function(feature, latlng) {
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