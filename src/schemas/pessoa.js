const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')
const bcrypt = require('bcryptjs');

const Pessoa = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	password: {
		type: String,
		select:false
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
	nickname:{
		type:String,
		required:true,
		unique:true
	},
	points: {
		type: Number,
		default:0
	},
	active:{
		type:Boolean,
		default:false
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
	permissions:[{ifo_permission:{type: mongoose.Schema.Types.ObjectId, ref:'Permissions',required:true}}],
	// permissions:{
	// 	type:String,
	// 	required:true
	// },
	tradelinkSteam:{
		type:String,
		default:''
	},
	secondary_accounts:[{type: mongoose.Schema.Types.ObjectId,ref:'Pessoa'}],
	//primary
	//secondary
	type_account:{
		type:String,
		default:'pendente'
	},
	primary_account_ref:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Pessoa'
	},
	streamer:{
		type:Boolean,
		default:false
	}

})

Pessoa.pre('save',async function(next){
	if (this.password) {
		const hash = await bcrypt.hash(this.password, 10);
		this.password = hash;
		this.nickname = this.nickname.toLowerCase();
		next();
	}else{
		next();
	}
});

// Pessoa.plugin(passportLocalMongoose, { usernameField: 'name'})

module.exports = mongoose.model('Pessoa', Pessoa)