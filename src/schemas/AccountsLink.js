const mongoose = require('../configs/database/connectMongo');
// const passportLocalMongoose = require('passport-local-mongoose')

const AccountsLink = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique:true
	},
    icon: {
		type: String
	},
    color: {
		type: String,
		default: '#fff'
	},
	statusPubSub:{
		type: Boolean,
		default: false
	}
})
//twitch
//streamelements


module.exports = mongoose.model('AccountsLink', AccountsLink)