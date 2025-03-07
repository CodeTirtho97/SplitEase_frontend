"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/authContext"; // Import useAuth for authentication

// Import API functions - note the renamed imports to avoid naming conflicts
import {
  fetchProfile as apiFetchProfile,
  updateProfile as apiUpdateProfile,
  changePassword as apiChangePassword,
  addPaymentMethod as apiAddPaymentMethod,
  searchFriend as apiSearchFriend,
  addFriend as apiAddFriend,
  deleteFriend as apiDeleteFriend,
  deletePayment as apiDeletePayment,
} from "../utils/api/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define PaymentMethod interface inline
interface PaymentMethod {
  methodType: string;
  accountDetails: string;
  _id?: string; // Optional MongoDB _id field
}

interface Friend {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

// Define User interface inline
interface User {
  _id?: string; // Optional MongoDB _id field
  fullName: string;
  email: string;
  gender?: "Male" | "Female" | "Other"; // Optional, enum from schema
  password?: string; // Optional, only for non-Google users
  resetPasswordToken?: string; // Optional
  resetPasswordExpires?: Date; // Optional
  googleId?: string; // Optional, for Google OAuth users
  profilePic: string; // Default is "", but can be updated
  friends: Friend[] | string[]; // Array of ObjectId strings (simpler for API responses)
  paymentMethods: PaymentMethod[]; // Array of payment methods
  createdAt?: Date; // Optional, from timestamps
  updatedAt?: Date; // Optional, from timestamps
}

interface ProfileContextType {
  user: User | null;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updatedData: {
    fullName?: string;
    gender?: string;
  }) => Promise<User>;
  uploadProfilePic: (imageFile: File) => Promise<string>;
  updatePassword: (passwords: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => Promise<void>;
  addPayment: (paymentData: {
    methodType: string;
    accountDetails: string;
  }) => Promise<User>;
  addFriend: (friendId: string) => Promise<void>;
  searchFriend: (friendName: string) => Promise<User[]>;
  deleteFriend: (friendId: string) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { token } = useAuth() || {}; // Use token from AuthContext

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (token) {
      console.log("Token available, attempting to fetch profile");
      fetchUserProfile().catch((error) => {
        console.error(
          "Failed to load profile on context initialization:",
          error
        );
      });
    }
  }, [token]);

  const fetchUserProfile = async (): Promise<void> => {
    if (!token) {
      console.error("No token found, cannot fetch profile");
      return;
    }

    try {
      console.log(
        "Fetching Profile Data with token:",
        token ? "Token exists" : "No token"
      );
      const data = await apiFetchProfile(token); // Use token from AuthContext
      console.log("Profile Data Received:", data);
      setUser(data); // Update state with fetched user data
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      throw new Error(error.message || "Profile Fetch Error!");
    }
  };

  // Update Profile
  const updateUserProfile = async (updatedData: {
    fullName?: string;
    gender?: string;
  }): Promise<User> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const response = await apiUpdateProfile(updatedData, token);
      setUser(response); // Update user state with new data
      return response;
    } catch (error: any) {
      console.error(
        "Profile Update Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  };

  // Upload or Update Profile Picture
  const uploadProfilePic = async (imageFile: File): Promise<string> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const formData = new FormData();
      formData.append("profilePic", imageFile);

      const response = await axios.post(`${API_URL}/profile/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prevUser: User | null) =>
        prevUser ? { ...prevUser, profilePic: response.data.profilePic } : null
      ); // Update profile pic in context
      return response.data.profilePic; // Return updated image URL
    } catch (error: any) {
      console.error("Profile Picture Upload Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  };

  // Update Password Function
  const updatePassword = async (passwords: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const response = await apiChangePassword(passwords, token);
      setToast({ message: "Password updated successfully!", type: "success" });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update password!"
      );
    }
  };

  // Add Payment Method
  const addPayment = async (paymentData: {
    methodType: string;
    accountDetails: string;
  }): Promise<User> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const result = await apiAddPaymentMethod(paymentData, token);
      // Instead of replacing the entire user object, merge the new payment methods
      setUser((prevUser) => {
        if (!prevUser) return result;
        return {
          ...prevUser,
          paymentMethods: result.paymentMethods || prevUser.paymentMethods,
        };
      });
      return result;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Add Payment Error:");
    }
  };

  // Search for a Friend by Name
  const searchFriend = async (friendName: string): Promise<User[]> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const friends = await apiSearchFriend(friendName, token);
      return friends || []; // Fix: Return empty array instead of null
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search friends"
      );
    }
  };

  // Add a Friend by ID
  const addFriend = async (friendId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const response = await apiAddFriend(friendId, token);
      await fetchUserProfile(); // Refresh profile after adding
      setToast({ message: "Friend added successfully!", type: "success" });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add friend");
    }
  };

  // Delete a Friend by ID
  const deleteFriend = async (friendId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      await apiDeleteFriend(friendId, token);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete friend"
      );
    }
  };

  // Delete a Payment by ID
  const deletePayment = async (paymentId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      await apiDeletePayment(paymentId, token);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete payment method"
      );
    }
  };

  // Initialize profile data whenever token changes
  useEffect(() => {
    if (token) {
      console.log("Token available, attempting to fetch profile");
      fetchUserProfile().catch((error) => {
        console.error(
          "Failed to load profile on context initialization:",
          error
        );
      });
    }
  }, [token]);

  return (
    <ProfileContext.Provider
      value={{
        user,
        fetchUserProfile,
        updateUserProfile,
        uploadProfilePic,
        updatePassword,
        addPayment,
        addFriend,
        searchFriend,
        deleteFriend,
        deletePayment,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Export a custom hook for using the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
