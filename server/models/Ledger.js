import mongoose from "mongoose";

const ledgerTransactionSchema = new mongoose.Schema(
  {
    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transfer",
      required: true,
      index: true,
    },

    userEmail: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ledger", ledgerTransactionSchema);
