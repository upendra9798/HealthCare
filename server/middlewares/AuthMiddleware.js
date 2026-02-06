import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) {
    console.log("JWT cookie not found");
    return res.status(401).send("You are not authenticated!");
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      console.log("JWT verification failed", err);
      return res.status(403).send("Token is not valid!");
    }

    // Set both doctorId and user._id for backward compatibility
    req.doctorId = payload.doctorId || payload.adminId;
    req.user = {
      _id: payload.doctorId || payload.adminId
    };
    next();
  });
};
