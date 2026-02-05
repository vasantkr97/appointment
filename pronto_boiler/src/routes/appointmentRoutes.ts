import { Router } from "express";
import { authorize } from "../middleware/auth";
import { getAppointment } from "../controller/appointmentController";

const router = Router();

router.post("/me", authorize(["USER"]), getAppointment);

export default router;