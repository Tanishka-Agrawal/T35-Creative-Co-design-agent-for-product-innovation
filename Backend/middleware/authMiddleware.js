const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET || "MY_SECRET_KEY";

module.exports = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token)
    return res.status(401).send({ message: "Access denied! No token" });

  if (token.startsWith("Bearer "))
    token = token.slice(7);

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid token" });
  }
};
