import express from "express"
import {userlogin, useregister, transact, transactionhistory} from "../controllers/usercontroller.js"
import {verifytoken} from "../middleware/auth.js"
const router = express.Router();

router.post("/login", userlogin);
router.post("/register", useregister);
router.post("/transact", verifytoken, transact);
router.post("/history",verifytoken,transactionhistory); 


export default router; 
