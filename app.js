const app = require('express')()
const _ = require('lodash')
const http = require('http').Server(app)
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const io = require('socket.io')(http, {'pingInterval': 1, 'pingTimeout': 5000})
const jwt = require('jsonwebtoken')

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(require('express').static(require('path').join(__dirname, 'public')))
mongoose.connect('mongodb://localhost:27017/nymzero', { useNewUrlParser: true })

const UserController = require("./src/controller/user.js")
const PageController = require("./src/controller/page.js")
const RoomController = require("./src/controller/room.js")

const UserModel = require("./src/model/user.js")
const RoomModel = require("./src/model/room.js")

let games = require("./src/model/game.js")
let helper = require("./src/lib/helper.js")
const secret = Buffer.from('uvuvwevwevweonyetwetweosas', 'hex')

app.get('/', PageController.auth)
app.get('/table', PageController.table)
app.get('/lobby', PageController.lobby)
app.get('/leaderboard', PageController.leaderboard)
app.get('/auth', PageController.auth)
app.get('/menu', PageController.menu)

app.post('/api/register', UserController.register)
app.post('/api/login', UserController.login)
app.get('/api/room', RoomController.list)
app.get('/api/room/join', RoomController.join)

function coreEngine(req, res) {
  let winner = null
  if (player1.value > player2.value) {
    winner = player1.name
  }
  if (player1.value < player2.value) {
    winner = player2.name
  }
  if (player1.value == player2.value) {
    winner = "draw"
  }
  res.status(200).json({
    "message": "winner is: "+winner,
  })
}

