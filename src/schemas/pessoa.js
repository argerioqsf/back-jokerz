const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Pessoa = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	idTwitch:{
		type:String
	},
	accessTokenTwitch:{
		type:String
	},
	refreshTokenTwitch:{
		type:String
	},
	idTwitch:{
		type:String
	},
	nickname:{
		type:String,
		required:true,
		unique:true
	},
	points: {
		type: Number,
		required: true
	},
	channels:[{
		info_channel:{
			type: mongoose.Schema.Types.ObjectId, ref: 'Channel',
			required:true
		},
		status:{
			type:Boolean,
			required:true
		},
		points:{
			type:Number,
			required:true
		}
	}],
	timeon: {
		type: String,
	},
	timeoff: {
		type: String
	}
})

// Pessoa.plugin(passportLocalMongoose, { usernameField: 'name'})

module.exports = mongoose.model('Pessoa', Pessoa)