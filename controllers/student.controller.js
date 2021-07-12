const faceapi = require("face-api.js");
const Student = require("../models/student");
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const HttpError = require("../models/http-error");
const cv = require("opencv4nodejs");
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

const cropImages = (student) => {
  let imagesPath = [];
  let images = [];

  student.images.forEach((path) => {
    imagesPath.push(path);
  });
  // console.log(imagesPath);
  imagesPath.forEach((i) => {
    img = cv.imread(i);
    images.push(img);
  });
  console.log(path.resolve("./", "datasets", "images"));

  function saveImage(img, count) {
    cv.imwrite(
      path.join(path.resolve("./", "datasets", student.id)) +
        "_" +
        count +
        ".jpg",
      img
    );
  }
  let count = 1;
  images.forEach((image) => {
    const grayImg = image.bgrToGray();
    const faces = classifier.detectMultiScale(grayImg).objects;

    let x, y, w, h;
    let region;
    for (face of faces) {
      x = face.x;
      y = face.y;
      w = face.width;
      h = face.height;
      region = image.getRegion(new cv.Rect(x, y, w, h));
    }
    // console.log(region);
    if (region) {
      saveImage(region, count++);
    }
  });
};

exports.getAllStudents = async (req, res, next) => {
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

  res.json({
    message: "Ok",
    students: students.map((s) => s.toObject({ getters: true })),
  });
};
exports.getStudentById = async (req, res, next) => {
  const studentId = req.params.sid;
  let student;
  try {
    student = await Student.findById(studentId, "-password");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!student) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }
  res.json({
    message: "Founded",
    student: student.toObject({ getters: true }),
  });
};

exports.createStudent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let images = [];
  req.files.forEach((f) => {
    images.push(f.path);
  });
  const { name, standard, password, email } = req.body;
  let existingStudent;
  try {
    existingStudent = await Student.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Creating student failed, please try again.",
      500
    );
    return next(error);
  }
  if (existingStudent) {
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        fs.unlink(req.files[i].path, (err) => {
          console.log(err);
        });
      }
    }
    const error = new HttpError("Student already exist", 401);

    return next(error);
  }
  const createdStudent = new Student({
    name,
    password,
    standard,
    email,
    image: req.files[0].path,
    images,
  });
  try {
    await createdStudent.save();
  } catch (err) {
    const error = new HttpError(
      "Creating student failed, please try again.",
      500
    );
    return next(error);
  }

  cropImages(createdStudent);
  res.json({
    message: "Created",
    student: createdStudent.toObject({ getters: true }),
  });
};
exports.updateStudent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, standard, images } = req.body;

  const studentId = req.params.sid;

  let updatedStudent;
  try {
    updatedStudent = await Student.findById(studentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  updatedStudent.name = name;
  updatedStudent.standard = standard;
  updatedStudent.images = images;
  try {
    await updatedStudent.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  res.json({
    message: "Updated",
    student: updatedStudent.toObject({ getters: true }),
  });
};
exports.deleteStudent = async (req, res, next) => {
  const studentId = req.params.sid;
  let deletedStudent;
  try {
    deletedStudent = await Student.findById(studentId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  let imagesPath = [];

  deletedStudent.images.forEach((path) => {
    imagesPath.push(path);
  });
  try {
    await deletedStudent.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  imagesPath.forEach((p) => {
    fs.unlink(p, (err) => {
      console.log(err);
    });
  });
  res.json({ message: "Deleted" });
};
