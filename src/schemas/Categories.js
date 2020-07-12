const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Categories = new mongoose.Schema({
	name: {
		type: String,
		required: true
    }
})

module.exports = mongoose.model('Categories', Categories)