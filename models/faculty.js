const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facultySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  standard: { type: Number, required: true },
  studentId: { type: String, required: true },
});

module.exports = mongoose.model("faculty", facultySchema);
