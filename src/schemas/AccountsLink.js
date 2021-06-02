const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const AccountsLink = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique:true
	},
    icon: {
		type: String,
		required: true
	},
    color: {
		type: String,
		required: true
	},
})


module.exports = mongoose.model('AccountsLink', AccountsLink)