import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import Transactions from "../models/transactionSchema.js";
import User from "../models/userSchema.js";

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// MongoDB connection (Atlas)
mongoose
  .connect("mongodb+srv://paymentsInterface:yash1234@payu1.mqz5eov.mongodb.net/payments")
  .then(() => console.log("✅ MongoDB connected (worker)"))
  .catch((err) => console.error("❌ MongoDB error (worker):", err));

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const worker = new Worker(
  "payments",
  async (job) => {
    console.log("\n📥 Job received");
    console.log("🆔 Job ID:", job.id);
    console.log("📦 Job data:", job.data);

    const { transactionid } = job.data;

    // 1️⃣ Fetch transaction
    const transaction = await Transactions.findById(transactionid);

    if (!transaction) {
      console.log("❌ Transaction not found:", transactionid);
      return;
    }

    console.log("📄 Transaction found:", transaction.status);

    // 2️⃣ Idempotency check
    if (transaction.status !== "pending") {
      console.log(
        "⚠️ Transaction already processed. Status:",
        transaction.status
      );
      return;
    }

    // 3️⃣ Mark as processing
    transaction.status = "processing";
    await transaction.save();
    console.log("🔄 Transaction marked as PROCESSING");

    // 4️⃣ Fetch users
    const sender = await User.findOne({ email: transaction.senderid });
    const receiver = await User.findOne({ email: transaction.receiverid });

    if (!sender || !receiver) {
      console.log("❌ Sender or receiver missing");
      transaction.status = "failed";
      await transaction.save();
      return;
    }

    console.log(
      "👤 Sender balance:",
      sender.balance,
      "| Receiver balance:",
      receiver.balance
    );

    // 5️⃣ Balance check
    if (sender.balance < transaction.amount) {
      console.log("❌ Insufficient balance");
      transaction.status = "failed";
      await transaction.save();
      return;
    }

    // 6️⃣ Simulated bank delay
    console.log("⏳ Processing payment...");
    await sleep(5000);

    // 7️⃣ Update balances
    sender.balance -= Number(transaction.amount);
    receiver.balance += Number(transaction.amount);

    await sender.save();
    await receiver.save();

    console.log(
      "💸 Balances updated:",
      sender.balance,
      receiver.balance
    );

    // 8️⃣ Finalize transaction
    transaction.status = "success";
    await transaction.save();

    console.log("✅ Transaction SUCCESS:", transaction._id);
  },
  { connection }
);

// Worker lifecycle logs
worker.on("completed", (job) => {
  console.log("🟢 Job completed:", job.id);
});

worker.on("failed", (job, err) => {
  console.error("🔴 Job failed:", job?.id, err);
});
