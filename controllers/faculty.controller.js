const Faculty = require("../models/faculty");
const HttpError = require("../models/http-error");

const { validationResult } = require("express-validator");

exports.getFacultyById = async (req, res, next) => {
  const facultyId = req.params.fid;
  let identifiedFaculty;
  try {
    identifiedFaculty = await Faculty.findById(facultyId, "-password");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }

  if (!identifiedFaculty) {
    return next(
      new HttpError("Could not find the faculty by provided id", 404)
    );
  }
  res.json({ faculty: identifiedFaculty.toObject({ getters: true }) });
};

exports.updateFaculty = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  let identifiedFaculty;
  const { name, standard } = req.body;
  const facultyId = req.params.fid;
  try {
    identifiedFaculty = await Faculty.findById(facultyId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  if (req.file) {
    identifiedFaculty.image = req.file.path;
  }
  identifiedFaculty.name = name;
  identifiedFaculty.standard = standard;
  try {
    await identifiedFaculty.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  res.json({
    message: "Ok",
    faculty: identifiedFaculty.toObject({ getters: true }),
  });
};
exports.deleteFaculty = async (req, res, next) => {
  const facultyId = req.params.fid;

  let faculty;
  try {
    faculty = await Faculty.findById(facultyId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete faculty.",
      500
    );
    return next(error);
  }

  try {
    await faculty.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete faculty",
      500
    );
    return next(error);
  }
  res.json({
    message: "Deleted",
    faculty: faculty.toObject({ getters: true }),
  });
};
