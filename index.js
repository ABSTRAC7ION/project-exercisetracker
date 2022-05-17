const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { nanoid } = require("nanoid");
const { Db } = require("mongodb");
const url = require("url");

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
const user = new Schema({
  username: String,
  _id: { type: String },
});
const USER = mongoose.model("USER", user);

const logs = new Schema({
  username: String,
  count: Number,
  _id: { type: String },
  log: [
    {
      description: String,
      duration: Number,
      date: String,
    },
  ],
});
const LOG = mongoose.model("LOG", logs);

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
  var date = new Date(req.body.date).toDateString();
  //checks if no date is entered enters current date
  if (date == "Invalid Date") {
    date = new Date().toDateString();
  }
  //looks for user in USER
  let logs = await USER.findOne({
    _id: _id,
  });
  //looks to if user has already registered exersices
  let dataStored = await LOG.findOne({
    _id: _id,
  });
  if (!logs) {
    res.json({
      err: "No User found with this id please make sure the id is correct or create a new account",
    });
  } else if (dataStored) {
    // if data already exists in logs add an array of the workouts
    dataStored.log.push({
      description: description,
      duration: duration,
      date: date,
    });
    //increments count with 1 everytime execersie is added
    dataStored.count = dataStored.count + 1;
    //saves changes
    dataStored.save();
    //response
    res.json({
      _id: logs._id,
      username: logs.username,
      description: description,
      duration: duration,
      date: date,
    });
  } else {
    logs = new LOG({
      username: logs.username,
      count: 1,
      _id: _id,
      log: [
        {
          description: description,
          duration: duration,
          date: date,
        },
      ],
    });
    await logs.save();
    res.json({
      _id: logs._id,
      username: logs.username,
      description: description,
      duration: duration,
      date: date,
    });
  }
});

app.get("/api/users/:_id?/logs", async function (req, res) {
  var _id = req.body["_id"] || req.params._id;
  var fromDate = req.query.from;
  var toDate = req.query.to;
  var limit = req.query.limit;

  console.log(fromDate, toDate, limit);

  let logs = await LOG.findOne({
    _id: _id,
  });
  if (!logs) {
    res.json({
      err: "no user with this id has been found please check that you entered your id correctly or create a new one",
    });
  } else {
    res.json({ logs });
  }
});

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
