const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Permissions = new mongoose.Schema({
	name: {
		type: String,
		required: true
    },
	indice: {
		type: Number,
		required: true
    }
})

module.exports = mongoose.model('Permissions', Permissions)