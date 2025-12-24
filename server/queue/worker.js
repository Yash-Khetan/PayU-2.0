import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({ maxRetriesPerRequest: null });

const time = () => 
    new Promise((res,rej) => setTimeout(() => res(), 5*1000))

const worker = new Worker(
  'payments',
  async (job) => {
   // sender.balance -= Number(transactamount);
     // receiver.balance += Number(transactamount);
    
    await time() ; 
    console.log(job.data);
  },
  { connection },
);