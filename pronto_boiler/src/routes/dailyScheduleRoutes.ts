import { Router } from "express"
import { gettodaysSchedule } from "../controller/dailySchedule"

const router = Router()

router.get("/me/schedule?date=YYYY-MM-DD", gettodaysSchedule)

export default router;