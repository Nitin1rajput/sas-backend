const router = require("express").Router();
const { check } = require("express-validator");

const studentController = require("../controllers/student.controller");
const studentFileUpload = require("../middleware/student-file-upload");

router.get("/", studentController.getAllStudents);
router.get("/:sid", studentController.getStudentById);

router.post(
  "/new",
  studentFileUpload.array("images", 10),
  [
    check("name").not().isEmpty(),
    check("standard").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
  ],
  studentController.createStudent
);

router.patch(
  "/:sid",
  [check("name").not().isEmpty(), check("standard").not().isEmpty()],
  studentController.updateStudent
);

router.delete("/:sid", studentController.deleteStudent);

module.exports = router;
