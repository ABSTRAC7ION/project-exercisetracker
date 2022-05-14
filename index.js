const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { nanoid } = require("nanoid");

// parse application
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//conncect to database
const uri =
  "mongodb+srv://new-exer:TXSZ7pSL1qEycY2y@cluster0.qqxjj.mongodb.net/exercise-tracker?retryWrites=true&w=majority";
mongoose.connect(
  uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    app.listen(3000);
  }
);
//checks if database is connected
const connection = mongoose.connection;
connection.on("err", console.error.bind(console, "conncection error"));
connection.once("open", () => {
  console.log("connected");
});

app.use(cors());

app.use(express.static("public"));

//creating schemas
const exercises = new Schema({
  username: { type: String },
  description: { type: String },
  duration: { type: Number },
  date: { type: String },
  _id: { type: String, unique: false },
});
const EXERCISE = mongoose.model("EXERCISE", exercises);

const user = new Schema({
  username: String,
  _id: { type: String, unique: false },
});
const USER = mongoose.model("USER", user);

const log = new Schema({
  username: String,
  count: Number,
  _id: String,
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const LOG = mongoose.model("LOG", log);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//creates new users and stores them in database
app.post("/api/users", async function (req, res) {
  var username = req.body.username;
  var _id = nanoid();
  let users = new USER({
    username: username,
    _id: _id,
  });
  await users.save();
  res.json({
    username: users.username,
    _id: users._id,
  });
});

//adds exercises to database
app.post("/api/users/:_id?/exercises", async function (req, res) {
  var _id = req.body._id;
  var description = req.body.description;
  var duration = req.body.duration;
  var date = new Date(req.body.date);
  let exercises = await USER.findOne({
    _id: _id,
  });
  if (!exercises) {
    res.json({
      err: "No User found with this id please make sure the id is correct or create a new account",
    });
  } else {
    var username = USER.find({ username: username });
    exercises = new EXERCISE(
      {
        _id: _id,
        username: username,
        description: description,
        duration: duration,
        date: date,
      },
      { unique: false }
    );
    await exercises.save();
    res.json({
      _id: exercises._id,
      description: exercises.description,
      duration: exercises.duration,
      date: exercises.date,
    });
  }
});

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});



