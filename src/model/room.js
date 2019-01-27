const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  id: Number,
  room: String,
  mode: String,
  owner: String,
  max_num: Number,
  bet: Number,
	created_at: Date,
	updated_at: Date,
});
const RoomModel = mongoose.model('Room', RoomSchema);
module.exports = RoomModel;
