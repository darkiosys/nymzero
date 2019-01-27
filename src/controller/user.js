const sha1 = require('js-sha1')
const UserModel = require("../model/user.js")
const jwt = require('jsonwebtoken')
const secret = Buffer.from('uvuvwevwevweonyetwetweosas', 'hex')
async function register(req, res) {
  console.log("someone registered")
  try {
    let hash = null
    if(req.body.password) {
      hash = sha1(req.body.password)
    }
    let reqdata = {
      id: Math.floor((Math.random() * 99999) + 99999),
      name: req.body.name,
      email: req.body.email,
      password: hash,
      created_at : Date.now(),
      updated_at : Date.now()
    }
    var newUser = new UserModel(reqdata)
    newUser.save()
    let data = {
      id: reqdata.id,
      name: req.body.name,
      email: req.body.email,
    }
    data.token = jwt.sign(data, secret)
    res.status(200).json({
      message: "register success",
      data: data
    })
  } catch (e) {
    console.log(e)
  }

}
async function login(req, res) {
  try {
    console.log(req.body)
    let player = await UserModel.findOne({email: req.body.email, password: sha1(req.body.password)})
    if (player) {
      let data = {
        id: player.id,
        name: player.name,
        email: player.email
      }
      data.token = jwt.sign(data, secret)
      res.status(200).json({
        message: "login success",
        data: data
      })
    } else {
      res.status(400).json({
        message: "invalid email or password"
      })
    }
  } catch (e) {
    console.log(e)
  }
}
module.exports = {
  register,
  login
}
