const mongoose = require('../configs/database/connectMongo');

const RedeemPoints = new mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
	amount:{
		type: Number,
		required: true
	},
    id_user:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Pessoa',
		required:true
    },
    id_channel:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Channel',
		required:true
    },
    status:{
		type: String,
		default:'pendente'
    }
	//valido
	//cancelado
})


module.exports = mongoose.model('RedeemPoints', RedeemPoints)