var Request = require(__dirname+'/schema.js');
module.exports = function(sd) {
	var router = sd._initRouter('/api/request');
	sd['query_update_all_request_author'] = function(req, res){
		return {
			_id: req.body._id,
			author: req.user._id
		};
	};
	sd['query_unique_field_request'] = function(req, res){
		return {
			_id: req.body._id,
			author: req.user._id
		};
	};
	sd['query_get_request'] = function(req, res) {
		return {};
	}
};
