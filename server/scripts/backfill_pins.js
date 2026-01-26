import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Transfer from "../models/transfer.js";
import Ledger from "../models/Ledger.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// Proper .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for fixes");

        // 1. Backfill PINs for users who don't have them
        const users = await User.find({});
        const defaultPin = await bcrypt.hash("0000", 10);

        let updatedCount = 0;
        for (const user of users) {
            if (!user.pin) {
                user.pin = defaultPin;
                // We bypass validation here if needed, but since we are adding the required field, it should pass
                await user.save();
                console.log(`Updated user ${user.email} with default PIN 0000`);
                updatedCount++;
            }
        }
        console.log(`Backfilled PINs for ${updatedCount} users.`);

        // 2. Clear stuck PENDING transactions
        // We look for any PENDING transfer that is older than 1 minute (aggressive fix)
        const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
        const stuckTransfers = await Transfer.find({
            status: "PENDING",
            createdAt: { $lt: oneMinuteAgo }
        });

        for (const txn of stuckTransfers) {
            txn.status = "FAILED";
            await txn.save();

            // Also update ledgers
            await Ledger.updateMany(
                { transferId: txn._id },
                { status: "FAILED" }
            );
            console.log(`Marked stuck transfer ${txn._id} as FAILED`);
        }
        console.log(`Fixed ${stuckTransfers.length} stuck transfers.`);

    } catch (error) {
        console.error("Error during fix:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Done");
        process.exit();
    }
};

fixData();
