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
		default:0
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
		},
		banned:{
			type: Boolean,
			default:false
		},
		subscribe:{
			type: Boolean,
			default:false
		}
	}],
	timeon: {
		type: String,
	},
	timeoff: {
		type: String
	},
	session: {
		type: String,
		required:true
	},
	permissions:[{ifo_permission:{type: mongoose.Schema.Types.ObjectId, ref:'Permissions'}}],
	tradelinkSteam:{
		type:String
	},
	secondary_accounts:[{nickname:{type:String,required:true}}]

})

// Pessoa.plugin(passportLocalMongoose, { usernameField: 'name'})

module.exports = mongoose.model('Pessoa', Pessoa)