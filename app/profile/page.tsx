"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Test User",
    email: "test@example.com",
    gender: "male",
    avatar: "/avatar_male.png",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [updatedName, setUpdatedName] = useState(user.name);
  const [updatedEmail, setUpdatedEmail] = useState(user.email);
  const [updatedGender, setUpdatedGender] = useState(user.gender);
  const [profileImage, setProfileImage] = useState(user.avatar);

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🚀 Custom Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 🚀 Temporary disable login check
  useEffect(() => {
    /*
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login"); // Redirect if not logged in
    }
    */
  }, [router]);

  // Handle Gender Change - Update Avatar in Real Time
  useEffect(() => {
    const genderLower = updatedGender.toLowerCase(); // Normalize for consistency
    setProfileImage(
      genderLower === "male" 
        ? "/avatar_male.png" 
        : genderLower === "female" 
        ? "/avatar_female.png" 
        : "/avatar_trans.png"
    );
  }, [updatedGender]);

  // Handle Profile Image Upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const imageUrl = URL.createObjectURL(event.target.files[0]);
      setProfileImage(imageUrl);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = () => {
    setUser({ ...user, name: updatedName, email: updatedEmail, gender: updatedGender, avatar: profileImage });
    setIsEditing(false);
    setToast({ message: "Profile updated successfully!", type: "success" });
  };

  // Handle Password Change
  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setToast({ message: "All password fields are required!", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ message: "Passwords do not match!", type: "error" });
      return;
    }
    setToast({ message: "Password changed successfully!", type: "success" });
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordFields(false);
  };

  // // Handle Logout
  // const handleLogout = () => {
  //   router.push("/login");
  // };

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
        <p className="text-gray-600 text-lg mt-2 mb-8">Manage your account details and preferences</p>
      </div>

  {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 px-5 py-3 rounded-lg shadow-md flex items-center gap-3 text-white text-sm transition-all duration-500 transform ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          <FontAwesomeIcon icon={toast.type === "success" ? faCheckCircle : faExclamationCircle} className="text-lg" />
          <span>{toast.message}</span>
        </div>    
      )}

      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center transform transition-all duration-300 hover:shadow-2xl relative border-t-4 border-indigo-500">
        {/* Profile Picture & Animated Greeting */}
        <div className="relative w-32 h-32 mx-auto mb-3">
          <Image src={profileImage} alt="Profile Picture" width={128} height={128} className="rounded-full border-4 border-indigo-500 shadow-lg transition-all duration-300 hover:scale-105" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.name}!</h2>

        {/* Image Upload */}
        {isEditing && (
          <input
            type="file"
            accept="image/*"
            className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold hover:file:bg-gray-100 cursor-pointer mb-3"
            onChange={handleImageUpload}
          />
        )}

        {/* User Info */}
        <div className="space-y-3 mt-4">
          <input type="text" className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:ring-2 focus:ring-indigo-300 transition-all" value={updatedName} disabled={!isEditing} onChange={(e) => setUpdatedName(e.target.value)} />

          <input type="email" className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:ring-2 focus:ring-indigo-300 transition-all" value={updatedEmail} disabled={!isEditing} onChange={(e) => setUpdatedEmail(e.target.value)} />

          <select className="border border-gray-300 rounded-lg px-3 py-2 w-full text-center focus:ring-2 focus:ring-indigo-300 transition-all" value={updatedGender} disabled={!isEditing} onChange={(e) => setUpdatedGender(e.target.value)}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          {isEditing ? (
            <Button text="Save Changes" onClick={handleSaveProfile} className="text-white bg-green-500 hover:bg-green-600 w-full" />
          ) : (
            <Button text="Edit Profile" onClick={() => setIsEditing(true)} className="text-white bg-blue-500 hover:bg-blue-600 w-full" />
          )}

          {/* Toggle Password Change Form
          <Button text={showPasswordFields ? "Cancel" : "Change Password"} onClick={() => setShowPasswordFields(!showPasswordFields)} className="bg-yellow-500 hover:bg-yellow-600 w-full" /> */}

          {/* Open Password Change Modal */}
          <Button text="Change Password" onClick={() => setIsPasswordModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 w-full" />

          {/* <Button text="Logout" onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-600 w-full" /> */}
        </div>
      </div>
      {/* Saved Contacts Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 text-center border-t-4 border-green-500 relative">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <span>👥</span> Saved Contacts
        </h3>

        {/* Scrollable Contact List */}
        <div className="mt-4 max-h-40 overflow-y-auto border rounded-lg p-3 text-left">
          <div className="mb-2 border-b pb-2">
            <p className="font-semibold">Alice Johnson</p>
            <p className="text-sm text-gray-500">alice@example.com</p>
            <p className="text-sm text-gray-500">+91 9876543210</p>
          </div>
          {/* Add more contacts dynamically here */}
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

        {/* Scrollable Payment Methods List */}
        <div className="mt-4 max-h-40 overflow-y-auto border rounded-lg p-3 text-left">
          <div className="mb-2 border-b pb-2">
            <p className="font-semibold">UPI</p>
            <p className="text-sm text-gray-500">alice@upi</p>
          </div>
          <div className="mb-2 border-b pb-2">
            <p className="font-semibold">PayPal</p>
            <p className="text-sm text-gray-500">bob@paypal.com</p>
          </div>
          {/* Add more payment methods dynamically here */}
        </div>

        {/* Add Payment Method Button */}
        <button
          onClick={() => setIsAddPaymentModalOpen(true)}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Add Payment Method
        </button>
      </div>

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-xl font-bold">Add New Contact</h2>

            <input type="text" placeholder="Name" className="border p-2 rounded w-full mt-3" />
            <input type="email" placeholder="Email" className="border p-2 rounded w-full mt-3" />
            <input type="tel" placeholder="Contact" className="border p-2 rounded w-full mt-3" />
            <input type="text" placeholder="Payment Info" className="border p-2 rounded w-full mt-3" />

            <div className="mt-4 flex justify-between">
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-gray-600">
                Cancel
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
                Save
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

            <select className="border p-2 rounded w-full mt-3">
              <option value="">Select Payment Type</option>
              <option value="UPI">UPI</option>
              <option value="PayPal">PayPal</option>
              <option value="Stripe">Stripe</option>
              <option value="NetBanking">NetBanking</option>
            </select>

            <input type="text" placeholder="Payment Details" className="border p-2 rounded w-full mt-3" />

            <div className="mt-4 flex justify-between">
              <button onClick={() => setIsAddPaymentModalOpen(false)} className="text-gray-600">
                Cancel
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h2 className="text-xl font-bold text-gray-800">🔒 Change Password</h2>

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
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-600">
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