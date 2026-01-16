import { Worker } from "bullmq";
import IORedis from "ioredis";
import mongoose from "mongoose";
import Transfer from "./models/transfer.js";
import Ledger from "./models/Ledger.js";
import User from "./models/userSchema.js";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Worker process starting...");

// Redis connection
const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected (worker)"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Utility
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const worker = new Worker(
  "payments",
  async (job) => {
    console.log("📥 Worker received job:", job.data);

    const { transferId } = job.data;
    if (!transferId) {
      throw new Error("transferId missing in job payload");
    }

    const session = await mongoose.startSession();

    try {
      await session.startTransaction();

      const transfer = await Transfer.findById(transferId).session(session);
      if (!transfer) {
        throw new Error("Transfer not found");
      }

      // Idempotency guard
      if (transfer.status !== "PENDING") {
        console.log("⚠️ Transfer already processed:", transfer.status);
        await session.abortTransaction();
        return;
      }

      const ledgerEntries = await Ledger.find({ transferId }).session(session);
      if (ledgerEntries.length !== 2) {
        throw new Error("Invalid ledger state");
      }

      const debit = ledgerEntries.find((l) => l.type === "DEBIT");
      const credit = ledgerEntries.find((l) => l.type === "CREDIT");

      const sender = await User.findOne({ email: debit.userEmail }).session(session);
      const receiver = await User.findOne({ email: credit.userEmail }).session(session);

      if (!sender || !receiver) {
        throw new Error("Sender or receiver missing");
      }

      if (sender.balance < debit.amount) {
        throw new Error("Insufficient balance");
      }

      // Simulated delay (optional)
      await sleep(3000);

      // Apply balances
      sender.balance -= debit.amount;
      receiver.balance += credit.amount;

      await sender.save({ session });
      await receiver.save({ session });

      // Ledger success
      debit.status = "SUCCESS";
      credit.status = "SUCCESS";
      await debit.save({ session });
      await credit.save({ session });

      // Transfer success
      transfer.status = "SUCCESS";
      await transfer.save({ session });

      await session.commitTransaction();
      console.log("✅ Transfer completed:", transferId);
    } catch (err) {
      await session.abortTransaction();
      console.error("❌ Worker error:", err.message);

      await Transfer.findByIdAndUpdate(transferId, { status: "FAILED" });
      await Ledger.updateMany(
        { transferId },
        { status: "FAILED" }
      );

      throw err;
    } finally {
      await session.endSession();
    }
  },
  { connection }
);

// Lifecycle logs
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`🔥 Job ${job?.id} failed:`, err.message);
});
