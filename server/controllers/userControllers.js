const model = require("../model/model");
const userData = model.user_id;
const userHistory = model.user_history;

exports.index = function (req, res) {
  res.render("index");
};

exports.games = function (req, res) {
  res.render("games");
};

exports.loginPage = (req, res) => {
  res.render("login");
};

exports.roomPage = (req, res) => {
  res.render("room");
};

exports.registerPage = (req, res) => {
  res.render("register");
};

exports.userprofile = async (req, res) => {
  const id = req.params.id;

  userData
    .find({ _id: id })
    .then((data) => {
      if (!data) {
        res.status(404).send({ message: "Not found user with id " + id });
      } else {
        userHistory
          .find({ user_id: id })
          .then((history) => {
            let date = new Date(data[0].birth);
            let year = date.getFullYear();
            let month = ("0" + (date.getMonth() + 1)).slice(-2);
            let day = ("0" + date.getDate()).slice(-2);
            let tgl = `${day}-${month}-${year}`;
            if (!history) {
              res.status(404).send({ message: "Not found user with id " + id });
              res.render("userecord", {
                data: data,
                history: {
                  user: "no record",
                  win: 0,
                  draw: 0,
                  lose: 0,
                  scheme: "no Record",
                  oponent: "no record",
                  timestamp: null,
                },
                tgl: tgl,
              });
            } else {
              res.render("userecord", {
                data: data,
                history: history,
                tgl: tgl,
              });
            }
          })
          .catch((err) => {
            res
              .status(500)
              .send({ message: "Erro retrieving user with id " + id });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Erro retrieving user with id " + id });
    });
};

exports.admindata = async (req, res) => {
  userData
    .find({ status: "active" })
    .then((data) => {
      if (!data) {
        res.status(404).send({ resultData: "failed to get data" });
      } else {
        // res.render("admin", { resultData: data }); // rows, removedUser
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not get data 500",
      });
    });
};

exports.admin = async (req, res) => {
  userData
    .find({ status: "active" })
    .then((data) => {
      if (!data) {
        res.status(404).send({ resultData: "failed to get data" });
      } else {
        // res.render("admin", { resultData: data }); // rows, removedUser
        res.render("admin", { resultData: data });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not get data 500",
      });
    });
};

exports.loginAuth = async (req, res) => {
  let requestData = req.body;
  let User = requestData.username;
  let Pass = requestData.password;

  userData
    .find({ user: User, pass: Pass })
    .then((data) => {
      if (!data[0]) {
        console.log(data[0]);
        res.status(404).send({
          message: "failed to login, wrong username/password",
          fase: false,
        });
      } else {
        console.log(data[0]);
        res.send({
          message: "sucessfull to login",
          resultData: data,
          statusCode: 200,
          fase: true,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not login User with this username/password",
      });
    });
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  userData
    .findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .send({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.send({
          message: "User was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

//________________________________________________________________________________________________
exports.register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    username,
    pass,
    birth,
    phone,
    address,
    gender,
  } = req.body;

  var date = new Date(birth); // some mock date
  var birthMilis = date.getTime();

  if (req.body != null) {
    const user = new userData({
      user: username,
      email: email,
      pass: pass,
      first_name: first_name,
      last_name: last_name,
      phone: phone,
      birth: birthMilis,
      gender: gender,
      address: address,
      token: maketoken(16),
      status: "active",
    });

    user
      .save(user)
      .then((data) => {
        res.send({ alert: "User register successfully." });
      })
      .catch((err) =>
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating a create operation",
        })
      );
  } else {
    res.status(400);
  }

  function maketoken(length) {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
};

exports.find = async (req, res) => {
  if (req.query.id) {
    const id = req.query.id;

    userData
      .findById(id)
      .then((data) => {
        if (!data) {
          res.status(404).send({ message: "Not found user with id " + id });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Erro retrieving user with id " + id });
      });
  } else {
    userData
      .find()
      .then((user) => {
        res.send(user);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Error Occurred while retriving user information",
        });
      });
  }
};
//________________________________________________________________________________________________

//Edit user profile
exports.edit = async (req, res) => {
  const id = req.params.id;

  userData
    .findById(id)
    .then((data) => {
      let date = new Date(data.birth);
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let tgl = `${year}-${month}-${day}`;

      if (!data) {
        res.status(404).send({ message: "Not found user with id " + id });
      } else {
        res.render("edit-user", { data, tgl });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving user with id " + id });
    });
};
exports.getUserById = async (req, res) => {
  const id = req.params.id;

  userData
    .findById(id)
    .then((data) => {
      let date = new Date(data.birth);
      let year = date.getFullYear();
      let month = ("0" + (date.getMonth() + 1)).slice(-2);
      let day = ("0" + date.getDate()).slice(-2);
      let tgl = `${year}-${month}-${day}`;

      if (!data) {
        res.status(404).send({
          data: `Error retrieving user with id ${id}`,
          tgl: `Error retrieving user with id ${id}`,
        });
      } else {
        res.send({ data, tgl });
      }
    })
    .catch((err) => {
      res.status(500).send({
        data: `Error retrieving user with id ${id}`,
        tgl: `Error retrieving user with id ${id}`,
      });
    });
};

//Update user profile
exports.update = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    username,
    pass,
    birth,
    phone,
    address,
    gender,
  } = req.body;

  var date = new Date(birth); // some mock date
  var birthMilis = date.getTime();
  const id = req.params.id;
  const user = {
    id: id,
    user: username,
    email: email,
    pass: pass,
    first_name: first_name,
    last_name: last_name,
    phone: phone,
    birth: birthMilis,
    gender: gender,
    address: address,
  };

  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  } else {
    userData
      .findByIdAndUpdate(id, user, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          res.status(404).send({
            message: `Cannot Update user with ${id}. Maybe user not found!`,
          });
        } else {
          res.send(data);
        }
      })
      .catch((err) => {
        res.status(500).send({ message: "Error Update user information" });
      });
  }
};

exports.gamesResult = async (req, res) => {
  const { user, win, draw, lose, scheme, oponent, timestamp } = req.body;

  if (req.body != null) {
    const userH = new userHistory({
      user_id: req.params.id,
      user: user,
      win: win,
      draw: draw,
      lose: lose,
      scheme: scheme,
      oponent: oponent,
      timestamp: timestamp,
    });

    userH
      .save(userH)
      .then((data) => {
        res.send({ alert: "User register successfully." });
      })
      .catch((err) =>
        res.status(500).send({
          message:
            err.message ||
            "Some error occurred while creating a create operation",
        })
      );
  } else {
    res.status(400);
  }
};
