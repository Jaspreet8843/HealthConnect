//Necessary headers
const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

//create a new room
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

//return room ID
app.get('/:room', (req, res) => {
    res.send({ roomId: req.params.room });
})

//socket connection
io.on('connection', socket => {
    //join room
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId,userId);
        socket.join(roomId)
        //new user connected message
        io.to(roomId).emit('user-connected', userId);
        //disconnect call
        socket.on('disconnect', () => {
            io.to(roomId).emit('user-disconnected', userId);
        })
  })
})

server.listen(3001,()=>{
    console.log("Listening on port 3001")
})