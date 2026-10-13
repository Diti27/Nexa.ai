import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";

import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

// console.log("API Key:", process.env.GEMINI_API_KEY);

const app = express();

await connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Test Route
app.get("/", (req, res) => {
  res.send("Server is Live!");
});

// Protected Routes
app.use(requireAuth());

// AI Routes
app.use("/api/ai", aiRouter)
app.use("/api/user", userRouter)


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});