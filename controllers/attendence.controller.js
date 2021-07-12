const fs = require("fs");
const HttpError = require("../models/http-error");
const Student = require("../models/student");
const cv = require("opencv4nodejs");
const io = require("../socket");
const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData, crea } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const loadingModel = async () => {
  try {
    const modelPath = path.resolve("weights");
    console.log(path.resolve("weights"));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    console.log("Loaded");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Models not loaded correctly, Please try again later",
      500
    );
    return next(error);
  }
};

exports.deleteStudentAttendence = async (req, res, next) => {
  const studentId = req.params.sid;
  let student;
  try {
    student = await Student.findById(studentId);
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!student) {
    return next(
      new HttpError("Could not find student for the provided user id.", 404)
    );
  }
  //   while (student.attendence.subjects > 0) {
  //     student.attendence.subjects.pop();
  //   }
  student.attendence.subjects = [];
  try {
    await student.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete attendence.",
      500
    );
    return next(error);
  }
  res.json({
    message: "Updated Attendence",
    attendence: student.attendence,
  });
};

exports.getAttendenceByStudentId = async (req, res, next) => {
  let student;
  const studentId = req.params.sid;
  try {
    student = await Student.findById(studentId);
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later",
      500
    );
    return next(error);
  }

  if (!student) {
    return next(
      new HttpError("Could not find student for the provided user id.", 404)
    );
  }
  const attendence = student.attendence;

  res.json({ message: "attendence", attendence: attendence });
};

exports.postMarkAttendence = async (req, res, next) => {
  const classId = req.params.classId;
  try {
    const students = await Student.find({ standard: classId });
    console.log(students);
  } catch (err) {}
};

const startCamera = () => {
  const wCap = new cv.VideoCapture(0);

  setInterval(() => {
    const frame = wCap.read();
    const image = cv.imencode(".jpg", frame).toString("base64");

    io.getIO().emit("image", image);
  }, 1000 / 60);
  console.log("Starting Camera");
};
exports.getMarkAttendence = async (req, res, next) => {
  let students;
  try {
    students = await Student.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  startCamera();

  let p = path.join(path.resolve("./", "facedescriptor.json"));
  const str = fs.readFileSync(p);
  var content = JSON.parse(str);

  res
    .status(200)
    .json({
      students: students.map((s) => s.toObject({ getters: true })),
      content,
    });
};
