import { Router } from "express";

const router = Router();

import noticeController from "./routes/notices.js";
import authController from "./routes/auth.js";

router.use("/noticeController", noticeController);
router.use("/authcontroller", authController);


export default router;
