var Search = React.createClass({
	displayName: 'Search',
	keyUpWaitTime: 600,
	getInitialState: function() {
		return {
			term: '',
			items: []
		};
	},
	getTerm: function() {
		return this.getState().term;
	},
	setTerm: function(term) {
		this.setState({
			term: term
		});
	},
	componentDidMount: function() {

	},
	zipcodeRe: /^\d{5}((-|\s)?\d{4})?$/,
	addressRe: /^[ \w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,},\x20[A-Za-z]{2}\x20\d{5}(-\d{4})?$/,
	doSearch: function(term) {
		var me = this,
			searchType = 'search';

		if (me.addressRe.test(term)) {
			searchType = 'address';
		} else if (me.zipcodeRe.test(term)) {
			searchType = 'zipcode';
		}

		if (searchType === 'search') {
			$.ajax({
				url: "/api/sites?" + searchType + "=" + term
			}).done(function(data) {
				me.setState({
					items: data.features
				});
				if (data.features.length > 0) {
					me.props.map.addSearchResults.call(me.props.map, data);
				}
			});
		} else {
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({
					address: term
				},
				function(result) {
					var dialog, len, point;
					if (result.length > 1) {
						alert("Multiple matches were found.  Please provide a more specific address. ie: '3600 Roland Ave'");
					} else {
						ctr = new L.LatLng(result[0].geometry.location.lat(), result[0].geometry.location.lng());
						me.props.map.map.setView(ctr, 17);
					}
				}
			);
		}
	},
	onChange: function(e) {
		var me = this,
			fld = $(e.target),
			val = fld.val();
		this.setTerm(val);
		if (this.timer) {
			clearTimeout(this.timer);
		}
		if (val && val.length > 2) {
			this.timer = setTimeout(function() {
				me.doSearch(fld.val());
			}, this.keyUpWaitTime);
		}
	},
	render: function() {
		return (
			React.DOM.div(null,
				React.DOM.input({
					onChange: this.onChange,
					value: this.state.term,
					placeholder: 'Address or Keyword'
				})
			)
		);
	}
});