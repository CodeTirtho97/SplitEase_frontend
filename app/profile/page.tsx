"use client";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation"; // Use usePathname for navigation detection
import Image from "next/image";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faTimes,
  faCreditCard,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGooglePay,
  faPaypal,
  faStripe,
} from "@fortawesome/free-brands-svg-icons";
import { ProfileContext } from "@/context/profileContext";

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

export default function Profile() {
  const router = useRouter();
  const pathname = usePathname(); // Detect navigation changes

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
  const [updatedName, setUpdatedName] = useState(user?.fullName || "");
  const [updatedGender, setUpdatedGender] = useState(
    user?.gender?.toLowerCase() || "other"
  );
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profilePic || null
  );

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

  // Fetch or update user profile on mount, navigation, or context changes
  useEffect(() => {
    const loadUserProfile = async () => {
      setLoading(true);
      try {
        await fetchUserProfile(); // Fetch if user data is missing or to ensure latest data
        // Sync state with latest user data
        setUpdatedName(user?.fullName || "");
        setUpdatedGender(user?.gender?.toLowerCase() || "other");
        setProfileImage(
          user?.profilePic ||
            (user?.gender?.toLowerCase() === "male"
              ? "/avatar_male.png"
              : user?.gender?.toLowerCase() === "female"
              ? "/avatar_female.png"
              : "/avatar_trans.png")
        );
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setToast({
          message: "Failed to load profile. Please log in again.",
          type: "error",
        });
        setTimeout(() => router.push("/login"), 3000); // Redirect to login if profile fetch fails
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, pathname, fetchUserProfile, router]); // Re-run when user, pathname, or fetchUserProfile changes

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
      setUpdatedGender(updatedUser.gender?.toLowerCase() || "other"); // Sync updatedGender with the latest user data
      setIsEditing(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
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
        setFriendSearchLoading(false); // Reset local loading
        return;
      }

      setFriendSearchLoading(true); // Set local loading for friend search

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      debounceTimeout.current = setTimeout(async () => {
        try {
          const friends = await searchFriend(name);
          console.log("Friend search response:", friends);
          setSuggestedFriends(friends || []);

          if (friends.length === 0) {
            setToast({ message: "No friends found", type: "error" });
          } else {
            setToast(null); // ✅ Hide previous error
          }
        } catch (error: any) {
          console.error(
            "Friend search error:",
            error.response?.data || error.message
          );
          setSuggestedFriends([]);
          setToast({
            message:
              error.message ||
              "Failed to search friends! Try again with a different name",
            type: "error",
          });
        } finally {
          setFriendSearchLoading(false); // Reset local loading after search
        }
      }, 500);
    },
    [searchFriend]
  );

  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend(friendId);
      setSuggestedFriends((prev) => prev.filter((f) => f._id !== friendId));

      await fetchUserProfile(); // ✅ Ensure UI updates with new friends

      setIsAddContactModalOpen(false); // ✅ Close the modal first

      setTimeout(() => {
        setShowFriendToast(true); // ✅ Show toast AFTER modal is fully closed
      }, 300); // ✅ Small delay to allow re-render
    } catch (error) {
      setToast({ message: "Failed to add friend!", type: "error" });
    }
  };

  // ✅ Show toast after modal closes completely
  useEffect(() => {
    if (showFriendToast) {
      setToast({ message: "Friend added successfully!", type: "success" });

      setTimeout(() => {
        setToast(null);
        setShowFriendToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
    }
  }, [showFriendToast]);

  // ✅ Add Payment API Call
  const handleAddPayment = async () => {
    if (!paymentType || !paymentDetails) {
      setToast({ message: "All fields are required!", type: "error" });
      return;
    }

    setLoading(true); // Set global loading for this operation
    try {
      const updatedUser = await addPayment({
        methodType: paymentType,
        accountDetails: paymentDetails,
      }); // ✅ Call Context Function

      // Ensure user is defined before updating state
      if (updatedUser) {
        setUpdatedName(updatedUser.fullName || ""); // Sync name to prevent undefined errors
        setUpdatedGender(updatedUser.gender?.toLowerCase() || "other");
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
      setLoading(false); // Stop global loading
    }
  };

  // ✅ Show toast after modal closes completely
  useEffect(() => {
    if (showPaymentToast) {
      setToast({ message: "Payment added successfully!", type: "success" });

      setTimeout(() => {
        setToast(null);
        setShowPaymentToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
    }
  }, [showPaymentToast]);

  const handleCloseModal = () => {
    setIsAddPaymentModalOpen(false);
    // Reset payment fields after a small delay to ensure modal animation completes
    setTimeout(() => {
      setPaymentType(""); // Reset payment type
      setPaymentDetails(""); // Reset payment details
    }, 300); // Match the delay with your modal animation or UI transition
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

    setLoading(true); // Set global loading for this operation
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
      setToast({
        message: error.message || "Failed to change password!",
        type: "error",
      });
    } finally {
      setLoading(false); // Stop global loading
    }
  };

  useEffect(() => {
    if (showPasswordToast) {
      setToast({ message: "Password changed successfully!", type: "success" });

      setTimeout(() => {
        setToast(null);
        setShowPasswordToast(false); // ✅ Reset showToast state
      }, 5000); // ✅ Keep toast visible for 5 seconds
    }
  }, [showPasswordToast]);

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleDeleteFriend = async (friendId: string) => {
    setLoading(true); // Set global loading for this operation
    try {
      await deleteFriend(friendId);
      setToast({ message: "Friend removed successfully!", type: "success" });

      await fetchUserProfile(); // ✅ Refresh UI
    } catch (error) {
      setToast({ message: "Failed to remove friend!", type: "error" });
    } finally {
      setLoading(false); // Stop global loading
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    setLoading(true); // Set global loading for this operation
    try {
      await deletePayment(paymentId);
      setToast({ message: "Payment method removed!", type: "success" });

      await fetchUserProfile(); // ✅ Refresh UI
    } catch (error) {
      setToast({ message: "Failed to remove payment method!", type: "error" });
    } finally {
      setLoading(false); // Stop global loading
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-100 to-gray-200">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-pulse">
          <svg
            className="w-16 h-16 text-indigo-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="mt-4 text-xl font-medium text-gray-600">
            Loading Profile...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we fetch your profile data securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-100 to-gray-200 p-6"
      suppressHydrationWarning
    >
      {/* Headings Section */}
      <div className="text-center mb-8 mt-20">
        <h1 className="text-5xl font-extrabold text-gray-800 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Profile Overview
        </h1>
        <p className="text-gray-600 text-lg mt-2 mb-8">
          Manage your account details and preferences
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-24 right-6 px-5 py-3 rounded-lg shadow-md flex items-center gap-3 text-white text-sm transition-all duration-500 transform ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
            style={{
              zIndex:
                isAddContactModalOpen ||
                isAddPaymentModalOpen ||
                isPasswordModalOpen
                  ? 1050
                  : 999,
            }}
          >
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
              className="text-lg"
            />
            <span>{toast.message}</span>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center transform transition-all duration-300 hover:shadow-2xl relative border-t-4 border-indigo-500">
          {/* Profile Picture & Animated Greeting */}
          <div className="relative w-32 h-32 mx-auto mb-3">
            {/* 🔥 Fix Profile Picture src issue */}
            <Image
              src={profileImage || "/avatar_male.png"} // ✅ Use fallback image if null
              alt="Profile Picture Not Supported"
              width={128}
              height={128}
              unoptimized
              className="rounded-full border-4 border-indigo-500 shadow-lg transition-all duration-300 hover:scale-105"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.fullName ? user.fullName.split(" ")[0] : "User"}!
          </h2>

          {/* Image Upload */}
          {isEditing && (
            <div className="flex flex-col items-center mt-2">
              <label
                htmlFor="profilePicUpload"
                title={`Supported Formats : jpg, jpeg, png.\nSupported File Size : Less than 100KB.`}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer"
              >
                Upload Image
              </label>
              <input
                id="profilePicUpload"
                type="file"
                accept="image/*"
                className="hidden" // ✅ Hide input
                onChange={handleImageUpload}
              />
            </div>
          )}

          {/* User Info */}
          <div className="space-y-3 mt-4">
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:ring-2 focus:ring-indigo-300 transition-all"
              value={updatedName}
              disabled={!isEditing}
              onChange={(e) => setUpdatedName(e.target.value)}
            />

            {/* ✅ Show Email as Read-Only */}
            <input
              type="email"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center bg-gray-200 text-gray-500 cursor-not-allowed"
              value={user?.email || ""}
              disabled
            />

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:ring-2 focus:ring-indigo-300 transition-all"
              value={updatedGender}
              disabled={!isEditing}
              onChange={(e) =>
                setUpdatedGender(e.target.value as "male" | "female" | "other")
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {isEditing ? (
              <Button
                text="Save Changes"
                onClick={handleSaveProfile}
                className="text-white bg-green-500 hover:bg-green-600 w-full"
                disabled={loading}
              />
            ) : (
              <Button
                text="Edit Profile"
                onClick={() => setIsEditing(true)}
                className="text-white bg-blue-500 hover:bg-blue-600 w-full"
                disabled={loading}
              />
            )}

            {/* Open Password Change Modal - Disabled only for Google OAuth users */}
            <Button
              text="Change Password"
              onClick={() => setIsPasswordModalOpen(true)}
              className={`w-full ${
                user?.googleId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              } text-white`}
              disabled={!!user?.googleId || loading} // Disable only if googleId exists
            />
          </div>
        </div>

        {/* Saved Contacts Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 text-center border-t-4 border-green-500 relative">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <span>👥</span> Saved Contacts
          </h3>

          {/* ✅ Show Contacts Dynamically */}
          <div
            className="mt-4 max-h-100 overflow-y-auto border rounded-lg p-3 text-left"
            suppressHydrationWarning
          >
            {user?.friends && user.friends.length > 0 ? (
              user.friends.map((friendId: string, index: number) => {
                // Placeholder for friend details (assuming friendId is an ObjectId string)
                return (
                  <div
                    key={index}
                    className="mb-2 border-b pb-2 flex justify-between items-center cursor-default"
                  >
                    <Image
                      src="/avatar_friend.png"
                      alt="Friend Avatar"
                      width={40}
                      height={40}
                    />
                    <div>
                      <p className="font-semibold">
                        {friendId || "Unknown Friend"}
                      </p>
                      <p className="text-sm text-gray-500">No email</p>{" "}
                      {/* Adjust if you fetch friend details */}
                    </div>

                    {/* Delete Friend Button */}
                    <button
                      onClick={() => handleDeleteFriend(friendId)}
                      className="text-gray-400 hover:text-red-500 transition-all duration-300"
                      title="Delete Friend"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 cursor-default">
                No contacts added yet.
              </p>
            )}
          </div>

          {/* Add New Contact Button */}
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            Add New Contact
          </button>
        </div>

        {/* Linked Payment Methods Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 text-center border-t-4 border-purple-500 relative">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <span>💳</span> Linked Payment Methods
          </h3>

          {/* ✅ Show Payments Dynamically */}
          <div
            className="mt-4 max-h-100 overflow-y-auto border rounded-lg p-3 text-left"
            suppressHydrationWarning
          >
            {user && user.paymentMethods && user.paymentMethods.length > 0 ? (
              user.paymentMethods.map(
                (method: PaymentMethod, index: number) => (
                  <div
                    key={index}
                    className="mb-2 border-b pb-2 flex justify-between items-center cursor-default"
                  >
                    <div className="flex items-center gap-3">
                      {/* Dynamically Display Payment Icon */}
                      <FontAwesomeIcon
                        icon={getPaymentIcon(method.methodType)}
                        className="text-3xl text-indigo-500"
                      />
                      <p className="text-sm text-gray-500">
                        {method.accountDetails}
                      </p>
                    </div>

                    {/* Delete Payment Button */}
                    <button
                      onClick={() => handleDeletePayment(method._id || "")}
                      className="text-gray-400 hover:text-red-500 transition-all duration-300"
                      title="Delete Payment"
                      disabled={loading}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )
              )
            ) : (
              <p className="text-sm text-gray-500 cursor-default">
                No payment methods added yet.
              </p>
            )}
          </div>

          {/* Add Payment Method Button */}
          <button
            onClick={() => setIsAddPaymentModalOpen(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            disabled={loading}
          >
            Add Payment Method
          </button>
        </div>

        {/* Add Friend Modal */}
        {isAddContactModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
              <h2 className="text-xl font-bold">Add New Friend</h2>

              {/* Friend Name Search */}
              <input
                type="text"
                placeholder="Search Friend by Name"
                className="border p-2 rounded w-full mt-3"
                value={friendName}
                onChange={(e) => handleFriendSearch(e.target.value)}
                disabled={loading}
              />

              {/* Local Loading Indicator (Only in modal) */}
              {friendSearchLoading && (
                <div className="flex justify-center mt-2">
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}

              {/* Friend Suggestions Dropdown */}
              {suggestedFriends.length > 0 && (
                <ul className="bg-gray-100 border border-gray-300 rounded mt-2">
                  {suggestedFriends.map((friend: User) => (
                    <li
                      key={friend._id}
                      className="p-2 hover:bg-indigo-200 cursor-pointer"
                      onClick={() => handleAddFriend(friend._id || "")}
                    >
                      {friend.fullName} - {friend.email || "No email"}
                    </li>
                  ))}
                </ul>
              )}

              {/* Modal Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="text-gray-600"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                  onClick={() =>
                    suggestedFriends.length > 0 &&
                    handleAddFriend(suggestedFriends[0]._id || "")
                  }
                  disabled={loading || suggestedFriends.length === 0}
                >
                  Add Friend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
              <h2 className="text-xl font-bold">Add Payment Method</h2>

              <select
                className="border p-2 rounded w-full mt-3"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                disabled={loading}
              >
                <option value="">Select Payment Type</option>
                <option value="UPI">UPI</option>
                <option value="PayPal">PayPal</option>
                <option value="Stripe">Stripe</option>
              </select>

              <input
                type="text"
                placeholder="Enter Payment Details"
                className="border p-2 rounded w-full mt-3"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                disabled={loading}
              />

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="text-gray-600"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Payment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {isPasswordModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
              <h2 className="text-xl font-bold text-gray-800">
                🔒 Change Password
              </h2>

              <input
                type="password"
                placeholder="Old Password"
                className="border p-2 rounded w-full mt-3"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="New Password"
                className="border p-2 rounded w-full mt-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="border p-2 rounded w-full mt-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-gray-600"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
