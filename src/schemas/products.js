const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Products = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	name_store: {
		type: String,
		required: true
	},
	describe:{
		type:String,
		required:true,
	},
	price: {
		type: Number,
		required: true
	},
	pricePromo: {
		type: Number,
		default:0
    },
    promo:{
		type:Boolean,
		default:false
    },
    imageurl:{
        type:String
    },
    inspectGameLink:{
        type:String
    },
    exterior:{
        type:String
    },
    type:{
        type:String
    },
    amount:{
        type:Number
	},
	itemCategory:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Categories'
	},
    id_item:{
        type:String
    },
})

module.exports = mongoose.model('Products', Products)