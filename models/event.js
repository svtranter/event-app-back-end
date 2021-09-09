const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: String,
  location: String,
  precis: String,
  date: String,
  time: String
})

module.exports.Event = mongoose.model('Event', eventSchema)