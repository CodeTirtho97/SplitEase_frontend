import axios from "axios";
import Cookies from "js-cookie"; // Using cookies instead of localStorage

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 🔹 Fetch User Profile
export const fetchProfile = async (token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.get(`${API_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` }, // Attach JWT token
    });
    return response.data;
  } catch (error: any) {
    console.error("Profile fetch error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};

// ✅ Update Profile API
export const updateProfile = async (updatedData: { fullName?: string; gender?: string }, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.put(`${API_URL}/profile/update`, updatedData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error: any) {
    console.error("Profile update error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
};

// 🔹 Change Password API Call
export const changePassword = async (
  passwords: { oldPassword: string; newPassword: string; confirmNewPassword: string }, 
  token?: string
) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }
    
    const response = await axios.put(
      `${API_URL}/profile/change-password`, 
      passwords,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Password update failed:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Password update failed!");
  }
};

// ✅ Add Payment Method API Call
export const addPaymentMethod = async (
  paymentData: { methodType: string; accountDetails: string }, 
  token?: string
) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.post(`${API_URL}/profile/add-payment`, paymentData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error("Add payment error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to add payment method!");
  }
};

// 🔹 Search Friend by Name
export const searchFriend = async (friendName: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.post(
      `${API_URL}/profile/search-friends`,
      { friendName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Check the structure of the response to ensure we're returning the right data
    if (response.data && response.data.friends && Array.isArray(response.data.friends)) {
      return response.data.friends; // Return matched users
    } else {
      console.error("Unexpected response format:", response.data);
      return []; // Return empty array if no friends property
    }
  } catch (error: any) {
    console.error("Friend search error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Error searching friend");
  }
};

// 🔹 Add Friend API Call
export const addFriend = async (friendId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.post(
      `${API_URL}/profile/add-friend`,
      { friendId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Add friend error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to add friend");
  }
};

// ✅ Delete a Friend by ID
export const deleteFriend = async (friendId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    const response = await axios.delete(
      `${API_URL}/profile/delete-friend/${friendId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Delete friend error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to delete friend");
  }
};

// ✅ Delete a Payment by ID
export const deletePayment = async (paymentId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token");
      if (!token) {
        throw new Error("User not authenticated!");
      }
    }

    // Log the request details for debugging
    console.log(`Deleting payment with ID: ${paymentId}`);
    console.log(`API URL: ${API_URL}/profile/delete-payment/${paymentId}`);
    
    const response = await axios.delete(
      `${API_URL}/profile/delete-payment/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Delete payment response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Delete payment error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete payment method");
  }
};