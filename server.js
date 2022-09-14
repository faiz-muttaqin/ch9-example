const express = require("express");
const app = express();
const morgan = require("morgan");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const server = http.createServer(app);
const swaggerJSON = require("./tg-api-docs.json");
const swaggerUI = require("swagger-ui-express");
// const path = require("path");

app.use("/my-api", swaggerUI.serve, swaggerUI.setup(swaggerJSON));

const io = socketio(server);

const port = 7000;

const connectDB = require("./server/database/connection");
connectDB(); // MongoDB Connection

app.use(cors());
//middleWare
app.use(morgan("dev"));
//middleware untuk akses get asset folder public di server
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, "/", "/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "/", "/build", "index.html"));
// });

//middleware untuk convert dari fe ke be
app.use(express.json()); //terima dataa json
app.use(express.urlencoded({ extended: true }));

//middleware untuk tampilan
app.set("view engine", "ejs");

//Mengggunakan Socket.IO
const {
  userConnected,
  connectedUsers,
  initializeChoices,
  moves,
  makeMove,
  choices,
} = require("./util/users");
const {
  createRoom,
  joinRoom,
  exitRoom,
  rooms,
  user,
  createUser,
  joinUser,
} = require("./util/rooms");

io.on("connection", (socket) => {
  socket.on("create-room", ([roomId, userId]) => {
    if (rooms[roomId]) {
      // bila roomId(user input) sudah ada maka tidak create
      const error = "This room already exists";
      socket.emit("display-error", error);
    } else {
      // create room
      // userConnected(UserId; // menyimpan id client pada connectedUsers:true
      userConnected(socket.client.id); // menyimpan id client pada connectedUsers:true
      createRoom(roomId, socket.client.id); // menyimpan roomId(inputan P1), id_client pada rooms = {roomId : [id_client,""]}
      createUser(roomId, userId);
      socket.emit("room-created", roomId); // feedback ke user(yg input roomId) to run funct "room-created" dan kirim data roomId
      let userRoom = user[roomId];
      socket.emit("player-1-connected", userRoom); // feedback ke user(yg input roomId) to run funct "player-1-connected"
      socket.join(roomId);
      console.log("ini room :", rooms);
      console.log(user);
    }
  });

  socket.on("join-room", ([roomId, userId]) => {
    if (!rooms[roomId]) {
      //cek jika roomId yang dikirim tidak ada
      const error = "This room doen't exist";
      socket.emit("display-error", error);
    } else {
      // jika roomId ada
      userConnected(socket.client.id); // menyimpan id client pada connectedUsers:true
      joinRoom(roomId, socket.client.id); // menyimpan roomId(inputan P2), pada rooms = {roomId : [id_P1, id_client]}
      joinUser(roomId, userId);
      socket.join(roomId);
      socket.emit("room-joined", roomId); // feedback ke user(yg input roomId) to run funct "room-joined" dan kirim data roomId
      let userRoom = user[roomId];
      socket.emit("player-2-connected", userRoom); // feedback ke user(yg input roomId) to run funct "player-2-connected"
      socket.broadcast.to(roomId).emit("player-2-connected", userRoom); //broadcast pada spesifik "roomId" to run funct "player-2-connected"
      initializeChoices(roomId); // membuat skema game dengan roomId ["", ""] yg disimpan dalam choices
      console.log(rooms);
      console.log(user);
    }
  });

  socket.on("join-random", (userId) => {
    let roomId = "";

    //looping mencari rooms id dengan id "" (kosong)
    for (let id in rooms) {
      if (rooms[id][1] === "") {
        roomId = id; //bila sudah ketemu looping di stop dan id diset ke roomId
        break;
      }
    }

    if (roomId === "") {
      //bila room id tidak di temukan
      const error = "All rooms are full or none exists";
      socket.emit("display-error", error); // maka ditampilkan error
    } else {
      // bila room id ditemukan maka :
      //userId masukkan ke socket.client.id
      userConnected(socket.client.id); // menyimpan id client pada connectedUsers:true
      joinRoom(roomId, socket.client.id); // menyimpan roomId(Hasil pencarian room), pada rooms = {roomId : [id_P1, id_client_now]}
      joinUser(roomId, userId);
      socket.join(roomId);
      let userRoom = user[roomId];
      socket.emit("room-joined", roomId); // feedback ke user(yg klik random room) to run funct "room-joined" dan kirim data roomId yg digunakan
      socket.emit("player-2-connected", userRoom); // feedback ke user(yg input roomId) to run funct "player-2-connected"
      socket.broadcast.to(roomId).emit("player-2-connected", userRoom); //broadcast pada spesifik "roomId" to run funct "player-2-connected"
      initializeChoices(roomId); // membuat skema game dengan roomId ["", ""] yg disimpan dalam choices
    }
  });

  socket.on("make-move", ({ playerId, myChoice, roomId }) => {
    makeMove(roomId, playerId, myChoice);

    if (choices[roomId][0] !== "" && choices[roomId][1] !== "") {
      let playerOneChoice = choices[roomId][0];
      let playerTwoChoice = choices[roomId][1];

      if (playerOneChoice === playerTwoChoice) {
        let message =
          "Both of you chose " + playerOneChoice + " . So it's draw";
        io.to(roomId).emit("draw", message);
      } else if (moves[playerOneChoice] === playerTwoChoice) {
        let enemyChoice = "";

        if (playerId === 1) {
          enemyChoice = playerTwoChoice;
        } else {
          enemyChoice = playerOneChoice;
        }

        io.to(roomId).emit("player-1-wins", { myChoice, enemyChoice });
      } else {
        let enemyChoice = "";

        if (playerId === 1) {
          enemyChoice = playerTwoChoice;
        } else {
          enemyChoice = playerOneChoice;
        }

        io.to(roomId).emit("player-2-wins", { myChoice, enemyChoice });
      }

      choices[roomId] = ["", ""];
    }
  });

  socket.on("disconnect", () => {
    if (connectedUsers[socket.client.id]) {
      let player;
      let roomId;

      for (let id in rooms) {
        if (
          rooms[id][0] === socket.client.id ||
          rooms[id][1] === socket.client.id
        ) {
          if (rooms[id][0] === socket.client.id) {
            player = 1;
          } else {
            player = 2;
          }

          roomId = id;
          break;
        }
      }

      exitRoom(roomId, player);

      if (player === 1) {
        io.to(roomId).emit("player-1-disconnected");
      } else {
        io.to(roomId).emit("player-2-disconnected");
      }
    }
  });
});

//untuk menjalankan server
server.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});

//impor router dari routes
const Routes = require("./server/routes/routes");
app.use(Routes);
