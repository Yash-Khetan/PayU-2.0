import jwt from "jsonwebtoken"

export const verifytoken = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    // Check if token is valid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in request
    next(); // Allow request to continue
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}