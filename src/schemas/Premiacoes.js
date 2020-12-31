const mongoose = require('../configs/database/connectMongo');

const Premiacao = new mongoose.Schema({
	titulo: {
		type: String,
		required: true
	},
	nivel:{
		type: mongoose.Schema.Types.ObjectId,
		ref:'Nivel'
    },
    valor:{
        type: Number,
        required: true
    },
    image:{
        type:String,
        required:true
    },
    indice:{
        type: Number,
        required: true,
        unique:true
    }
})


module.exports = mongoose.model('Premiacao', Premiacao)