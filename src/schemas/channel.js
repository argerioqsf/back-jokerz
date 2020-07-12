const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const Channel = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	linkTwitch:{
		type: String,
		required: true
	}
})


module.exports = mongoose.model('Channel', Channel)