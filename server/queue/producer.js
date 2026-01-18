import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

const paymentsQueue = new Queue("payments", {
  connection: redisConnection,
});

export default async function transactionQueue(transferId) {
  try {
    const job = await paymentsQueue.add(
      "process-payment",
      { transferId },
      {
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log(" Job added to queue:", job.id);
    return job.id;
  } catch (error) {
    console.error(" Error adding payment job:", error);
    throw error;
  }
}
