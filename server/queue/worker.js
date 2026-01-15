import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import Transactions from "../models/transactionSchema.js";
import User from "../models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

// Utility
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const worker = new Worker(
  "payments",
  async (job) => {
    const { transactionid } = job.data;

    // Fetch transaction
    const transaction = await Transactions.findById(transactionid);

    // Mark as processing
    transaction.status = "processing";
    await transaction.save();

    // Fetch users
    const sender = await User.findOne({ email: transaction.senderid });
    const receiver = await User.findOne({ email: transaction.receiverid });

    // Simulated processing delay
    await sleep(5000);

    // Update balances
    sender.balance -= Number(transaction.amount);
    receiver.balance += Number(transaction.amount);

    await sender.save();
    await receiver.save();

    // Finalize transaction
    transaction.status = "success";
    await transaction.save();
  },
  { connection }
);

// Worker lifecycle
worker.on("completed", (job) => {
  console.log("Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Job failed:", job?.id, err);
});
