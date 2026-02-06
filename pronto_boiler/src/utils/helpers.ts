
export const timeToMinutes = (time: string): number => {
    const parts = time.split(":").map(Number);

    if (parts.length !== 2 || parts.some(isNaN)) {
        throw new Error(`Invalid time format: ${time}`)
    }
    const [hours, minutes] = parts as [number, number]
    return hours*60 + minutes
}

export const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes/60).toString().padStart(2, "0")
    const m = (minutes % 60).toString().padStart(2, "0");
    return `${h}:${m}`
}


export const isValidTimeFormat = (time: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):(00|30)$/;
    return regex.test(time);
}