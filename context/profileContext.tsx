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
import {
  fetchProfile,
  updateProfile,
  changePassword,
  addPaymentMethod,
  searchFriend,
  addFriend,
  deleteFriend,
  deletePayment,
} from "../utils/api/profile";
import { useAuth } from "@/context/authContext"; // Import useAuth for authentication

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Define PaymentMethod interface inline
interface PaymentMethod {
  methodType: string;
  accountDetails: string;
  _id?: string; // Optional MongoDB _id field
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
  friends: string[]; // Array of ObjectId strings (simpler for API responses)
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
  const { token, loading: authLoading } = useAuth() || {}; // Use token and loading from AuthContext

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

  const fetchUserProfile = async (): Promise<void> => {
    if (!token) {
      console.error("❌ No token found, redirecting to login...");
      router.push("/login");
      return;
    }

    try {
      //console.log("🔄 Fetching Profile Data...");
      const data = await fetchProfile(token); // Use token from AuthContext
      //console.log("✅ Profile Data Received:", data);
      setUser(data); // ✅ Update state with fetched user data
    } catch (error: any) {
      throw new Error(error.message || "Profile Fetch Error!");
    }
  };

  // 🔹 Update Profile
  const updateUserProfile = async (updatedData: {
    fullName?: string;
    gender?: string;
  }): Promise<User> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      //console.log("🔄 Sending Update Request:", updatedData);
      const response = await updateProfile(updatedData, token); // Correct parameter order: updatedData first, then token
      //console.log("✅ Update Successful:", response);
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

  // ✅ Upload or Update Profile Picture
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
      ); // ✅ Update profile pic in context
      return response.data.profilePic; // ✅ Return updated image URL
    } catch (error: any) {
      console.error("Profile Picture Upload Error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to upload image"
      );
    }
  };

  // 🔹 Update Password Function
  const updatePassword = async (passwords: {
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const response = await changePassword(passwords, token); // Correct parameter order: passwords first, then token
      setToast({ message: "Password updated successfully!", type: "success" });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update password!"
      );
    }
  };

  // 🔹 Add Payment Method
  const addPayment = async (paymentData: {
    methodType: string;
    accountDetails: string;
  }): Promise<User> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const updatedUser = await addPaymentMethod(paymentData, token); // Correct parameter order: paymentData first, then token
      setUser(updatedUser); // ✅ Update Context State with new payment methods
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Add Payment Error:");
    }
  };

  // ✅ Search for a Friend by Name
  const searchFriend = async (friendName: string): Promise<User[]> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const friends = await searchFriend(friendName); // Call without token, let profileAPI.ts handle it
      return friends || []; // ✅ Fix: Return empty array instead of null
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to search friends"
      );
    }
  };

  // ✅ Add a Friend by ID
  const addFriend = async (friendId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      const response = await addFriend(friendId); // Call without token, let profileAPI.ts handle it
      await fetchUserProfile(); // ✅ Refresh profile after adding
      setToast({ message: "Friend added successfully!", type: "success" });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add friend");
    }
  };

  // ✅ Delete a Friend by ID
  const deleteFriend = async (friendId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      await deleteFriend(friendId); // Call without token, let profileAPI.ts handle it
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete friend"
      );
    }
  };

  // ✅ Delete a Payment by ID
  const deletePayment = async (paymentId: string): Promise<void> => {
    if (!token) throw new Error("User not authenticated!");

    try {
      await deletePayment(paymentId); // Call without token, let profileAPI.ts handle it
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete payment method"
      );
    }
  };

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
