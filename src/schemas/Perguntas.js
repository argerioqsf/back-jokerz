const mongoose = require('../configs/database/connectMongo');

const Pergunta = new mongoose.Schema({
	titulo: {
		type: String,
        required: true,
        unique:true
	},
	alternativas:[{
        name:{
            type: String,
            required: true
        },
        number:{
            type: Number,
            required: true
        }
    }],
	nivel:{
		type: mongoose.Schema.Types.ObjectId,
        ref:'Nivel',
        required: true
    },
    categoria:{
        type: String,
        default: 'Geral'
    },
    resposta:{
        type: Number,
        required: true
    },
    ativa:{
        type:Boolean,
        default:true
    }
})


module.exports = mongoose.model('Pergunta', Pergunta)