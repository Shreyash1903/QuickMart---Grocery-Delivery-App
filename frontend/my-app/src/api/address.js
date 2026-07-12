import API from "./axios";

// Add Address
export const addAddress = async (addressData) => {
  try {
    const response = await API.post("/api/address/add", addressData);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding address:", error);
    throw error;
  }
};

// Get All Addresses
export const getAddresses = async () => {
  try {
    const response = await API.get("/api/address");
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching addresses:", error);
    throw error;
  }
};

// ✅ Get Single Address by ID
export const getAddressById = async (id) => {
  try {
    const response = await API.get(`/api/address/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching address:", error);
    throw error;
  }
};

// Update Address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await API.put(`/api/address/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating address:", error);
    throw error;
  }
};

// Delete Address
export const deleteAddress = async (addressId) => {
  try {
    const response = await API.delete(`/api/address/${addressId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting address:", error);
    throw error;
  }
};

// Set Default Address
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await API.patch(`/api/address/default/${addressId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error setting default address:", error);
    throw error;
  }
};
