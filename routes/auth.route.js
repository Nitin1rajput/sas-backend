const router = require("express").Router();
const { check } = require("express-validator");

const authController = require("../controllers/auth.controller");
const fileUpload = require("../middleware/file-upload");
router.post("/student/login", authController.studentLogin);

router.post(
  "/faculty/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  authController.facultySignup
);

router.post(
  "/faculty/login",
  [
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  authController.facultyLogin
);

module.exports = router;
