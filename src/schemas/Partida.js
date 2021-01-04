const mongoose = require('../configs/database/connectMongo');

const Partida = new mongoose.Schema({
	status: {
        type: String,
        default: 'iniciada'
	},
	nivel:{
		type: mongoose.Schema.Types.ObjectId,
        ref:'Nivel',
        required:true
    },
    ajuda_1: {
        type: Boolean,
        default:false
    },
    ajuda_2:{
        type: Boolean,
        default:false
    },
    ajuda_3:{
        type: Boolean,
        default:false
    },
    quant_acertos:{
        type: Number,
        default:0
    },
    tempo:{
        type: Number,
        default: 10
    },
    ajudas:[{
        name:{
            type: String,
            required: true
        },
        number:{
            type: Number,
            required: true
        }
    }]
})


module.exports = mongoose.model('Partida', Partida)