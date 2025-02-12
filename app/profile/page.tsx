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

  // Handle Logout
  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
      
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

          {/* Toggle Password Change Form */}
          <Button text={showPasswordFields ? "Cancel" : "Change Password"} onClick={() => setShowPasswordFields(!showPasswordFields)} className="bg-yellow-500 hover:bg-yellow-600 w-full" />

          {/* Password Change Section - Hidden Initially */}
          {showPasswordFields && (
            <div className="text-left text-gray-700 mt-4 transition-all">
              <h3 className="font-semibold mb-2">Update Password</h3>
              <input type="password" placeholder="Old Password" className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <input type="password" placeholder="New Password" className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirm New Password" className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button text="Update Password" onClick={handleChangePassword} className="bg-yellow-500 hover:bg-yellow-600 w-full" />
            </div>
          )}

          <Button text="Logout" onClick={handleLogout} className="text-white bg-red-500 hover:bg-red-600 w-full" />
        </div>
      </div>
    </div>
  );
}