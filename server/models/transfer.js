import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    senderEmail: {
      type: String,
      required: true,
      index: true,
    },

    receiverEmail: {
      type: String,
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transfer", transferSchema);
