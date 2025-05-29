import express from "express";
import multer from "multer";
import { parseResume } from "../controller/resume.js"; 
import { getJson } from "../controller/gemini.js";
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post("/parse", upload.single("resume"), parseResume);
router.post("/get-json", getJson); 

export default router;