import type { Response } from 'express'
import { createServiceSchema, setServiceAvailabilitySchema, serviceTypeSchema } from '../utils/validation'
import type { AuthRequest } from '../utils/types'
import { prisma } from '../../db'

export const createService = async (req: AuthRequest, res: Response) => {
    try {
        const validate = createServiceSchema.safeParse(req.body)

        if (!validate.success) {
            return res.status(400).json({
                error: 'Invalid input'
            })
        }

        const user = req.user

        if (!user || user.role !== "SERVICE_PROVIDER") {
            return res.status(403).json({
                error: 'Forbidden (wrong role)'
            })
        }

        const { name, type, durationMinutes } = validate.data

        const create = await prisma.service.create({
            data: {
                name: name,
                providerId: user.id,
                type: type,
                durationMinutes: durationMinutes
            }
        })

        return res.status(201).json({
            id: create.id,
            name: create.name,
            type: create.type,
            durationMinutes: create.durationMinutes
        })

    } catch (error: any) {
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
                error: "Invalid input"
            })
        }

        const user = req.user
        const { serviceId } = req.params as { serviceId: string }

        const service = await prisma.service.findFirst({
            where: {
                id: serviceId
            }
        })

        if (!service) {
            return res.status(404).json({
                error: "Service not found"
            })
        }

        if (service.providerId !== user?.id) {
            return res.status(403).json({
                error: "Service does not belong to provider"
            })
        }

        const { dayOfWeek, startTime, endTime } = validate.data

        const existingAvailability = await prisma.availability.findMany({
            where: {
                serviceId: serviceId,
                dayOfWeek: dayOfWeek
            }
        })


        await prisma.availability.create({
            data: {
                serviceId: serviceId,
                dayOfWeek: dayOfWeek,
                startTime: startTime,
                endTime: endTime
            }
        })

        return res.status(201).json({
            message: "Availability created successfully"
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
            const typeValidation = serviceTypeSchema.safeParse(type)
            if (!typeValidation.success) {
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

        const formattedServices = services.map(service => ({
            id: service.id,
            name: service.name,
            type: service.type,
            durationMinutes: service.durationMinutes,
            providerName: service.provider.name
        }))

        return res.status(200).json(formattedServices)

    } catch (error: any) {
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}


