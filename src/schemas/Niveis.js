const mongoose = require('../configs/database/connectMongo');

const Nivel = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique:true
	},
	number:{
		type: Number,
		required: true,
		unique:true
	}
})


module.exports = mongoose.model('Nivel', Nivel)