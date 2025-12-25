import express from "express"
import mongoose from "mongoose"
import userRoutes from "./routes/userRoutes.js"
import dotenv  from "dotenv"

dotenv.config();

const app = express()
const port = 5000;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
    res.send("Payment API is running");
})

app.use("/api/users", userRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})