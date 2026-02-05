import express from "express";
import authRoutes from "./routes/authRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import { authenticate } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);

app.use("/services", authenticate, serviceRoutes);

app.use("/appointments", authenticate, appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
