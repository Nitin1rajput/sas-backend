const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const HttpError = require("../models/http-error");
const Student = require("../models/student");
const { Canvas, Image, ImageData, crea } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionNet = faceapi.SsdMobilenetv1Options();

async function loadLabedImages() {
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
  let studentLabel = [];
  students.forEach((s) => {
    studentLabel.push(s._id.toString());
  });
  console.log(studentLabel);
  return Promise.all(
    studentLabel.map(async (label) => {
      console.log(label);
      const descriptions = [];
      for (let i = 1; i <= 10; i++) {
        let p =
          path.join(path.resolve("./", "datasets", label)) + "_" + i + ".jpg";
        if (fs.existsSync(p)) {
          const img = await canvas.loadImage(
            path.join(path.resolve("./", "datasets", label)) + "_" + i + ".jpg"
          );
          const detections = await faceapi
            .detectSingleFace(img, faceDetectionNet)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detections) {
            descriptions.push(detections.descriptor);
          }
        }
      }
      console.log("Sucess");
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}
async function start() {
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
  const loadedLabels = await loadLabedImages();
  console.log(loadedLabels);
  // const faceMatcher = new faceapi.FaceMatcher(loadedLabels);

  var json_str = '{"parent":' + JSON.stringify(loadedLabels) + "}";
  let p = path.join(path.resolve("./", "facedescriptor.json"));
  // fs.writeFileSync(p, loadedLabels);
  // DESCRIPTOR.push(loadedLabels);
  fs.writeFileSync(p, json_str);
}

router.get("/", async (req, res, next) => {
  await start();
  res.json("Success");
});

module.exports = router;
