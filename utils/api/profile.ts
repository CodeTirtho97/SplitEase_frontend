import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/profile";

// 🔹 Fetch User Profile
export const fetchUserProfile = async (token: string) => {
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 🔹 Upload Profile Picture
export const uploadProfilePicture = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("profilePic", file);

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};