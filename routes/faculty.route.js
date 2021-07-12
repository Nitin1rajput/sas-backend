const router = require("express").Router();
const { check } = require("express-validator");

const facultyController = require("../controllers/faculty.controller");
const fileUpload = require("../middleware/file-upload");

router.get("/:fid", facultyController.getFacultyById);
router.patch(
  "/:fid",
  fileUpload.single("image"),
  [(check("name").not().isEmpty(), check("standard").not().isEmpty())],
  facultyController.updateFaculty
);
router.delete("/:fid", facultyController.deleteFaculty);

module.exports = router;
