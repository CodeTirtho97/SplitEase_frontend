"use client";

import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  addPaymentMethod,
} from "../utils/api/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProfileContextType {
  user: any;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updatedData: {
    fullName?: string;
    gender?: string;
  }) => Promise<void>;
  uploadProfilePic: (imageFile: File) => Promise<void>;
  updatePassword: (passwords: any) => Promise<void>;
  addPayment: (paymentData: {
    methodType: string;
    accountDetails: string;
  }) => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  searchFriend: (friendName: string) => Promise<any>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

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

  const fetchUserProfile = async () => {
    try {
      console.log("🔄 Fetching Profile Data...");
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("❌ No token found, redirecting to login...");
        router.push("/login");
        return;
      }

      const data = await fetchProfile(token);
      console.log("✅ Profile Data Received:", data);

      setUser(data); // ✅ Update state with fetched user data
    } catch (error) {
      console.error("❌ Profile Fetch Error:", error);
    }
  };

  // 🔹 Update Profile
  const updateUserProfile = async (updatedData: {
    fullName?: string;
    gender?: string;
  }) => {
    try {
      const token = localStorage.getItem("userToken");
      console.log("🔄 Sending Update Request:", updatedData);

      const response = await axios.put(
        `${API_URL}/profile/update`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Update Successful:", response.data);
      return response.data;
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
  const uploadProfilePic = async (imageFile: File) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("User not authenticated!");

      const formData = new FormData();
      formData.append("profilePic", imageFile);

      const response = await axios.post(`${API_URL}/profile/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser((prevUser: any) => ({
        ...prevUser,
        profilePic: response.data.profilePic, // ✅ Update profile pic in context
      }));

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
  }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        setToast({ message: "User not authenticated!", type: "error" });
        return;
      }

      await changePassword(token, passwords); // ✅ Calls the correct API function from `utils/api/profile.ts`

      setToast({ message: "Password updated successfully!", type: "success" });
    } catch (error: any) {
      console.error("Password Change Error:", error);
      setToast({
        message: error.message || "Failed to update password!",
        type: "error",
      });
    }
  };

  // 🔹 Add Payment Method
  const addPayment = async (paymentData: {
    methodType: string;
    accountDetails: string;
  }) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) return;

      const updatedUser = await addPaymentMethod(token, paymentData); // ✅ API Call
      setUser(updatedUser); // ✅ Update Context State with new payment methods
    } catch (error) {
      console.error("Add Payment Error:", error);
    }
  };

  // ✅ Search for a Friend by Name
  const searchFriend = async (friendName: string) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("User not authenticated!");

      const response = await axios.post(
        `${API_URL}/profile/search-friends`, // ✅ FIXED: Ensure correct route
        { friendName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.friends || []; // ✅ Fix: Return empty array instead of null
    } catch (error: any) {
      console.error(
        "Friend Search Error:",
        error.response?.data?.message || "Failed to search friends"
      );

      return [];
    }
  };

  const addFriend = async (friendId: string) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("User not authenticated!");

      const response = await axios.post(
        `${API_URL}/profile/add-friend`,
        { friendId }, // ✅ Ensure correct payload
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchUserProfile(); // ✅ Refresh profile after adding
      setToast({ message: "Friend added successfully!", type: "success" });

      return response.data;
    } catch (error: any) {
      console.error(
        "Add Friend Error:",
        error.response?.data?.message || "Failed to add friend"
      );
      setToast({ message: "Failed to add friend!", type: "error" });
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
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
