var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	name: String,
	description: String,
	link: String,
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	estimate: Number,
	comments: [{
		author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		text: String
	}],
	url: {type: String, unique: true, sparse: true, trim: true}
});

Schema.methods.create = function(obj, user, sd) {
	this.author = user._id;
	this.name = obj.name;
	this.link = obj.link;
	this.description = obj.description;
}

module.exports = mongoose.model('Request', Schema);
