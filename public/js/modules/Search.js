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
	doSearch: function(term) {
		var me = this;
		$.ajax({
			url: "/api/sites?search=" + term
		}).done(function(data) {
			console.log(data);
			me.setState({
				items: data.features
			});
			me.props.map.addSearchResults.call(me.props.map, data);
		});
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