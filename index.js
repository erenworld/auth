// const bcrypt = require("bcrypt");

// // const hashPassword = async (pw) => {
// //   const salt = await bcrypt.genSalt(9);
// //   const hash = await bcrypt.hash(pw, salt);
// //   console.log(salt);
// //   console.log(hash);
// // };

// const hashPassword = async (pw) => {
//   const hash = await bcrypt.hash(pw, 12);
//   console.log(hash);
// };

// const login = async (pw, hashedPw) => {
//   const result = await bcrypt.compare(pw, hashedPw);
//   if (result) {
//     console.log("Logged in !");
//   } else {
//     console.log("try again");
//   }
// };

// // hashPassword("monkey");

// login("monkey", "$2b$12$B2bacawCw2xpfGKeTbEwzuL7h6Z8rJHnnYDmWIxrdClpjMmdQYbCq");

const express = require("express");
const app = express();
const User = require("./models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

mongoose.connect("mongodb://localhost:27017/authDemo");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "notagoodsecret" }));

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { password, username } = req.body;
  const user = new User({ username, password });
  await user.save();
  req.session.user_id = user._id;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  if (foundUser) {
    // if successful login we store your id in session
    req.session.user_id = foundUser._id;
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

// logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

// aller directement à /topsecret n'est pas pas possible après login => oui
app.get("/topsecret", requireLogin, (req, res) => {
  res.render("topsecret");
});

app.listen(3000, () => {
  console.log("LIVE  ");
});
