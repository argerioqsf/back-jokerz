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
	},
	price: {
		type: Number
	},
	price_real: {
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
    imagepath:{
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
        type:Number,
		required: true
	},
	itemCategory:{
		type:mongoose.Schema.Types.ObjectId,
		ref:'Categories'
	},
	class_id:{
        type:String
	},
	id_owner:{
        type:String
	},

    status:{
        type:String,
		default:"cadastrado",
		required: true
    },
    assetid:{
        type:String
    },
    instanceid:{
        type:String
    },
    tradable:{
        type:Boolean,
		required: true
    },
    stickersinfo:[{
        path_img:{
            type: String
        },
        link_img:{
            type: String
        },
        name:{
            type: String
        },
        slot:{
            type: Number
        }
    }],
    quant_stickers:{
        type:Number
    },
    floatvalue:{
        type:String
    },
    paint:{
        type:String
    },
    weapon:{
        type:String
    },
    nametag:{
        type:String
    },
    date_create:{
        type: Date,
		required: true,
		default:new Date()
    }
})

module.exports = mongoose.model('Products', Products)