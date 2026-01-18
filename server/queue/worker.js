import { Worker } from "bullmq";
import { redisConnection } from "./connection.js";
import mongoose from "mongoose";
import Transfer from "../models/transfer.js";
import Ledger from "../models/Ledger.js";
import User from "../models/userSchema.js";

import dotenv from "dotenv";

dotenv.config();

console.log("Worker process starting...");


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected (worker)"))
  .catch((err) => console.error(" MongoDB error:", err));

// Utility
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const worker = new Worker(
  "payments",
  async (job) => {
    console.log(" Worker received job:", job.data);

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
        console.log(" Transfer already processed:", transfer.status);
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
        throw new Error("Sender or receiver not found");
      }

      if (sender.balance < debit.amount) {
        debit.status = "FAILED"; 
        credit.status = "FAILED";
        transfer.status = "FAILED";
        await Promise.all([
          debit.save({ session }),
          credit.save({ session }),
          transfer.save({ session }),
        ]);
        await session.commitTransaction();
        console.log("insufficient balance for transfer:", transferId); 
        return;
      }

      // Simulated delay (optional)
      await sleep(10000);

      // Apply balances
      sender.balance -= debit.amount;
      receiver.balance += credit.amount;

       

      // Success saved and updated statuses
      debit.status = "SUCCESS";
      credit.status = "SUCCESS";
      transfer.status = "SUCCESS";
      
      await Promise.all ([
        sender.save({ session }),
        receiver.save({ session }),
        debit.save({ session }),
        credit.save({ session }),
        transfer.save({ session })
      ]);


      await session.commitTransaction();
      console.log(" Transfer completed:", transferId);
    } catch (err) {

      console.error(" Worker error:", err.message);
      await session.abortTransaction();

    } finally {

      await session.endSession();

    }
  },
  { connection: redisConnection }
);

// Lifecycle logs
worker.on("completed", (job) => {
  console.log(` Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(` Job ${job?.id} failed:`, err.message);
});
