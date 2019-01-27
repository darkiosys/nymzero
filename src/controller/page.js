const path = require('path')

function table(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'table.html'))
}

function homepage(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'homepage.html'))
}

function leaderboard(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'leaderboard.html'))
}

function lobby(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'lobby.html'))
}

function shop(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'shop.html'))
}

function auth(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'auth.html'))
}

function menu(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'menu.html'))
}

function table1(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'table1.html'))
}

function table2(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'table2.html'))
}

function table3(req, res) {
  res.sendFile(path.join(__dirname, '../../pages', 'table3.html'))
}

module.exports = {
  table,
  homepage,
  leaderboard,
  lobby,
  shop,
  auth,
  menu,
  table1,
  table2,
  table3
}
