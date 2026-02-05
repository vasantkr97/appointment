# Appointment Booking System - Setup Guide

## Prerequisites

- Bun installed
- PostgreSQL database running

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/pronto_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

## Installation & Setup

1. Install dependencies:
```bash
bun install
```

2. Generate Prisma Client:
```bash
bunx prisma generate
```

3. Push schema to database:
```bash
bunx prisma db push
```

4. Start the server:
```bash
bun run src/index.ts
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "Dr Smith",
  "email": "dr@clinic.com",
  "password": "password123",
  "role": "SERVICE_PROVIDER"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created Successfully with id {userId}"
}
```

#### POST `/auth/login`
Login and get JWT token.

**Request:**
```json
{
  "email": "dr@clinic.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt-token"
}
```

### Services (Service Provider Only)

#### POST `/services`
Create a new service.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "Physiotherapy",
  "type": "MEDICAL",
  "durationMinutes": 30
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Physiotherapy",
  "type": "MEDICAL",
  "durationMinutes": 30
}
```

#### POST `/services/:serviceId/availability`
Set availability for a service.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "dayOfWeek": 4,
  "startTime": "09:00",
  "endTime": "12:00"
}
```

**Response:** `201 Created`

#### GET `/services?type=MEDICAL`
Get all services (optional filter by type).

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Physiotherapy",
    "type": "MEDICAL",
    "durationMinutes": 30,
    "providerName": "Dr Smith"
  }
]
```

#### GET `/services/:serviceId/slots?date=YYYY-MM-DD`
Get available slots for a service on a specific date.

**Response:** `200 OK`
```json
{
  "serviceId": "uuid",
  "date": "2026-02-06",
  "slots": [
    {
      "slotId": "uuid_2026-02-06_09:00",
      "startTime": "09:00",
      "endTime": "09:30"
    }
  ]
}
```

### Appointments (User Only)

#### POST `/appointments`
Book an appointment.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "slotId": "uuid_2026-02-06_09:00"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "slotId": "uuid_2026-02-06_09:00",
  "status": "BOOKED"
}
```

#### GET `/appointments/me`
Get my appointments.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "serviceName": "Physiotherapy",
    "type": "MEDICAL",
    "date": "2026-02-06",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "BOOKED"
  }
]
```

### Provider Schedule (Service Provider Only) - BONUS

#### GET `/providers/me/schedule?date=YYYY-MM-DD`
Get provider's schedule for a specific date.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "date": "2026-02-06",
  "services": [
    {
      "serviceId": "uuid",
      "serviceName": "Physiotherapy",
      "appointments": [
        {
          "appointmentId": "uuid",
          "userName": "Rahul",
          "startTime": "09:00",
          "endTime": "09:30",
          "status": "BOOKED"
        }
      ]
    }
  ]
}
```

## Database Schema

- **User**: Stores users with roles (USER or SERVICE_PROVIDER)
- **Service**: Services created by providers with duration and type
- **Availability**: Weekly recurring availability for services
- **Appointment**: Booked appointments with unique slotId

## Business Rules

1. **Time Format**: HH:MM (24-hour), minutes must be 00 or 30
2. **Duration**: 30-120 minutes, multiples of 30
3. **Slots**: Dynamically generated, never stored in DB
4. **Booking**: Cannot book past slots or own services
5. **Availability**: Cannot overlap for same service on same day
