const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Command = new mongoose.Schema({
	name: {
		type: String,
		required: true
    },
    describ:{
		type: String,
		required: true
    },
    command:{
		type: String,
		required: true
    }
})

module.exports = mongoose.model('Command', Command)