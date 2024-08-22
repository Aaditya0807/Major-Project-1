if(process.env.NODE_ENV !='production'){
    require('dotenv').config();
  }

const jwt = require("jsonwebtoken");
const JWT_SECRET =  process.env.SECRET;

//function  to generate  JWT token 
const generateToken = (userData) => {
    //Generate a new JWT token using user data
    return jwt.sign(userData, JWT_SECRET);
}

const jwtAuthMiddleware = (req, res, next) => {
    // First, check if the token is in the request cookies
    const token = req.cookies.token;

    if (!token) {
        // If not in cookies, check the request headers
        const authorization = req.headers.authorization;
        if (!authorization) return res.status(401).json({ error: "Session expired, Please login again" });

        // Extract the JWT token from the request headers
        token = authorization.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: "Invalid token" });
    }
}



module.exports = {jwtAuthMiddleware, generateToken}