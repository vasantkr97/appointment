import type { Response } from 'express'
import type { AuthRequest } from '../utils/types'
import { prisma } from '../../db'


export const getAppointment  = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id

        const appointments = await prisma..findMany({
            where: {
                id: userId
            }
        })

        const formmatedAppoiments = appointments.map(a => ({
            serviceName: a.se
        }))

        return res.status(200).json({

        })
    } catch (error: any) {

    }
}

