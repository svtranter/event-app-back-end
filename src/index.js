const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const port = process.env.PORT || 3001;

const { Event } = require("../models/event");
const { User } = require("../models/user");
const { v4: uuidv4 } = require("uuid");

mongoose.connect(
  "mongodb+srv://newUser:newUser@cluster0.1lk0n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
);

const app = express();

app.use(helmet());

app.use(bodyParser.json());

app.use(cors());

app.use(morgan("combined"));

app.post("/auth", async (req, res) => {
  const test = new User({ userName: "bob", password: "bob" });
  await test.save();
  console.log(req.body);
  const user = await User.findOne({ userName: req.body.username });
  if (!user) {
    return res.sendStatus(401);
  }
  if (req.body.password !== user.password) {
    return res.sendStatus(403);
  }
  user.token = uuidv4();
  await user.save();
  res.send({ token: user.token });
});

app.use(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const user = await User.findOne({ token: authHeader });
  if (user) {
    next();
  } else {
    res.sendStatus(403);
  }
});

app.get("/", async (req, res) => {
  res.send(await Event.find());
});

app.post("/", async (req, res) => {
  const newEvent = req.body;
  const event = new Event(newEvent);
  await event.save();
  res.send({ message: "New event added." });
});

app.delete("/:id", async (req, res) => {
  await Event.deleteOne({ _id: ObjectId(req.params.id) });
  res.send({ message: "Event removed." });
});

app.put("/:id", async (req, res) => {
  await Event.findOneAndUpdate({ _id: ObjectId(req.params.id) }, req.body);
  res.send({ message: "Event updated." });
});

// starting the server

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("Database connected!");
});
