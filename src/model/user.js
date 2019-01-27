const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  id: Number,
	name: String,
  email: String,
  password: String,
  coin: {type: Number, default: 0},
	login_date: Date,
	created_at: Date,
	updated_at: Date,
});
const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