io.on('connection', function(socket){
  socket.on('rejoin', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
        if(err) {
          res.send({"message": "error", "data": err})
        } else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (gameIndex >= 0) {
            socket.join(games[gameIndex].room)
            // let player = _.find({})
            io.to(games[gameIndex].room).emit('message', games[gameIndex])
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('reset', function(data) {
    let i = _.findIndex(games, {room: data})
    games[i].num = 0
    games[i].status = 'start'
    io.to(data.room).emit('message', games[i])
  })
  socket.on('chat', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				console.log(err)
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          let result = {
            name: decoded.name,
            message: data.message
          }
          io.to(games[gameIndex].room).emit('chat', result)
          io.to(games[gameIndex].room).emit('sound', 'chat')
        }
      })
    } catch(e) {
      console.log(e)
    }
  })
  socket.on('room', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				res.send({"message": "error", "data": err})
  			} else {
          socket.join(data.room)
          let game = {
            id: data.id,
            room: data.room,
            mode: 'party', // party or solo
            owner: decoded.name,
            bet: parseInt(data.bet),
            deck: [],
            num: 0,
            next_turn: null,
            max_num: parseInt(data.max_num),
            status: "idle",
            players: [],
            waitinglist: []
          }
          let store = {
            id: game.id,
            room: game.room,
            mode: game.mode,
            owner: decoded.name,
            max_num: game.max_num,
            bet: game.bet,
          	created_at: Date.now(),
          	updated_at: Date.now(),
          }
          let storeData = new RoomModel(store).save()
          games.push(game)
          io.to(data.room).emit('message', game)
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('join', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				res.send({"message": "error", "data": err})
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          socket.join(games[gameIndex].room)
          io.to(games[gameIndex].room).emit('message', games[gameIndex])
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('sit', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				console.log('token not found')
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (games[gameIndex].status == "idle") {
            let player = {
              id: decoded.id,
              name: decoded.name,
              chair: data.chair,
              status: {
                turn: 0,
                lose: 0,
                exit: 0,
              },
              cards: []
            }
            games[gameIndex].players.push(player)
            io.to(games[gameIndex].room).emit('message', games[gameIndex])
            io.to(games[gameIndex].room).emit('sound', 'sit')
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('start', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				console.log('token not found')
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (games[gameIndex].status == "idle" && games[gameIndex].players.length > 1) {
            games[gameIndex].status = "turn"
            games[gameIndex].deck = helper.shuffle(helper.deck())
            for (var i = 0; i < games[gameIndex].players.length; i++) {
              if (games[gameIndex].players[i].chair == 1) {
                games[gameIndex].players[i].status.turn = 1
              }
              for (var j = 0; j < 3; j++) {
                games[gameIndex].players[i].cards.push(games[gameIndex].deck[0])
                games[gameIndex].deck.splice(0, 1)
              }
            }
            io.to(games[gameIndex].room).emit('message', games[gameIndex])
            io.to(games[gameIndex].room).emit('sound', 'card')
            io.to(games[gameIndex].room).emit('sound', 'start')
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('turn', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				console.log('token not found')
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (games[gameIndex].status == "turn") {
            let player = _.find(games[gameIndex].players, {id: decoded.id})
            if (games[gameIndex].next_turn != null) {
              games[gameIndex].next_turn = null
            }
            if (player.status.turn == 1) {
              let playerIndex = _.findIndex(games[gameIndex].players, {id: decoded.id})
              let cardIndex = _.findIndex(games[gameIndex].players[playerIndex].cards, {id: data.card})
              games[gameIndex].status = 'turn'
              games[gameIndex].num += games[gameIndex].players[playerIndex].cards[cardIndex].value
              games[gameIndex].players[playerIndex].cards.splice(cardIndex, 1)
              games[gameIndex].players[playerIndex].status.turn = 0
              let nextIndex = null
              for (var i = playerIndex+1; i <= 4; i++) {
                console.log(i)
                let nextChair = games[gameIndex].players[playerIndex].chair+i
                console.log(nextChair)
                nextIndex = _.findIndex(games[gameIndex].players, {chair: nextChair})
                if (nextIndex != -1) {
                  console.log("got the next banker ?")
                  break
                }
              }
              console.log("bexxxt: "+nextIndex)
              if (nextIndex < 0) {
                for (var j = 0; j < 5; j++) {
                  nextIndex = _.findIndex(games[gameIndex].players, {chair: j})
                  if (nextIndex >= 0) {
                    console.log(nextIndex)
                    break
                  }
                }
              }
              console.log("bext: "+nextIndex)
              games[gameIndex].players[nextIndex].status.turn = 1
              if (games[gameIndex].num > games[gameIndex].max_num) {
                games[gameIndex].status = "end"
                games[gameIndex].players[playerIndex].status.lose = 1
                console.log("someone lose with over number")
              }
              if (games[gameIndex].status != "end") {
                let cardEmpty = _.findIndex(games[gameIndex].players, function(o){ return o.cards.length == 0})
                if (cardEmpty >= 0) {
                  console.log("someone lose with card is empty")
                  games[gameIndex].status = "end"
                  for (var i = 0; i < games[gameIndex].players.length; i++) {
                    games[gameIndex].players[i].status.lose = 1
                    console.log(games[gameIndex].players[i].name)
                  }
                  games[gameIndex].players[cardEmpty].status.lose = 0
                  console.log(games[gameIndex].players[cardEmpty].name)
                }
              }
              io.to(games[gameIndex].room).emit('message', games[gameIndex])
              io.to(games[gameIndex].room).emit('sound', 'card')
            }
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('newround', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
  			if(err) {
  				res.send({"message": "error", "data": err})
  			} else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (gameIndex >= 0) {
            let playerIndex = _.findIndex(games[gameIndex].players, {id: decoded.id})
            if (playerIndex >= 0) {
              games[gameIndex].players[playerIndex].status.turn = 0
              let allCommit = _.find(games[gameIndex].players, {status : {turn: 1}})
              for (var i = 0; i < games[gameIndex].players.length; i++) {
                if (games[gameIndex].players[i].status.exit == 1) {
                  games[gameIndex].players.splice(playerIndex, 1)
                }
              }
              if (!allCommit) {
                games[gameIndex].status = "turn"
                games[gameIndex].num = 0
                games[gameIndex].deck = helper.shuffle(helper.deck())
                if (games[gameIndex].next_turn == null) {
                  games[gameIndex].next_turn = _.findIndex(games[gameIndex].players, {status: {lose: 1}})
                }
                for (var i = 0; i < games[gameIndex].players.length; i++) {
                  games[gameIndex].players[i].status.turn = 0
                  games[gameIndex].players[i].status.lose = 0
                  games[gameIndex].players[i].cards = []
                  for (var j = 0; j < 3; j++) {
                    games[gameIndex].players[i].cards.push(games[gameIndex].deck[0])
                    games[gameIndex].deck.splice(0, 1)
                  }
                }
                games[gameIndex].players[games[gameIndex].next_turn].status.turn = 1
                io.to(games[gameIndex].room).emit('message', games[gameIndex])
                io.to(games[gameIndex].room).emit('sound', 'result')
              }
            }
          }
        }
      })
    } catch(e){
      console.log(e)
    }
  })
  socket.on('exit', function(data) {
    try {
      jwt.verify(data.token, secret, function(err, decoded) {
        if(err) {
          res.send({"message": "error", "data": err})
        } else {
          let gameIndex = _.findIndex(games, {id: data.id})
          if (gameIndex >= 0) {
            if (games[gameIndex].status != 'idle') {
              let playerIndex = _.findIndex(games[gameIndex].players, {id: decoded.id})
              games[gameIndex].players[playerIndex].status.exit = 1
            } else {
                games[gameIndex].players.splice(playerIndex, 1)
            }
            socket.leave(games[gameIndex].room)
            io.to(games[gameIndex].room).emit('message', games[gameIndex])
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
  socket.on('disconnect', function(){
    console.log("someone is disconnected")
  })
})

http.listen(3000, function () {
  console.log('Apps running on port 3000')
})
