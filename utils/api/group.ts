import axios from "axios";
import Cookies from "js-cookie"; // Using cookies instead of localStorage

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Fetch User's Groups
export const fetchUserGroups = async (token?: string) => {
  try {
    // Get token from cookies instead of localStorage
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

    return response.data.groups;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch groups");
  }
};

// ✅ Fetch Single Group Details
export const fetchGroupDetails = async (groupId: string, token?: string) => {
  try {
    // Get token from cookies instead of localStorage
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
    console.error("Error fetching group details:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch group details");
  }
};

// ✅ Create a New Group
export const createNewGroup = async (groupData: any, token?: string) => {
  try {
    // Get token from cookies instead of localStorage
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
    // Get token from cookies instead of localStorage
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const response = await axios.put(
      `${API_URL}/groups/edit/${groupId}`,
      updatedData,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );

    return response.data.updatedGroup;
  } catch (error: any) {
    console.error("Error updating group:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to update group");
  }
};

// ✅ Delete Group
export const removeGroup = async (groupId: string, token?: string) => {
  try {
    // Get token from cookies instead of localStorage
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
    // Get token from cookies instead of localStorage
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
      return { completed: [], pending: [] }; // Graceful return
    }

    console.error("Unexpected error fetching transactions:", error.message);
    return { completed: [], pending: [] };
  }
};

// ✅ Calculate Who Owes Whom (Based on Both Completed and Pending Transactions)
export const calculateOwes = async (groupId: string, token?: string) => {
  try {
    // Get token from cookies instead of localStorage
    if (!token) {
      token = Cookies.get("userToken");
      if (!token) throw new Error("User not authenticated!");
    }

    const transactions = await fetchGroupTransactions(groupId, token);

    if (transactions.completed.length === 0 && transactions.pending.length === 0) {
      return [];
    }

    const memberTotals: { [key: string]: number } = {};
    transactions.completed.forEach((txn: any) => {
      if (!memberTotals[txn.sender?.fullName]) memberTotals[txn.sender?.fullName] = 0;
      if (!memberTotals[txn.receiver?.fullName]) memberTotals[txn.receiver?.fullName] = 0;
      memberTotals[txn.sender?.fullName] -= txn.amount;
      memberTotals[txn.receiver?.fullName] += txn.amount;
    });
    transactions.pending.forEach((txn: any) => {
      if (!memberTotals[txn.sender?.fullName]) memberTotals[txn.sender?.fullName] = 0;
      if (!memberTotals[txn.receiver?.fullName]) memberTotals[txn.receiver?.fullName] = 0;
      memberTotals[txn.sender?.fullName] -= txn.amount;
      memberTotals[txn.receiver?.fullName] += txn.amount;
    });

    const balances = Object.entries(memberTotals).map(([name, balance]) => ({
      name,
      balance,
    }));

    const owesList: { from: string; to: string; amount: number }[] = [];
    let creditors = balances.filter((m) => m.balance > 0).sort((a, b) => b.balance - a.balance);
    let debtors = balances.filter((m) => m.balance < 0).sort((a, b) => a.balance - b.balance);

    while (creditors.length > 0 && debtors.length > 0) {
      let creditor = creditors[0];
      let debtor = debtors[0];
      let settleAmount = Math.min(creditor.balance, Math.abs(debtor.balance));

      owesList.push({ from: debtor.name, to: creditor.name, amount: settleAmount });

      creditor.balance -= settleAmount;
      debtor.balance += settleAmount;

      if (creditor.balance === 0) creditors.shift();
      if (debtor.balance === 0) debtors.shift();
    }

    return owesList;
  } catch (error: any) {
    console.error("Error calculating owes:", error.message);
    return [];
  }
};

// ✅ Fetch User's Friends (From Group API)
export const fetchUserFriends = async (token?: string) => {
  try {
    // Get token from cookies instead of localStorage
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