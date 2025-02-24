import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Fetch User's Groups
export const fetchUserGroups = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    const response = await axios.get(`${API_URL}/groups/mygroups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.groups;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch groups");
  }
};

// ✅ Fetch Single Group Details
export const fetchGroupDetails = async (groupId: string) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

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
export const createNewGroup = async (groupData: any) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    const response = await axios.post(`${API_URL}/groups/create`, groupData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    return response.data.group;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create group");
  }
};

// ✅ Update Group (Edit Description, Members, Completion Status)
export const updateGroup = async (groupId: string, updatedData: any) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    console.log("🚀 Sending update request to:", `${API_URL}/groups/edit/${groupId}`);

    const response = await axios.put(
      `${API_URL}/groups/edit/${groupId}`,
      updatedData,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );

    console.log("✅ Group Updated Successfully:", response.data);
    return response.data.updatedGroup;
  } catch (error: any) {
    console.error("❌ Error updating group:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Failed to update group");
  }
};

// ✅ Delete Group
export const removeGroup = async (groupId: string) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    await axios.delete(`${API_URL}/groups/delete/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return true;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete group");
  }
};

// ✅ Fetch Group Transactions (Last 5 Completed & Top 5 Pending)
export const fetchGroupTransactions = async (groupId: string) => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    const response = await axios.get(`${API_URL}/transactions/group/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data) {
      console.warn(`⚠️ No transactions data found for group ${groupId}`);
      return { completed: [], pending: [] };
    }

    const completed = response.data.completedTransactions?.slice(0, 5) || [];
    const pending = response.data.pendingTransactions?.slice(0, 5) || [];

    if (completed.length === 0 && pending.length === 0) {
      console.log(`ℹ️ No transactions available for group ${groupId}`);
    }

    return { completed, pending };
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log(`ℹ️ No transactions found for group ${groupId}`);
      return { completed: [], pending: [] }; // ✅ Graceful return instead of an error
    }

    console.error("❌ Unexpected error fetching transactions:", error.message);
    return { completed: [], pending: [] };
  }
};

// ✅ Calculate Who Owes Whom (Based on Transactions)
export const calculateOwes = async (groupId: string) => {
  try {
    const transactions = await fetchGroupTransactions(groupId);

    if (transactions.completed.length === 0) {
      console.log(`ℹ️ No settled transactions available for group ${groupId}`);
      return [];
    }

    const memberTotals: { [key: string]: number } = {};
    transactions.completed.forEach((txn: any) => {
      if (!memberTotals[txn.sender]) memberTotals[txn.sender] = 0;
      if (!memberTotals[txn.receiver]) memberTotals[txn.receiver] = 0;
      memberTotals[txn.sender] -= txn.amount;
      memberTotals[txn.receiver] += txn.amount;
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

      owesList.push({
        from: debtor.name,
        to: creditor.name,
        amount: settleAmount,
      });

      creditor.balance -= settleAmount;
      debtor.balance += settleAmount;

      if (creditor.balance === 0) creditors.shift();
      if (debtor.balance === 0) debtors.shift();
    }

    if (owesList.length === 0) {
      console.log(`ℹ️ No outstanding balances to settle for group ${groupId}`);
    }

    return owesList;
  } catch (error: any) {
    console.error("❌ Unexpected error calculating owes:", error.message);
    return [];
  }
};

// ✅ Fetch User's Friends (From Group API)
export const fetchUserFriends = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User not authenticated!");

    //console.log("📡 [Frontend] Sending request to backend...");

    const response = await axios.get(`${API_URL}/groups/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    //console.log("✅ [Frontend] Response received:", response.data);
    return response.data.friends || [];
  } catch (error: any) {
    console.error("❌ [Frontend] API Error:", error.response?.data?.message);
    return [];
  }
};