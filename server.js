const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: false,
}

var users = []

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/", (req, res) => {
  //res.redirect(`/${uuidv4()}`);
  res.render("users", { });
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});


io.on("connection", (socket) => {
  socket.on("ready", (name) => {
    console.log('ready')
    users.push({name:name})
  });
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
  socket.on("get-users", (roomId, userId, userName) => {
    socket.emit('users',{users:users});
  });
  socket.on('disconnect', function () {
      console.log('disconnected');
  });
});

server.listen(process.env.PORT || 3030);
