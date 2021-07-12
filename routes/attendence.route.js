const router = require("express").Router();

const attendenceController = require("../controllers/attendence.controller");

router.get("/mark-attendence", attendenceController.getMarkAttendence);
router.get("/:sid", attendenceController.getAttendenceByStudentId);
router.delete("/:sid", attendenceController.deleteStudentAttendence);

module.exports = router;
