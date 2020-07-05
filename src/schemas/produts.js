const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Produts = new mongoose.Schema({
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
		type: Number
    },
    promo:{
        type:Boolean
    },
    imageurl:{
        type:String
    },
    inspectGame:{
        type:String
    },
    exterior:{
        type:String
    },
    amount:{
        type:Number
    }
})

module.exports = mongoose.model('Produts', Produts)