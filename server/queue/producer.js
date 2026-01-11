import {Queue} from "bullmq"

const paymentsqueue = new Queue('payments', {
    connection: {
        host: "127.0.0.1",
        port: 6379
    }
}); 


export default async function transaction (temptransaction) {
    try{
        const job = await paymentsqueue.add("process-payment",{
       transactionid: temptransaction
    })
    return job.id
}catch(error) {
    console.log("error adding payment job: ",error); 
}
}


