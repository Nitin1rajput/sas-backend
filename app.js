const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const config = dotenv.config();
const app = express();

const authRoute = require("./routes/auth.route");
const studentRoute = require("./routes/student.route");
const facultyRoute = require("./routes/faculty.route");
const attendenceRoute = require("./routes/attendence.route");
const trainRoute = require("./routes/train.route");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");

app.use(bodyParser.json());
app.use("/uploads/images", express.static(path.join("uploads", "images")));

//CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With,Content-Type,Accept,Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH,DELETE");
  next();
});
app.use("/api", authRoute);
app.use("/api/students", studentRoute);
app.use("/api/attendence", attendenceRoute);
app.use("/api/train", trainRoute);
app.use("/api/faculty", facultyRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  return next(error);
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const PORT = process.env.PORT || 5000;
const URI = `mongodb+srv://nitin:${process.env.DB_PASSWORD}@cluster0.3s6s0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log("Running at port " + PORT);
    });

    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client Connected");
      socket.on("disconnect", () => {
        console.log("disconnected");
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
