"use client";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { ProfileContext } from "@/context/profileContext";

export default function Profile() {
  const router = useRouter();

  // ✅ Ensure ProfileContext is valid before accessing user data
  const profileContext = useContext(ProfileContext);
  if (!profileContext) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // ✅ Destructure profileContext
  const {
    user,
    fetchUserProfile,
    updateUserProfile,
    uploadProfilePic,
    searchFriend,
    addFriend,
    addPayment,
    updatePassword,
  } = profileContext;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user?.fullName || "");
  const [updatedGender, setUpdatedGender] = useState(user?.gender);
  //const [profileImage, setProfileImage] = useState(user?.profilePic || null); // 🔥 Fix empty `src` issue

  // ✅ Friend Search
  const [friendName, setFriendName] = useState("");
  const [suggestedFriends, setSuggestedFriends] = useState<any[]>([]);
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

  // useEffect(() => {
  //   if (!user) {
  //     fetchUserProfile().then(() => setLoading(false));
  //   } else {
  //     setLoading(false);
  //   }
  // }, [user]);

  useEffect(() => {
    if (!user) {
      fetchUserProfile(); // ✅ Only fetch if user data is missing
    }
  }, [user]);

  useEffect(() => {
    if (user?.fullName) {
      setUpdatedName(user.fullName);
    }
  }, [user?.fullName]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Fix Profile Picture Default Fallback
  // const [profileImage, setProfileImage] = useState(() => {
  //   return user?.profilePic
  //     ? user.profilePic
  //     : updatedGender.toLowerCase() === "male"
  //     ? "/avatar_male.png"
  //     : updatedGender.toLowerCase() === "female"
  //     ? "/avatar_female.png"
  //     : "/avatar_trans.png";
  // });

  // useEffect(() => {
  //   if (!user?.profilePic) {
  //     setProfileImage(
  //       updatedGender.toLowerCase() === "male"
  //         ? "/avatar_male.png"
  //         : updatedGender.toLowerCase() === "female"
  //         ? "/avatar_female.png"
  //         : "/avatar_trans.png"
  //     );
  //   }
  // }, [updatedGender]);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.gender) {
      setUpdatedGender(user.gender.toLowerCase()); // ✅ Sync updatedGender with latest user.gender
    }
  }, [user?.gender]);

  useEffect(() => {
    if (user?.profilePic && user.profilePic.trim() !== "") {
      setProfileImage(user.profilePic); // ✅ Use uploaded profile pic if available
    } else if (updatedGender) {
      // ✅ Use gender-based default avatar
      setProfileImage(
        updatedGender.toLowerCase() === "male"
          ? "/avatar_male.png"
          : updatedGender.toLowerCase() === "female"
          ? "/avatar_female.png"
          : "/avatar_trans.png"
      );
    }
  }, [updatedGender, user?.profilePic]);

  // ✅ Handle Profile Image Upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      try {
        const updatedImage = await uploadProfilePic(file); // ✅ Upload to backend
        await fetchUserProfile(); // ✅ Refresh user data
      } catch (error) {
        setToast({ message: "Failed to upload image", type: "error" });
      }
    }
  };

  // ✅ Handle Profile Update
  const handleSaveProfile = async () => {
    try {
      const formattedGender =
        updatedGender.charAt(0).toUpperCase() +
        updatedGender.slice(1).toLowerCase();

      console.log("Saving Profile:", {
        fullName: updatedName,
        gender: formattedGender,
      });

      await updateUserProfile({
        fullName: updatedName,
        gender: formattedGender,
      });

      console.log("Sending Update Request...");

      await fetchUserProfile(); // ✅ Force fetch the latest user profile from backend

      console.log("Update Successful:", {
        fullName: updatedName,
        gender: formattedGender,
      });

      setIsEditing(false);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (error) {
      console.error("Profile Update Failed:", error);
      setToast({ message: "Failed to update profile!", type: "error" });
    }
  };

  // ✅ Optimized Friend Search with Debouncing
  const handleFriendSearch = useCallback((name: string) => {
    setFriendName(name);

    if (name.length < 2) {
      setSuggestedFriends([]);
      setToast(null);
      return;
    }

    setLoading(true);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(async () => {
      try {
        const friends = await searchFriend(name);
        setSuggestedFriends(friends);

        // ✅ Only show toast if there are no results
        if (friends.length === 0) {
          setToast({ message: "No friends to add", type: "error" });
        } else {
          setToast(null); // ✅ Hide previous error
        }
      } catch (error) {
        setSuggestedFriends([]);
        setToast({ message: "Friend search failed!", type: "error" });
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // ✅ Handle Add Friend
  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend(friendId);
      setSuggestedFriends((prev) => prev.filter((f) => f._id !== friendId)); // ✅ Remove from suggestions
      await fetchUserProfile(); // ✅ Update profile after adding friend
    } catch (error) {
      setToast({ message: "Failed to add friend!", type: "error" });
    }
  };

  // if (loading) {
  //   return (
  //     <div className="h-screen flex justify-center items-center">
  //       <p className="text-lg text-gray-600">Loading profile...</p>
  //     </div>
  //   );
  // }

  // ✅ Add Payment API Call
  const handleAddPayment = async () => {
    if (!paymentType || !paymentDetails) {
      setToast({ message: "All fields are required!", type: "error" });
      return;
    }

    try {
      await addPayment({
        methodType: paymentType,
        accountDetails: paymentDetails,
      }); // ✅ Call Context Function

      setToast({ message: "Payment method added!", type: "success" });
      setIsAddPaymentModalOpen(false);
    } catch (error: any) {
      setToast({
        message: error.message || "Failed to add payment method!",
        type: "error",
      });
    }
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

    try {
      await updatePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      }); // ✅ Call Corrected Function from Profile Context

      setToast({ message: "Password changed successfully!", type: "success" });

      // ✅ Clear fields after success
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalOpen(false);
    } catch (error: any) {
      setToast({
        message: error.message || "Failed to update password!",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (user) {
      setToast(null); // ✅ Clear toast when profile updates
    }
  }, [user]);

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-gray-100 to-gray-200 p-6">
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
              alt="Profile Picture"
              width={128}
              height={128}
              unoptimized
              className="rounded-full border-4 border-indigo-500 shadow-lg transition-all duration-300 hover:scale-105"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome, {user?.fullName?.split(" ")[0] || "User"}!
          </h2>

          {/* Image Upload */}
          {isEditing && (
            <div className="flex flex-col items-center mt-2">
              <label
                htmlFor="profilePicUpload"
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
              onChange={(e) => setUpdatedGender(e.target.value)}
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
              />
            ) : (
              <Button
                text="Edit Profile"
                onClick={() => setIsEditing(true)}
                className="text-white bg-blue-500 hover:bg-blue-600 w-full"
              />
            )}

            {/* Toggle Password Change Form
          <Button text={showPasswordFields ? "Cancel" : "Change Password"} onClick={() => setShowPasswordFields(!showPasswordFields)} className="bg-yellow-500 hover:bg-yellow-600 w-full" /> */}

            {/* Open Password Change Modal */}
            <Button
              text="Change Password"
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-yellow-500 hover:bg-yellow-600 w-full"
            />

            {/* <Button text="Logout" onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-600 w-full" /> */}
          </div>
        </div>
        {/* Saved Contacts Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 text-center border-t-4 border-green-500 relative">
          <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
            <span>👥</span> Saved Contacts
          </h3>

          {/* ✅ Show Contacts Dynamically */}
          <div className="mt-4 max-h-40 overflow-y-auto border rounded-lg p-3 text-left">
            {user?.friends && user.friends.length > 0 ? (
              user.friends.map((friend: any, index: number) => (
                <div key={index} className="mb-2 border-b pb-2">
                  <p className="font-semibold">{friend.fullName}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No contacts added yet.</p>
            )}
          </div>

          {/* Add New Contact Button */}
          <button
            onClick={() => setIsAddContactModalOpen(true)}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
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
          <div className="mt-4 max-h-40 overflow-y-auto border rounded-lg p-3 text-left">
            {user?.paymentMethods && user.paymentMethods.length > 0 ? (
              user.paymentMethods.map((method: any, index: number) => (
                <div key={index} className="mb-2 border-b pb-2">
                  <p className="font-semibold">{method.methodType}</p>
                  <p className="text-sm text-gray-500">
                    {method.accountDetails}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No payment methods added yet.
              </p>
            )}
          </div>

          {/* Add Payment Method Button */}
          <button
            onClick={() => setIsAddPaymentModalOpen(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
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
              />

              {/* Loading Indicator */}
              {loading && (
                <div className="flex justify-center mt-2">
                  <div className="w-5 h-5 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}

              {/* Friend Suggestions Dropdown */}
              {suggestedFriends.length > 0 && (
                <ul className="bg-gray-100 border border-gray-300 rounded mt-2">
                  {suggestedFriends.map((friend) => (
                    <li
                      key={friend._id}
                      className="p-2 hover:bg-indigo-200 cursor-pointer"
                      onClick={() => handleAddFriend(friend._id)}
                    >
                      {friend.fullName} - {friend.email}
                    </li>
                  ))}
                </ul>
              )}

              {/* Modal Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
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
              />

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                >
                  Add Payment
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
              />
              <input
                type="password"
                placeholder="New Password"
                className="border p-2 rounded w-full mt-3"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="border p-2 rounded w-full mt-3"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
