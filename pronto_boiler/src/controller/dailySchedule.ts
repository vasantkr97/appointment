import type { Response } from "express";
import type { AuthRequest } from "../utils/types";
import { prisma } from "../../db";
import { getAppointment } from "./appointmentController";

export const gettodaysSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { date } = req.query

        if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: "Invalid date format"})
        }

        const services = await prisma.service.findMany({
            where: {
                providerId: req?.user?.id
            },
            include: {
                appointments: {
                    where: { 
                        date,
                        status: "BOOKED"
                    },
                    orderBy: {
                        startTime: "asc"
                    }
                }
            }
        })

        const schedule = services.map(service => ({
            serviceId: service.id,
            serviceName: service.name,
            appointments: service.appointments.map(appt => ({
                id: appt.id,
                startTime: appt.startTime,
                endTime: appt.endTime,
                status: appt.status
            }))
        }))
         
        return res.status(200).json(schedule)

    } catch (error: any) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}