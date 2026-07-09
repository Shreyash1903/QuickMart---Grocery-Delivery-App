import express from "express";
import verifyToken from "../middleware/authMiddleware.js";
import AddressController from "../controllers/addressController.js";

const router = express.Router();

router.use(verifyToken);

// Add Address
router.post("/add", AddressController.addAddress);

// Get All Addresses
router.get("/", AddressController.getAddresses);

// Update Address
router.put("/:id", AddressController.updateAddress);

// Delete Address
router.delete("/:id", AddressController.deleteAddress);

// Set Default Address
router.patch("/default/:id", AddressController.setDefaultAddress);

export default router;
