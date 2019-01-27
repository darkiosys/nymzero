const sha1 = require('js-sha1')
const UserModel = require("../model/user.js")
const RoomModel = require("../model/room.js")
const jwt = require('jsonwebtoken')
const secret = Buffer.from('uvuvwevwevweonyetwetweosas', 'hex')
async function list(req, res) {
  let rooms = await RoomModel.find()
  res.status(200).json({
    data: rooms
  })
}

async function join(req, res) {
  let room = await RoomModel.findOne({id: req.query.id})
  if (room) {
    res.status(200).json({
      data: room
    })
  } else {
    res.status(200).json({
      message: "room not found."
    })
  }
}
module.exports = {
  list,
  join
}
