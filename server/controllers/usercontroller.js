import User from "../models/userSchema.js"
import bcrypt from "bcrypt"
import Transactions from "../models/transactionSchema.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
// import transaction from "../queue/producer.js"

dotenv.config(); 

// const session  = mongoose.startSession() ;
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
            id: user._id,
            
        }, process.env.JWT_SECRET,  { expiresIn: "1h" })
        res.status(200).json({message: "Login successful", token});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export const useregister = async (req,res) =>{
    try {
        const {name, email, password} = req.body;
        const hashpassword = await bcrypt.hash(password, 10);
        const isuser = await User.findOne({email});
        if (isuser) {
            return res.status(400).json({message: "User already exists"});
        }

        
        const user = await User.create({
            name,
            email,
            password: hashpassword,
        });
        
        res.status(200).json({message: "User registered successfully", user});
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
        
        // balance validation
        if (sender.balance < transactamount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // put in the queue for the transaction 
       const temptransaction =  await Transactions.create({
            senderid: senderemail ,
            receiverid : receiveremail, 
            status: "pending", 
            amount: transactamount, 
        })
        // const result = await transaction(temptransaction._id);
    
        // res.status(202).json({message: `Transaction queued with id: ${temptransaction._id} and status: ${temptransaction.status}`})


        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// fetching transaction history 
export const transactionhistory = async (req,res) => { 
    const email = req.user.email; 
    const transactions = await Transactions.find({senderid:email}); 
    if (transactions.length == 0){
        res.status(400).json({message: "no transactions"}); 
    }
    res.status(200).json({message: "Transaction history", transactions}); 
}

// fetching all users except me 
export const allusers = async (req,res) => {
    try {
        const user = req.user.email;
        const allusers = await User.find({email : {$ne: user}}).select("-password -__v"); 
        if (allusers.length == 0) {
            return res.status(400).json({message: "no users"});
        }
        return res.status(200).json({message: "All users", allusers});
       
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// fetching my profile 
export const myprofile = async (req,res) => {
    try  {
        const email = req.user.email; 
        const info = await User.findOne({email}); 
        if (!info){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({message: "User profile", info});
    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
}


