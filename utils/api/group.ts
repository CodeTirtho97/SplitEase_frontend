import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Types
export interface GroupMember {
  _id: string;
  fullName: string;
  email: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  type: "Travel" | "Household" | "Event" | "Work" | "Friends";
  members: GroupMember[];
  createdBy: GroupMember;
  completed: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
  expensesCount?: number;
  totalExpenses?: number;
  pendingAmount?: number;
}

export interface NewGroup {
  name: string;
  description?: string;
  type: "Travel" | "Household" | "Event" | "Work" | "Friends";
  members: string[];
}

export interface GroupStats {
  totalExpenses: number;
  totalAmount: number;
  settledAmount: number;
  pendingAmount: number;
  memberContributions: {
    memberId: string;
    memberName: string;
    amount: number;
    percentage: number;
  }[];
}

export interface OweEntry {
  from: string;
  to: string;
  amount: number;
}

export interface Friend {
  _id: string;
  fullName: string;
  email: string;
}

// Fetch All Groups
export const fetchGroups = async (token: string): Promise<Group[]> => {
  try {
    const response = await axios.get(`${API_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching groups:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch groups');
  }
};

// Create New Group
export const createNewGroup = async (groupData: NewGroup, token: string): Promise<Group> => {
  try {
    const response = await axios.post(`${API_URL}/groups`, groupData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating group:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create group');
  }
};

// Update Group
export const updateGroup = async (groupId: string, updateData: any, token: string): Promise<Group> => {
  try {
    const response = await axios.put(`${API_URL}/groups/${groupId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating group:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to update group');
  }
};

// Fetch Group by ID
export const fetchGroupById = async (groupId: string, token: string): Promise<Group> => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching group:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch group');
  }
};

// Delete Group
export const removeGroup = async (groupId: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error('Error deleting group:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete group');
  }
};

// Archive Group (Soft Delete)
export const archiveGroup = async (groupId: string, token: string): Promise<Group> => {
  try {
    const response = await axios.put(`${API_URL}/groups/${groupId}/archive`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error archiving group:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to archive group');
  }
};

// Fetch Group Transactions
export const fetchGroupTransactions = async (groupId: string, token: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/transactions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching group transactions:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch group transactions');
  }
};

// Calculate Who Owes Whom
export const calculateOwes = async (groupId: string, token: string): Promise<OweEntry[]> => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/owes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error calculating owes:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to calculate who owes whom');
  }
};

// Get Group Stats
export const fetchGroupStats = async (groupId: string, token: string): Promise<GroupStats> => {
  try {
    const response = await axios.get(`${API_URL}/groups/${groupId}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching group stats:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch group statistics');
  }
};

// Get Multiple Groups by IDs
export const fetchGroupsByIds = async (groupIds: string[], token: string): Promise<Group[]> => {
  try {
    const response = await axios.post(
      `${API_URL}/groups/batch`,
      { groupIds },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching groups batch:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch groups batch');
  }
};

// Toggle Group Favorite Status
export const toggleGroupFavorite = async (groupId: string, token: string): Promise<Group> => {
  try {
    const response = await axios.put(`${API_URL}/groups/${groupId}/favorite`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error toggling group favorite:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to toggle group favorite');
  }
};

export const fetchFriends = async (token: string): Promise<Friend[]> => {
  try {
    const response = await axios.get(`${API_URL}/friends`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching friends:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch friends');
  }
};