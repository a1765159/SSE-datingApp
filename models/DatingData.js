const mongoose = require('mongoose');

// const DatingProfileSchema = new mongoose.Schema({
const DatingDataSchema = new mongoose.Schema({
  nickName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  covidStatus: {
    type: String,
    required: true
  },
  hobbies: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const DatingData= mongoose.model('DatingData', DatingDataSchema);
module.exports = DatingData;