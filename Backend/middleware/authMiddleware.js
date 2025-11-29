const jwt = require("jsonwebtoken");
const SECRET = "MY_SECRET_KEY";

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token)
    return res.status(401).send({ message: "Access denied! No token" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).send({ message: "Invalid token" });
  }
};
