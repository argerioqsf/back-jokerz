const mongoose = require('../configs/database/connectMongo');

const RedeemProduct = new mongoose.Schema({
	date: {
		type: Date,
		required: true
	},
    product_id:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Products',
		required:true
    },
	amount:{
		type: Number,
		required: true
	},
    product_float:{
		type: String
    },
	price:{
		type: Number,
		required: true
	},
    id_user:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Pessoa',
		required:true
    },
    tradeLink:{
		type: String
    },
	id_owner:{
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
	//pendente
	//entregue
	//cancelado
})


module.exports = mongoose.model('RedeemProduct', RedeemProduct)