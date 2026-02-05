import { Router } from "express";
import { createService, getServices, setServiceAvailability } from "../controller/serviceController";
import { authorize } from "../middleware/auth";

const router = Router();

router.post("/", authorize(["SERVICE_PROVIDER"]), createService);

router.post("/:serviceId/availability", authorize(["SERVICE_PROVIDER"]), setServiceAvailability);

router.get("/", getServices);

export default router;
