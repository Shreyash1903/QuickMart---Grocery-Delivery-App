const adminAuth = (req, res, next) => {
  try {
    // Check if user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Check role
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied. Admin Only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Authorization Error",
    });
  }
};

export default adminAuth;