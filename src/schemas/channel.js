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
	roleta:[
		{
			name:{
				type: String,
				required: true
			},
			probability:{
				type: Number,
				required: true
			},
			multiplicador:{
				type: Number,
				required: true
			},
			campos:[
				{
					type: Number,
					required: true
				}
			]
		}
	],
	probability_roulette:{
		type:Number,
		default:45
	},
	porcetagem_indicacao:{
		type:Number,
		default:50
	},
	picture: {
		type: String
	}
})


module.exports = mongoose.model('Channel', Channel)