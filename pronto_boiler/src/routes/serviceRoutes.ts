import { Router } from "express";
import { createService, getServices, getSlots, setServiceAvailability } from "../controller/serviceController";
import { authorize } from "../middleware/auth";

const router = Router();

router.post("/", authorize(["SERVICE_PROVIDER"]), createService);

router.post("/:serviceId/availability", authorize(["SERVICE_PROVIDER"]), setServiceAvailability);

router.get("/", getServices);

router.get("/:serviceId/slots?date=YYYY-MM-DD", getSlots)
export default router;
