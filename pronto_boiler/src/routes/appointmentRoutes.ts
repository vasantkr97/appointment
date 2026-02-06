import { Router } from "express";
import { authorize } from "../middleware/auth";
import { bookAppointment, getAppointment } from "../controller/appointmentController";

const router = Router();

router.post("/", authorize(["USER"]), bookAppointment);

router.get("/me", getAppointment)

export default router;