const rooms = {};
const user = {};

const createRoom = (roomId, player1Id) => {
  rooms[roomId] = [player1Id, ""];
};

const joinRoom = (roomId, player2Id) => {
  rooms[roomId][1] = player2Id;
};

const createUser = (roomId, player1Id) => {
  user[roomId] = [player1Id, ""];
};

const joinUser = (roomId, player2Id) => {
  user[roomId][1] = player2Id;
};

const exitRoom = (roomId, player) => {
  if (player === 1) {
    delete rooms[roomId];
    delete user[roomId];
  } else {
    if (rooms[roomId]) {
      rooms[roomId][1] = "";
      user[roomId][1] = "";
    }
  }
};

module.exports = {
  rooms,
  user,
  createUser,
  joinUser,
  createRoom,
  joinRoom,
  exitRoom,
};
