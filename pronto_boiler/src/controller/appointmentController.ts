import type { Response } from 'express'
import type { AuthRequest } from '../utils/types'
import { prisma } from '../../db'
import { slotIdSchema } from '../utils/validation'
import { isValidTimeFormat, minutesToTime, timeToMinutes } from '../utils/helpers'


export const bookAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const validate = slotIdSchema.safeParse(req.body)

        if (!validate.success) {
            return res.status(400).json({
                error: "Invalid slotId or time"
            })
        }

        const slotId = validate.data.slotId

        //1. parse slotId <serviceId>_<DateTime>_HH:MM
        const parts = slotId.split("_");

        if (parts.length !== 3) {
            return res.status(400).json({ error: "Invalid slotId format"})
        }

        const [serviceId, date,startTime] = parts;
        if (!serviceId || !date || !startTime) {
            return res.status(404).json({ error: "required all details"})
        }
        const user = req.user

        await prisma.$transaction(async (tx) => {
            //check the service
            const service =  await prisma.service.findUnique({
                where: {
                    id: serviceId
                },
                include: {
                    availabilities: true
                }
            })

            if (!service) {
                throw { status: 404, error: "Service not found" }
            }

            if (service.providerId === user?.id) {
                throw {status: 403, error: "Providers cannot book their own services" }
            }

            const existing = await tx.appointment.findUnique({
                where: { slotId }
            })

            if (existing && existing?.status === "BOOKED") {
                throw { status: 409, error: "Slot already booked" }
            }

            //validate availabiliy
            const requiredDate = new Date(date)
            const dayOfWeek = requiredDate.getDay()
            const startMin = timeToMinutes(startTime)
            const endMin = startMin + service.durationMinutes


            if (!isValidTimeFormat(startTime)) {
                throw { status: 400, error: "Invalid time format in slot"}
            }

            //look for containment in availabilities
            const availability = service.availabilities.filter(a => 
                a.dayOfWeek === dayOfWeek &&
                timeToMinutes(a.startTime) < startMin && 
                timeToMinutes(a.endTime) >= endMin
            );

            if (!availability) {
                throw { status: 400, error: "Slot is not within provider availability" }
            }

            //CHECK for overlapping appointments
            const overlap = await tx.appointment.findFirst({
                where: {
                    serviceId,
                    date,
                    status: "BOOKED",
                    OR: [
                        { 
                            startTime: { lt: minutesToTime(endMin) },
                            endTime: { gt: minutesToTime(startMin)}
                        }
                    ]
                }
            });

            if (overlap) {
                throw { status: 409, message: "Slot conflits with an existing appointment"};
            }

            const appointment = await tx.appointment.create({
                data: {
                    userId: user!.id,
                    serviceId,
                    date,
                    startTime,
                    endTime: minutesToTime(endMin),
                    slotId,
                    status: "BOOKED"
                }
            });

            return res.status(201).json({
                id: appointment.id,
                slotId: appointment.slotId,
                status: "BOOKED"
            })
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}


export const getAppointment= async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user

        const appointments = await prisma.appointment.findMany({
            where: {
                userId: user?.id
            },
            include: {
                service: true
            }
        })

        const formattedAppointments = appointments.map(a => ({
            serviceName: a.service.name,
            type: a.service.type,
            date: a.date,
            startTime: a.startTime,
            endTime: a.endTime,
            status: a.status
        }))

        return res.status(200).json({
            formattedAppointments
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}



