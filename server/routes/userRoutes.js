import express from "express"
import {userlogin, useregister, transact, transactionhistory, allusers, myprofile, transfers} from "../controllers/usercontroller.js"
import {verifytoken} from "../middleware/auth.js"
const router = express.Router();

router.post("/login", userlogin);
router.post("/register", useregister);
router.post("/transact", verifytoken, transact);
router.get("/history",verifytoken,transactionhistory); 
router.get("/all", verifytoken, allusers); 
router.get("/me", verifytoken, myprofile); 
router.get("/transfers/:id", verifytoken, transfers)

export default router; 
