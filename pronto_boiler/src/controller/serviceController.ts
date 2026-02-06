import type { Response } from 'express'
import { createServiceSchema, setServiceAvailabilitySchema, serviceTypeSchema } from '../utils/validation'
import type { AuthRequest } from '../utils/types'
import { prisma } from '../../db'
import { timeToMinutes } from '../utils/helpers'

export const createService = async (req: AuthRequest, res: Response) => {
    try {
        const validate = createServiceSchema.safeParse(req.body)

        if (!validate.success) {
            return res.status(400).json({
                error: "Invalid input"
            })
        }

        const user = req.user

        if (!user || user.role !== "SERVICE_PROVIDER") {
            return res.status(403).json({
                error: "Forbidden (wrong role)"
            })
        }

        const { name, type, durationMinutes } = validate.data

        const service = await prisma.service.create({
            data: {
                providerId: user.id,
                name,
                type,
                durationMinutes
            }
        })

        return res.status(201).json({
            id: service.id,
            name: service.name,
            type: service.type,
            durationMinutes: service.type
        })
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}


export const setServiceAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const validate = setServiceAvailabilitySchema.safeParse(req.body)

        if (!validate.success) {
            return res.status(400).json({
                error: "Invalid input or time format"
            })
        }

        const user = req.user
        const { serviceId } = req.params as { serviceId: string }
        const { dayOfWeek, startTime, endTime } = validate.data;

        const service = await prisma.service.findUnique({
            where: {
                id: serviceId
            }
        });

        if (!service) {
            return res.status(404).json({
                error: "Service not found"
            })
        }

        if (user?.id !== service.providerId) {
            return res.status(403).json({
                error: "Service does not belong to provider"
            })
        }

        const existingAvailabilities = await prisma.availability.findMany({
            where: {
                serviceId: serviceId,
                dayOfWeek: dayOfWeek
            }
        })

        const newStart = timeToMinutes(startTime);
        const newEnd = timeToMinutes(endTime)

        for (const avail of existingAvailabilities) {
            const exStart = timeToMinutes(avail.startTime);
            const exEnd = timeToMinutes(avail.endTime);

            if (newStart < exEnd && newEnd < exStart) {
                return res.status(409).json({
                    error: "Overlapping availability"
                })
            }
        }
        

        await prisma.availability.create({
            data: {
                serviceId,
                dayOfWeek,
                startTime,
                endTime
            }
        })

        return res.status(201).json({
            message: "availability created successfully"
        })

    } catch (error: any) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}


export const getServices = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.query 

        if (type !== undefined) {
            const typevalidation = serviceTypeSchema.safeParse(type)
            if (!typevalidation.success) {
                return res.status(400).json({
                    error: "Invalid service type"
                })
            }
        }

        const services = await prisma.service.findMany({
            where: type ? {
                type: type as any
            } : undefined,
            include: {
                provider: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const formattedServices = services.map(s => ({
            id: s.id,
            name: s.name,
            type: s.type,
            durationMinutes: s.type,
            providerName: s.provider.name
        }))

        return res.status(200).json({
            formattedServices
        })

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}


export const getSlots = async (req: AuthRequest, res: Response) => {
    try {
        const { serviceId } = req.params as { serviceId: string }
        const { date } = req.query //YYYY-MM-DD

        if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                error: "invalid date or format"
            })
        }

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId
            },
            include: {
                availabilities: true
            }
        })

        if (!service) {
            return res.status(404).json({
                error: "Service not found"
            })
        }

        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay()

        const availabilitiesForThatDay = service.availabilities.filter(a => a.dayOfWeek === dayOfWeek)

        if (availabilitiesForThatDay.length === 0) {
            return res.status(200).json({ serviceId: service.id, date: date, slots: []})
        }


        
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}