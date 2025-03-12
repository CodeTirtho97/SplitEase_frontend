import axios from "axios";
import Cookies from "js-cookie"; // Using cookies instead of localStorage

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Fetch User's Groups
export const fetchUserGroups = async (token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) {
        console.warn("User not authenticated, returning empty groups list.");
        return []; // Return empty array instead of throwing error
      }
    }

    const response = await axios.get(`${API_URL}/groups/mygroups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.groups || [];
  } catch (error: any) {
    console.error("Error fetching groups:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch groups");
  }
};

// ✅ Fetch Single Group Details
export const fetchGroupDetails = async (groupId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.get(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.group) throw new Error("Group not found!");

    return response.data.group;
  } catch (error: any) {
    console.error("Error fetching group details:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch group details");
  }
};

// ✅ Create a New Group
export const createNewGroup = async (groupData: any, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.post(`${API_URL}/groups/create`, groupData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    return response.data.group;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create group");
  }
};

// ✅ Update Group (Edit Description, Members, Completion Status)
export const updateGroup = async (groupId: string, updatedData: any, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.put(`${API_URL}/groups/edit/${groupId}`, updatedData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    return response.data.updatedGroup;
  } catch (error: any) {
    console.error("Error updating group:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to update group");
  }
};

// ✅ Delete Group
export const removeGroup = async (groupId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    await axios.delete(`${API_URL}/groups/delete/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete group");
  }
};

// ✅ Fetch Group Transactions (Last 5 Completed & Top 5 Pending)
export const fetchGroupTransactions = async (groupId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.get(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data) {
      console.warn(`No transactions data found for group ${groupId}`);
      return { completed: [], pending: [] };
    }

    const completed = response.data.completedTransactions?.slice(0, 5) || [];
    const pending = response.data.pendingTransactions?.slice(0, 5) || [];

    return { completed, pending };
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { completed: [], pending: [] }; // Graceful return for 404
    }
    console.error("Unexpected error fetching transactions:", error.message);
    return { completed: [], pending: [] };
  }
};

// ✅ Calculate Who Owes Whom (Based on Both Completed and Pending Transactions)
export const calculateOwes = async (groupId: string, token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("token"); // Changed from userToken to token to match your auth implementation
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.get(`${API_URL}/groups/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Extract only pending transactions - we only care about unsettled debts
    const pendingTransactions = response.data?.pendingTransactions || [];

    if (pendingTransactions.length === 0) {
      return [];
    }

    // Create a direct debt mapping based on pending transactions only
    const directDebts: { [key: string]: { [key: string]: number } } = {};

    // Process each pending transaction to build direct debts
    pendingTransactions.forEach((txn: any) => {
      const sender = txn.sender?.fullName || "Unknown";
      const receiver = txn.receiver?.fullName || "Unknown";
      const amount = txn.amount || 0;

      // Initialize nested objects if they don't exist
      if (!directDebts[sender]) directDebts[sender] = {};
      if (!directDebts[sender][receiver]) directDebts[sender][receiver] = 0;

      // Add to the direct debt
      directDebts[sender][receiver] += amount;
    });

    // Convert the direct debts to the expected format
    const owesList: { from: string; to: string; amount: number }[] = [];

    // Iterate through all senders and their receivers
    Object.entries(directDebts).forEach(([sender, receivers]) => {
      Object.entries(receivers).forEach(([receiver, amount]) => {
        if (amount > 0) {
          owesList.push({
            from: sender,
            to: receiver,
            amount
          });
        }
      });
    });

    return owesList;
  } catch (error: any) {
    console.error("Error calculating owes:", error.message);
    return [];
  }
};

// ✅ Fetch User's Friends (From Group API)
export const fetchUserFriends = async (token?: string) => {
  try {
    // Use provided token or fall back to cookies if not provided
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) {
        console.warn("User not authenticated, returning empty friends list.");
        return []; // Return empty array instead of throwing error
      }
    }

    const response = await axios.get(`${API_URL}/groups/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.friends || [];
  } catch (error: any) {
    console.error("API Error:", error.response?.data?.message);
    return [];
  }
};