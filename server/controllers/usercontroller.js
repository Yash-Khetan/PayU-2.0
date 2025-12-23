import User from "../models/userSchema.js"
import bcrypt from "bcrypt"
import Transactions from "../models/transactionSchema.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config(); 

export const userlogin  = async (req,res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        
        if (!user) {
            return res.status(401).json({message: "User not found"});
        }
        
        const ispasswordmatch = await bcrypt.compare(password, user.password);
        if (!ispasswordmatch) {
            return res.status(401).json({message: "Invalid password"});
        }
        const token = jwt.sign({
            email,
            id: user._id
        }, process.env.JWT_SECRET)
        res.status(200).json({message: "Login successful", token});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const useregister = async (req,res) =>{
    try {
        const {name, email, password} = req.body;
        const hashpassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            name,
            email,
            password: hashpassword,
        });
        
        res.status(201).json({message: "User registered successfully", user});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


// now I need to check for user transactions 
export const transact = async (req,res) => {
    try {
        const senderemail = req.user.email; 
        const { receiveremail, transactamount} = req.body;
        
       


        const sender = await User.findOne({email: senderemail});
       

        const receiver = await User.findOne({email: receiveremail});
       
        
        if (!sender || !receiver) {
            return res.status(404).json({message: "Sender or receiver not found"});
        }

        if (sender.email === receiver.email) {
            return res.status(400).json({message:"cannot transfer to self"}); 
        }
        
        if (sender.balance < transactamount) {

             await Transactions.create({
            senderid: senderemail, 
            receiverid: receiveremail, 
            amount: transactamount, 
            status: "failed", 
            date: new Date(), 
            message: "insufficient balance"
        })
            return res.status(400).json({message: "Insufficient balance"});
            
        }
        
        sender.balance -= Number(transactamount);
        receiver.balance += Number(transactamount);
        
        await sender.save();
        await receiver.save();

        await Transactions.create({
            senderid: senderemail, 
            receiverid: receiveremail, 
            amount: transactamount, 
            status: "approved", 
            date: new Date(), 
            message: "transaction successful!"
        })
        
        res.status(200).json({message: "Transaction successful", sender, receiver});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}


export const transactionhistory = async (req,res) => { 
    const {email} = req.body; 
    const transactions = await Transactions.find({senderid:email}); 
    if (!transactions){
        res.status(400).json({message: "no transactions"}); 
    }
    res.status(200).json({message: "Transaction history", transactions}); 
}