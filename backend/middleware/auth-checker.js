const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    console.log("inside authchecker");
    console.log("req.headers.authorization",req.headers.authorization);
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    console.log("decodedToken",decodedToken);
    console.log("token",token);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    console.log("req.userData :",req.userData);
    console.log("email :",decodedToken.email)
    console.log("decodedToken :",decodedToken.userId)
    next();
  } catch (error) {
    res.status(401).json({ message: "You are not authenticated!" });
  }
};
