import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Fetch User Profile
export const fetchProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }, // Attach JWT token
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

// ✅ Update Profile API
export const updateProfile = async (token: string, updatedData: { fullName?: string; gender?: string }) => {
  try {
    const response = await axios.put(`${API_URL}/profile/update`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

// 🔹 Change Password API Call
export const changePassword = async (
  token: string,
  passwords: { oldPassword: string; newPassword: string; confirmNewPassword: string }
) => {
  try {
    //console.log("🔹 Sending Password Update Request...");
    
    const response = await axios.put(
      `${API_URL}/profile/change-password`, 
      passwords,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, // ✅ Ensure correct headers
      }
    );

    //console.log("✅ Password Change Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Password Update Failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Password update failed!");
  }
};

// ✅ Add Payment Method API Call
export const addPaymentMethod = async (token: string, paymentData: { methodType: string; accountDetails: string }) => {
  try {
    const response = await axios.post(`${API_URL}/profile/add-payment`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }, // Attach JWT token
    });

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add payment method!");
  }
};

// 🔹 Search Friend by Name
export const searchFriend = async (friendName: string) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    const response = await axios.post(
      `${API_URL}/profile/search-friends`,
      { friendName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.friends; // Return matched users
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error searching friend");
  }
};

// 🔹 Add Friend API Call
const addFriendAPI = async (friendId: string) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    const response = await axios.post(
      `${API_URL}/profile/add-friend`,
      { friendId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to add friend");
  }
};

export { addFriendAPI as addFriend };