const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  images: { type: Array, required: true },
  standard: { type: Number, required: true },
  attendence: {
    subjects: [
      {
        subName: { type: String, required: true },
        present: { type: Number, required: true },
      },
    ],
  },
});

module.exports = mongoose.model("student", studentSchema);
