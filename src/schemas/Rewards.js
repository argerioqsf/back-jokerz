const mongoose = require('../configs/database/connectMongo');

const Rewards = new mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
    id_reward:{
		type: String,
		required: true
    },
	title:{
		type: String,
		required: true,
	},
	cost:{
		type: String,
		required: true
	},
	id_channel:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Channel'
	}
})


module.exports = mongoose.model('Rewards', Rewards)