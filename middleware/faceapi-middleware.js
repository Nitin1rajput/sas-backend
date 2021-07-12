const path = require("path");
const faceapi = require("face-api.js");
const canvas = require("canvas");
const HttpError = require("../models/http-error");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
const loadingModel = async (req, res, next) => {
  try {
    const modelPath = path.resolve(__dirname, "weights");
    console.log(path.resolve(__dirname, "weights"));
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    console.log("Loaded");
    next();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Models not loaded correctly, Please try again later",
      500
    );
    return next(error);
  }
};

module.exports = loadingModel;
