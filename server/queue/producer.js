import {Queue} from "bullmq"

const paymentsqueue = new Queue('payments', {
    connection: {
        host: "127.0.0.1",
        port: 6379
    }
}); 


export default async function transaction (senderid, receiverid, amount) {
    try{
        const job = await paymentsqueue.add("process-payment",{
        senderid,
        receiverid,
        amount
    })
    return job.id
}catch(error) {
    console.log("error adding payment job: ",error); 
}
}


