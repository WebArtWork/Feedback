var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	name: String,
	description: String,
	link: String,
	created: Date,
	author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	feedbacks: [{
		author: String,
		ui: Number,
		uicomment: String,
		ux: Number,
		uxcomment: String,
		speed: Number,
		speedcomment: String,
		bugs: Number,
		bugscomment: String 
	}],
	url: {type: String, unique: true, sparse: true, trim: true}
});

Schema.methods.create = function(obj, user, sd) {
	this.author = user._id;
	this.name = obj.name;
	this.link = obj.link;
	this.created = new Date();
	this.description = obj.description;
}

module.exports = mongoose.model('Request', Schema);
