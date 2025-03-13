"use client";

import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faCreditCard,
  faEdit,
  faKey,
  faUserFriends,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
} from "@fortawesome/free-brands-svg-icons";
import { ProfileContext } from "@/context/profileContext";
import UnifiedLoadingScreen from "@/components/UnifiedLoadingScreen";
import { useAuth } from "@/context/authContext"; // Import useAuth explicitly

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
  googleId?: string | null; // Optional, for Google OAuth users - ensure it allows null
  profilePic: string; // Default is "", but can be updated
  friends: Friend[] | string[]; // Array of Friend objects or ObjectId strings
  paymentMethods: PaymentMethod[]; // Array of payment methods
  createdAt?: Date; // Optional, from timestamps
  updatedAt?: Date; // Optional, from timestamps
}

export default function Profile() {
  const router = useRouter();
  const { token } = useAuth(); // Directly access the token from AuthContext

  // ✅ Ensure ProfileContext is valid before accessing user data
  const profileContext = useContext(ProfileContext);
  if (!profileContext) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // ✅ Destructure profileContext with User type
  const {
    user,
    fetchUserProfile,
    updateUserProfile,
    uploadProfilePic,
    searchFriend,
    addFriend,
    addPayment,
    updatePassword,
    deleteFriend,
    deletePayment,
  } = profileContext as {
    user: User | null;
    fetchUserProfile: () => Promise<void>;
    updateUserProfile: (updatedData: {
      fullName?: string;
      gender?: string;
    }) => Promise<User>;
    uploadProfilePic: (imageFile: File) => Promise<string>;
    searchFriend: (friendName: string) => Promise<User[]>;
    addFriend: (friendId: string) => Promise<void>;
    addPayment: (paymentData: {
      methodType: string;
      accountDetails: string;
    }) => Promise<User>;
    updatePassword: (passwords: {
      oldPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => Promise<void>;
    deleteFriend: (friendId: string) => Promise<void>;
    deletePayment: (paymentId: string) => Promise<void>;
  };

  const [loading, setLoading] = useState(true); // Global loading for initial profile fetch
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedGender, setUpdatedGender] = useState<
    "male" | "female" | "other"
  >("other");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // ✅ Friend Search (Local state for modal loading)
  const [friendName, setFriendName] = useState("");
  const [suggestedFriends, setSuggestedFriends] = useState<User[]>([]);
  const [friendSearchLoading, setFriendSearchLoading] = useState(false); // Local loading for friend search
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // ✅ Payment
  const [paymentType, setPaymentType] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");

  // ✅ Password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ Toast Notifications
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [showFriendToast, setShowFriendToast] = useState(false);
  const [showPaymentToast, setShowPaymentToast] = useState(false);
  const [showPasswordToast, setShowPasswordToast] = useState(false);

  // Fix: Use state to track profile fetch attempts
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState(false);

  const [updatingOperation, setUpdatingOperation] = useState<string | null>(
    null
  );

  // Fixed useEffect for profile loading
  useEffect(() => {
    let mounted = true;

    const loadUserProfile = async () => {
      if (!token) {
        console.log("No token available, waiting...");
        return;
      }

      setLoading(true);
      setProfileFetchAttempted(true);

      try {
        await fetchUserProfile();
        if (mounted) {
          console.log("Profile data loaded successfully");
          setProfileFetchError(false);
          setLoading(false); // Make sure this line is always executed when data is received
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (mounted) {
          setProfileFetchError(true);
          setLoading(false); // Also update loading state on error
        }
      }
    };

    // Only attempt to load profile if we have a token and haven't tried yet
    if (token && !profileFetchAttempted) {
      loadUserProfile();
    } else if (user) {
      // If we already have user data, make sure loading is false
      setLoading(false);
      console.log("Loading state set to false");
    }

    return () => {
      mounted = false;
    };
  }, [token, profileFetchAttempted, fetchUserProfile, user]);

  // Sync state with user changes from context, but only if user exists
  useEffect(() => {
    if (!user) return;

    const newName = user.fullName || "";
    const newGender =
      (user.gender?.toLowerCase() as "male" | "female" | "other") || "other";
    const newProfileImage =
      user.profilePic ||
      (user.gender?.toLowerCase() === "male"
        ? "/avatar_male.png"
        : user.gender?.toLowerCase() === "female"
        ? "/avatar_female.png"
        : "/avatar_trans.png");

    // Update only if values have changed (avoids redundant renders)
    setUpdatedName(newName);
    setUpdatedGender(newGender);
    setProfileImage(newProfileImage);
  }, [user]);

  const hasRedirected = useRef(false);

  // Redirect if no user and we've attempted to fetch
  useEffect(() => {
    if (loading || hasRedirected.current) return;

    // If we've tried to fetch profile and there's no user, redirect to login
    if (!user && profileFetchAttempted && !loading && !hasRedirected.current) {
      const timer = setTimeout(() => {
        hasRedirected.current = true;
        setToast({
          message: "Session expired. Please log in again.",
          type: "error",
        });
        router.push("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, loading, profileFetchAttempted, router]);

  // Auto-hide toast after delay
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Handle Profile Image Upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const allowedFormats = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 100 * 1024; // 100KB

      // ✅ Validate File Format
      if (!allowedFormats.includes(file.type)) {
        setToast({
          message: "Invalid format! Only JPG, JPEG, PNG are allowed.",
          type: "error",
        });
        return;
      }

      // ✅ Validate File Size
      if (file.size > maxSize) {
        setToast({
          message: "File too large! Max size: 100KB.",
          type: "error",
        });
        return;
      }

      // ✅ Show real-time preview before saving
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL); // ✅ Show image preview before backend upload

      try {
        const updatedImage = await uploadProfilePic(file); // ✅ Upload to backend
        await fetchUserProfile(); // ✅ Refresh user data
        setToast({
          message: "Profile picture updated successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setToast({ message: "Failed to upload image", type: "error" });
        setProfileImage(
          user?.gender?.toLowerCase() === "male"
            ? "/avatar_male.png"
            : user?.gender?.toLowerCase() === "female"
            ? "/avatar_female.png"
            : "/avatar_trans.png"
        ); // Revert to default on error
      }
    }
  };

  // ✅ Handle Profile Update
  const handleSaveProfile = async () => {
    try {
      const formattedGender =
        updatedGender && updatedGender.trim() !== ""
          ? ((updatedGender.charAt(0).toUpperCase() +
              updatedGender.slice(1).toLowerCase()) as
              | "Male"
              | "Female"
              | "Other")
          : "Other";

      const updatedUser = await updateUserProfile({
        fullName: updatedName,
        gender: formattedGender,
      });

      await fetchUserProfile(); // ✅ Force fetch the latest user profile from backend to ensure UI updates
      console.log("Profile updated, new user data:", updatedUser);
      setUpdatedGender(
        (updatedUser.gender?.toLowerCase() as "male" | "female" | "other") ||
          "other"
      ); // Sync updatedGender with the latest user data
      setIsEditing(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setToast({ message: "Failed to update profile!", type: "error" });
    }
  };

  // ✅ Optimized Friend Search with Debouncing (Local loading state)
  const handleFriendSearch = useCallback(
    async (name: string) => {
      setFriendName(name);

      if (name.length < 2) {
        setSuggestedFriends([]);
        setToast(null);
        setFriendSearchLoading(false);
        return;
      }

      setFriendSearchLoading(true);

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(async () => {
        try {
          // Ensure proper error handling and correct parameter passing
          const friends = await searchFriend(name);
          console.log("Friend search response:", friends);

          // Check if friends is an array
          if (Array.isArray(friends)) {
            setSuggestedFriends(friends);

            if (friends.length === 0) {
              setToast({ message: "No friends found", type: "error" });
            } else {
              setToast(null);
            }
          } else {
            // Handle case where API doesn't return expected array
            console.error("Friends search returned unexpected data:", friends);
            setSuggestedFriends([]);
            setToast({ message: "Error searching friends", type: "error" });
          }
        } catch (error: any) {
          console.error("Friend search error:", error);
          setSuggestedFriends([]);
          setToast({
            message: error.message || "Failed to search friends!",
            type: "error",
          });
        } finally {
          setFriendSearchLoading(false);
        }
      }, 500);
    },
    [searchFriend]
  );

  const handleAddFriend = async (friendId: string) => {
    try {
      setUpdatingOperation("Adding contact...");
      await addFriend(friendId);
      setSuggestedFriends((prev) => prev.filter((f) => f._id !== friendId));

      await fetchUserProfile(); // ✅ Ensure UI updates with new friends

      setIsAddContactModalOpen(false); // ✅ Close the modal first

      setTimeout(() => {
        setShowFriendToast(true); // ✅ Show toast AFTER modal is fully closed
      }, 300); // ✅ Small delay to allow re-render
    } catch (error) {
      console.error("Error adding friend:", error);
      setToast({ message: "Failed to add friend!", type: "error" });
    } finally {
      setUpdatingOperation(null);
    }
  };

  // ✅ Show toast after modal closes completely
  useEffect(() => {
    if (showFriendToast) {
      setToast({ message: "Friend added successfully!", type: "success" });

      const timer = setTimeout(() => {
        setToast(null);
        setShowFriendToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showFriendToast]);

  // ✅ Add Payment API Call
  const handleAddPayment = async () => {
    if (!paymentType || !paymentDetails) {
      setToast({ message: "All fields are required!", type: "error" });
      return;
    }

    setUpdatingOperation("Adding payment method...");
    try {
      const updatedUser = await addPayment({
        methodType: paymentType,
        accountDetails: paymentDetails,
      }); // ✅ Call Context Function

      // Ensure user is defined before updating state
      if (updatedUser) {
        console.log("Payment added, new user data:", updatedUser);
        setUpdatedName(updatedUser.fullName || "");
        setUpdatedGender(
          (updatedUser.gender?.toLowerCase() as "male" | "female" | "other") ||
            "other"
        );
        setProfileImage(
          updatedUser.profilePic ||
            (updatedUser.gender?.toLowerCase() === "male"
              ? "/avatar_male.png"
              : updatedUser.gender?.toLowerCase() === "female"
              ? "/avatar_female.png"
              : "/avatar_trans.png")
        );
      }

      await fetchUserProfile(); // ✅ Fetch updated user data to ensure UI sync and prevent hydration issues
      setToast({ message: "Payment method added!", type: "success" });

      setIsAddPaymentModalOpen(false);

      setTimeout(() => {
        setShowPaymentToast(true); // ✅ Show toast AFTER modal is fully closed
      }, 300); // ✅ Small delay to allow re-render
    } catch (error: any) {
      console.error(
        "Payment addition error:",
        error.response?.data || error.message
      );
      setToast({
        message:
          error.message ||
          "Unable to add payment! Try with a different payment ID!",
        type: "error",
      });
    } finally {
      setUpdatingOperation(null);
    }
  };

  // ✅ Show toast after modal closes completely
  useEffect(() => {
    if (showPaymentToast) {
      setToast({ message: "Payment added successfully!", type: "success" });

      const timer = setTimeout(() => {
        setToast(null);
        setShowPaymentToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showPaymentToast]);

  const handleCloseContactModal = () => {
    setIsAddContactModalOpen(false);
    setTimeout(() => {
      setFriendName("");
      setSuggestedFriends([]);
    }, 300);
  };

  // ✅ Handle Password Change
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setToast({ message: "All password fields are required!", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match!", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setToast({
        message: "Password must be at least 8 characters long!",
        type: "error",
      });
      return;
    }

    setUpdatingOperation("Updating password...");
    try {
      await updatePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });

      setIsPasswordModalOpen(false);

      setTimeout(() => {
        setShowPasswordToast(true); // ✅ Show toast AFTER modal is fully closed
      }, 300); // ✅ Ensures re-render completes before showing toast

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      setToast({
        message: error.message || "Failed to change password!",
        type: "error",
      });
    } finally {
      setUpdatingOperation(null);
    }
  };

  useEffect(() => {
    if (showPasswordToast) {
      setToast({ message: "Password changed successfully!", type: "success" });

      const timer = setTimeout(() => {
        setToast(null);
        setShowPasswordToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showPasswordToast]);

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleDeleteFriend = async (friendId: string) => {
    setUpdatingOperation("Removing contact...");
    try {
      await deleteFriend(friendId);
      setToast({ message: "Friend removed successfully!", type: "success" });

      await fetchUserProfile(); // ✅ Refresh UI
    } catch (error) {
      console.error("Error deleting friend:", error);
      setToast({ message: "Failed to remove friend!", type: "error" });
    } finally {
      setUpdatingOperation(null);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      setUpdatingOperation("Removing payment method...");
      await deletePayment(paymentId);

      // Simply reload the profile data after deletion
      await fetchUserProfile();

      setToast({ message: "Payment method removed!", type: "success" });
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      setToast({
        message: error.message || "Failed to remove payment method!",
        type: "error",
      });
    } finally {
      setUpdatingOperation(null);
    }
  };

  const getPaymentIcon = (methodType: string) => {
    switch (methodType.toLowerCase()) {
      case "upi":
        return faGooglePay; // Google Pay icon
      case "paypal":
        return faPaypal; // PayPal icon
      case "stripe":
        return faStripe; // Stripe icon
      default:
        return faCreditCard; // Default credit card icon
    }
  };

  // Add a retry mechanism
  const handleRetryFetch = async () => {
    setLoading(true);
    setProfileFetchError(false);
    setProfileFetchAttempted(false); // Reset the attempted flag to try again

    try {
      await fetchUserProfile();
      setToast({ message: "Profile loaded successfully!", type: "success" });
    } catch (error) {
      console.error("Error retrying profile fetch:", error);
      setProfileFetchError(true);
      setToast({
        message: "Failed to load profile. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear payment form data when modal is closed
    if (!isAddPaymentModalOpen) {
      setPaymentType("");
      setPaymentDetails("");
    }

    // Clear friend search data when modal is closed
    if (!isAddContactModalOpen) {
      setFriendName("");
      setSuggestedFriends([]);
    }

    // Clear password change data when modal is closed
    if (!isPasswordModalOpen) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [isAddPaymentModalOpen, isAddContactModalOpen, isPasswordModalOpen]);

  const UpdateLoadingOverlay = ({ message = "Updating..." }) => (
    <div className="fixed inset-0 z-50 bg-indigo-900/30 backdrop-blur-sm flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"></path>
              <polyline points="12 12 7 12 10 15"></polyline>
              <polyline points="12 12 12 8 9 10"></polyline>
            </svg>
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 text-center mt-1">
          Please wait while we process your request
        </p>
      </div>
    </div>
  );

  const isGoogleUser = !!user?.googleId;
  console.log("Google ID check:", {
    googleIdValue: user?.googleId,
    googleIdType: typeof user?.googleId,
    hasGoogleIdProperty: user && "googleId" in user,
    isGoogleUserResult: !!user?.googleId,
  });

  if (loading) {
    return (
      <UnifiedLoadingScreen
        message="Loading Your Profile"
        section="profile"
        showTips={false}
      />
    );
  }

  // Error state with retry button
  if (profileFetchError) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-indigo-50 to-purple-50">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md">
          <svg
            className="w-16 h-16 text-red-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-xl font-medium text-gray-600">
            Error Loading Profile
          </p>
          <p className="text-sm text-gray-500 mb-4 text-center">
            There was an issue loading your profile data. Please try again.
          </p>
          <button
            onClick={handleRetryFetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="fixed inset-0 opacity-10 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <pattern
              id="smallGrid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                opacity="0.7"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl px-6 md:px-8 py-6 md:py-8 z-10 mt-20 md:mt-28">
        {/* Profile Header - Lighter color gradient */}
        <div className="bg-gradient-to-r from-indigo-500/90 to-purple-500/90 text-white p-8 rounded-2xl mb-10 flex flex-col md:flex-row items-center shadow-xl">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-white/20 p-1 shadow-lg relative overflow-hidden">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={112}
                  height={112}
                  className="rounded-full object-cover transition-transform group-hover:scale-105"
                  unoptimized
                  onError={() => {
                    // Fallback to default avatar if image fails to load
                    setProfileImage(
                      user?.gender?.toLowerCase() === "male"
                        ? "/avatar_male.png"
                        : user?.gender?.toLowerCase() === "female"
                        ? "/avatar_female.png"
                        : "/avatar_trans.png"
                    );
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-indigo-200 text-indigo-600 text-4xl font-bold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              {isEditing && (
                <label
                  htmlFor="profilePicUpload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="w-5 h-5 text-white"
                  />
                </label>
              )}
              <input
                id="profilePicUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <div className="mt-2 text-xs text-center text-white/80">
                Click to update
              </div>
            )}
          </div>

          <div className="ml-0 md:ml-8 text-center md:text-left mt-4 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold">
              {isEditing ? (
                <input
                  type="text"
                  className="bg-white/10 rounded px-3 py-1 text-white text-2xl md:text-3xl w-full md:w-auto"
                  value={updatedName}
                  onChange={(e) => setUpdatedName(e.target.value)}
                />
              ) : (
                <>Welcome, {user?.fullName ? user.fullName : "User"}!</>
              )}
            </h1>
            <p className="text-white/80 mt-1">{user?.email}</p>

            {isEditing && (
              <div className="mt-3">
                <select
                  className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white mr-2"
                  value={updatedGender}
                  onChange={(e) =>
                    setUpdatedGender(
                      e.target.value as "male" | "female" | "other"
                    )
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 md:mt-0 md:ml-auto space-y-2 md:space-y-3 flex flex-col">
            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                className="bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 px-6 py-2 rounded-lg flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 px-6 py-2 rounded-lg flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Profile
              </button>
            )}

            {/* Only show Change Password button for non-Google users */}
            {!isGoogleUser && (
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-medium transition-all duration-300 px-6 py-2 rounded-lg flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faKey} className="mr-2" />
                Change Password
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contacts Section Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
            <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center">
                <div className="bg-green-500 p-2 rounded-full text-white mr-3">
                  <FontAwesomeIcon icon={faUserFriends} />
                </div>
                <h2 className="font-bold text-lg text-gray-800">
                  Saved Contacts
                </h2>
              </div>
              <button
                onClick={() => setIsAddContactModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-300 flex items-center"
              >
                <span className="mr-1">+</span> Add Contact
              </button>
            </div>

            <div className="p-6">
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                {user?.friends && user.friends.length > 0 ? (
                  user.friends.map((friend, index) => {
                    // Use proper type checking
                    const isFriendObject = typeof friend !== "string";

                    // Extract values safely with type assertions
                    const friendId = isFriendObject
                      ? (friend as Friend)._id
                      : friend;
                    const friendName = isFriendObject
                      ? (friend as Friend).fullName
                      : "Unknown Friend";
                    const friendEmail = isFriendObject
                      ? (friend as Friend).email
                      : "No email";
                    const friendProfilePic =
                      isFriendObject && (friend as Friend).profilePic
                        ? (friend as Friend).profilePic
                        : "/avatar_friend.png";

                    return (
                      <div
                        key={typeof friendId === "string" ? friendId : index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200 flex-shrink-0">
                          <Image
                            src={friendProfilePic || "/avatar_friend.png"}
                            alt={friendName}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                            unoptimized
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/avatar_friend.png";
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {friendName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {friendEmail}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteFriend(friendId as string)}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2"
                          title="Remove Contact"
                          disabled={!!updatingOperation}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <FontAwesomeIcon
                      icon={faUserFriends}
                      className="text-3xl mb-2 text-gray-300"
                    />
                    <p>No contacts added yet</p>
                    <p className="text-sm">
                      Add contacts to start splitting expenses
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <div className="border-b px-6 py-4 flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center">
                <div className="bg-purple-500 p-2 rounded-full text-white mr-3">
                  <FontAwesomeIcon icon={faCreditCard} />
                </div>
                <h2 className="font-bold text-lg text-gray-800">
                  Payment Methods
                </h2>
              </div>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-300 flex items-center"
              >
                <span className="mr-1">+</span> Add Payment
              </button>
            </div>

            <div className="p-6">
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
                {user &&
                user.paymentMethods &&
                user.paymentMethods.length > 0 ? (
                  user.paymentMethods.map(
                    (method: PaymentMethod, index: number) => (
                      <div
                        key={index}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-purple-100 rounded-full text-purple-600">
                          <FontAwesomeIcon
                            icon={getPaymentIcon(method.methodType)}
                            className="text-xl"
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-800">
                            {method.methodType}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {method.accountDetails}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeletePayment(method._id || "")}
                          className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2"
                          title="Remove Payment Method"
                          disabled={!!updatingOperation}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="text-3xl mb-2 text-gray-300"
                    />
                    <p>No payment methods added yet</p>
                    <p className="text-sm">
                      Add payment methods to easily settle expenses
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============= Modals ============= */}
        {/* Add Friend Modal */}
        {isAddContactModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-green-500 text-white px-6 py-4 flex items-center">
                <FontAwesomeIcon icon={faUserFriends} className="mr-3" />
                <h2 className="text-xl font-bold">Add New Contact</h2>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Friend by Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter name (min. 2 characters)"
                      className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={friendName}
                      onChange={(e) => handleFriendSearch(e.target.value)}
                      disabled={friendSearchLoading}
                    />
                    {friendSearchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Friend Suggestions */}
                {suggestedFriends.length > 0 && (
                  <div className="mt-4 border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <ul className="divide-y">
                      {suggestedFriends.map((friend: User) => (
                        <li
                          key={friend._id}
                          className="flex items-center p-3 hover:bg-green-50 cursor-pointer transition-colors"
                          onClick={() =>
                            !updatingOperation &&
                            handleAddFriend(friend._id || "")
                          }
                        >
                          <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-full mr-3">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{friend.fullName}</p>
                            <p className="text-sm text-gray-500">
                              {friend.email || "No email"}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseContactModal}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
                    disabled={!!updatingOperation}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                    onClick={() =>
                      !updatingOperation &&
                      suggestedFriends.length > 0 &&
                      handleAddFriend(suggestedFriends[0]._id || "")
                    }
                    disabled={
                      !!updatingOperation || suggestedFriends.length === 0
                    }
                  >
                    {updatingOperation ? "Adding..." : "Add Contact"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-purple-500 text-white px-6 py-4 flex items-center">
                <FontAwesomeIcon icon={faCreditCard} className="mr-3" />
                <h2 className="text-xl font-bold">Add Payment Method</h2>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    disabled={!!updatingOperation}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="UPI">UPI</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Stripe">Stripe</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Details
                  </label>
                  <input
                    type="text"
                    placeholder="Enter payment details/ID"
                    className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    disabled={!!updatingOperation}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
                    disabled={!!updatingOperation}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPayment}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
                    disabled={
                      !!updatingOperation || !paymentType || !paymentDetails
                    }
                  >
                    {updatingOperation ? "Adding..." : "Add Payment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              <div className="bg-yellow-500 text-white px-6 py-4 flex items-center">
                <FontAwesomeIcon icon={faKey} className="mr-3" />
                <h2 className="text-xl font-bold">Change Password</h2>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={!!updatingOperation}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={!!updatingOperation}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!!updatingOperation}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 transition-colors"
                    disabled={!!updatingOperation}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed"
                    disabled={
                      !!updatingOperation ||
                      !oldPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword ||
                      newPassword.length < 8
                    }
                  >
                    {updatingOperation ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-24 right-6 px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 text-white text-sm transition-all duration-500 transform z-50 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
              className="text-lg"
            />
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Loading overlay */}
        {updatingOperation && (
          <UpdateLoadingOverlay message={updatingOperation} />
        )}
      </div>
    </div>
  );
}
