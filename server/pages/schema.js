var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	view: Boolean,
	template: {type: String},
	url: {type: String, unique: true, sparse: true, trim: true},
	title: String,
	description: String,
	image: {type: String, default: '/api/user/default.png'},
	keywords: [String],
	keywords_view: String, // something else, word, two words, cool, good
	html: String,

	features: {}
});

Schema.methods.create = function(obj, user, sd) {
	this.author = user._id;
}

module.exports = mongoose.model('Pages', Schema);
