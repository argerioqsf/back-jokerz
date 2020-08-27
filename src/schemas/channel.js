const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Channel = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique:true
	},
	linkTwitch:{
		type: String,
		required: true
	},
	id_person:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Pessoa',
		required:true
	},
	active:{
		type:Boolean,
		default:false
	}
})


module.exports = mongoose.model('Channel', Channel)