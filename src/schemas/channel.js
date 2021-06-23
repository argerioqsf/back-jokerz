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
	},
	max_farm_account:{
		type:Number,
		default:1
	},
	probability_roulette:{
		type:Number,
		default:45
	},
	picture: {
		type: String
	}
})


module.exports = mongoose.model('Channel', Channel)