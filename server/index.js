import express from "express"
import mongoose from "mongoose"
import userRoutes from "./routes/userRoutes.js"
import dotenv  from "dotenv"
import cors from "cors"

dotenv.config();

const app = express()


app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    
}));

// Middleware
app.use(express.json());
 

// MongoDB Connection
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

app.get("/", (req, res) => {
    res.send("Payment API is running");
})

app.use("/api/users", userRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

import "./queue/worker.js"