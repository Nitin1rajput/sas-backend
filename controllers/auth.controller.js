const Student = require("../models/student");
const Faculty = require("../models/faculty");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

const jwt = require("jsonwebtoken");
exports.studentLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let existingStudent;
  const { email, password } = req.body;
  try {
    existingStudent = await Student.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!existingStudent || existingStudent.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingStudent.id, email: existingStudent.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Logging In Failed", 500);
    return next(err);
  }

  res.json({ message: "Logged In", token, userId: existingStudent.id });
};
exports.facultyLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let existingFaculty;
  const { email, password } = req.body;
  try {
    existingFaculty = await Faculty.findOne({ email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }
  if (!existingFaculty || existingFaculty.password !== password) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      401
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingFaculty.id, email: existingFaculty.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Logging In Failed", 500);
    return next(err);
  }
  res.json({
    message: "Logged In",
    token,
    userId: existingFaculty.id,
    class: existingFaculty.standard,
  });
};

exports.facultySignup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password, standard, studentId } = req.body;

  let existingFaculty;
  try {
    existingFaculty = await Faculty.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingFaculty) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  const createdFaculty = new Faculty({
    name,
    email,
    image: req.file.path,
    password,
    standard,
    studentId: "f1",
  });

  try {
    await createdFaculty.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ faculty: createdFaculty.toObject({ getters: true }) });
};
