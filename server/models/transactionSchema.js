import mongoose from "mongoose"

const transactions = mongoose.Schema({
    senderid: {
         type: String
    },
    receiverid: {
        type: String
    }, 
    status: {
        type: String,

    },
    amount: {
        type: Number, 

    }, 
    date: {
        type: Date, 
    }, 
    message: {
        type: String, 
    }
    
},{timestamps: true})

export default mongoose.model("Transactions", transactions); 