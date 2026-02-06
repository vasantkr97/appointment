import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "SERVICE_PROVIDER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["MEDICAL", "HOUSE_HELP", "BEAUTY", "FITNESS", "EDUCATION", "OTHER"]),
  durationMinutes: z.number().int().min(30).max(120).refine(v => v % 30 === 0, {
    message: "Duration must be multiple of 30"
  })
})

export const setServiceAvailabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string()
}).refine(data => data.startTime < data.endTime, {
  message: "startTime must be before endTime"
})

export const serviceTypeSchema = z.enum(["MEDICAL", "HOUSE_HELP", "BEAUTY", "FITNESS", "EDUCATION", "OTHER"])

export const slotIdSchema = z.object({
  slotId: z.string()
});

