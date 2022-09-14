const express = require("express");
const routes = express();
const userControllers = require("../controllers/userControllers");

//page render
routes.get("/", userControllers.index);
routes.get("/games", userControllers.games);
routes.get("/login", userControllers.loginPage);
routes.get("/room", userControllers.roomPage);
routes.get("/register", userControllers.registerPage);

routes.get("/users", userControllers.admin);
routes.get("/users/:id", userControllers.edit);

//API
routes.post("/api/users", userControllers.register);
routes.get("/api/users", userControllers.admindata);
routes.get("/api/users/:id", userControllers.getUserById);
routes.put("/api/users/:id", userControllers.update);
routes.delete("/api/users/:id", userControllers.delete);

routes.get("/userprofile/:id", userControllers.userprofile);
routes.post("/login", userControllers.loginAuth);
routes.post("/games/:id", userControllers.gamesResult);

module.exports = routes;
