const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Verify JWT token middleware
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Add user id and role to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.hasMembership = decoded.hasMembership;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Requires admin privileges" });
  }
  next();
};

// Check if user has active membership
exports.hasMembership = async (req, res, next) => {
  try {
    if (req.userRole === "admin") {
      // Admins always have access
      return next();
    }

    if (!req.hasMembership) {
      const membership = await Membership.findOne({
        where: {
          user_id: req.userId,
          status: "active",
          end_date: {
            [Op.gte]: new Date(),
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          message: "Active membership required to access this content",
          requiresMembership: true,
        });
      }

      // Update token information
      req.hasMembership = true;
    }

    next();
  } catch (error) {
    console.error("Membership check error:", error);
    res.status(500).json({ message: "Server error checking membership" });
  }
};
