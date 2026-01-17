import User from "../models/userSchema.js"
import bcrypt from "bcrypt"
import Transfer from "../models/transfer.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import transactionqueue from "../producer.js"
import Ledger from "../models/Ledger.js"

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

        // put in the queue for the transaction 
        const payment = await Transfer.create({
            senderEmail: sender.email,
            receiverEmail: receiver.email,
            amount: transactamount,
            status: "PENDING"
        });

        const ledgerentry = await Ledger.create([
            {
                transferId: payment._id,
                userEmail: sender.email,
                type: "DEBIT",
                amount: transactamount,
                status: "PENDING"
            },
            {
                transferId: payment._id,
                userEmail: receiver.email,
                type: "CREDIT",
                amount: transactamount,
                status: "PENDING"
            }
        ]);

        // queueing the transactions 
        await transactionqueue(payment._id);
        return res.status(202).json({message: "Transaction is being processed"});
        // return res.status(202).json({message: `Transactions queued with ids: ${sendertransaction._id}, ${receivertransaction._id} and statuses: ${sendertransaction.status}, ${receivertransaction.status}`})


        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// fetching transaction history 
export const transactionhistory = async (req, res) => {
  try {
    const email = req.user.email;
    const transactions = await Ledger.find({ userEmail: email });

    // Always return array, even if empty
    if (transactions.length === 0) {
      return res.status(200).json({
        message: "No transactions found",
        history: [],
      });
    }
    res.status(200).json({
      message: "Transaction history fetched successfully",
      history: transactions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all users except the logged-in user
export const allusers = async (req, res) => {
  try {
    const email = req.user.email;
    const allusers = await User.find({ email: { $ne: email } }).select(
      "-password -__v"
    );

    // Always return array
    res.status(200).json({
      message: "All users",
      allusers: allusers || [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch profile of the logged-in user
export const myprofile = async (req, res) => {
  try {
    const email = req.user.email;
    const info = await User.findOne({ email }).select("-password -__v");

    if (!info) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile",
      info,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




