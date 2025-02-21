"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchUserGroups,
  fetchUserFriends,
  createNewGroup,
  updateGroup,
  removeGroup,
  fetchGroupDetails,
} from "@/utils/api/group";

interface Friend {
  _id: string;
  fullName: string;
}

// ✅ Type for Group Object
interface Group {
  _id: string;
  name: string;
  description: string;
  type: "Food" | "Entertainment" | "Travel" | "Utilities" | "Other";
  completed: boolean;
  createdBy: { fullName: string } | string;
  members: string[];
  createdAt: string;
  creator?: { fullName: string };
}

// ✅ Type for Context Provider
interface GroupContextType {
  groups: Group[];
  friends: Friend[];
  loading: boolean;
  refreshGroups: () => void;
  refreshFriends: () => void;
  addGroup: (groupData: Omit<Group, "_id" | "createdAt">) => Promise<void>;
  editGroup: (groupId: string, updatedData: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  getGroupDetails: (groupId: string) => Promise<Group | null>;
}

// ✅ Create Context
const GroupContext = createContext<GroupContextType | undefined>(undefined);

// ✅ Group Provider Component
export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Groups from API
  const refreshGroups = async () => {
    setLoading(true);
    try {
      const userGroups = await fetchUserGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Friends from API
  const refreshFriends = async () => {
    try {
      //console.log("🔍 [Frontend] Calling fetchUserFriends API...");
      const friendsList = await fetchUserFriends();
      //console.log("✅ [Frontend] Friends received:", friendsList);
      setFriends(friendsList);
    } catch (error) {
      console.error("❌ [Frontend] Error fetching friends:", error);
    }
  };

  useEffect(() => {
    refreshFriends();
    refreshGroups();
  }, []);

  // ✅ Add a New Group
  const addGroup = async (groupData: Omit<Group, "_id" | "createdAt">) => {
    try {
      const newGroup = await createNewGroup(groupData);
      setGroups((prevGroups) => [...prevGroups, newGroup]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // ✅ Edit a Group
  const editGroup = async (groupId: string, updatedData: Partial<Group>) => {
    try {
      const updatedGroup = await updateGroup(groupId, updatedData);
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId ? updatedGroup : group
        )
      );
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  // ✅ Delete a Group
  const deleteGroup = async (groupId: string) => {
    try {
      await removeGroup(groupId);
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  // ✅ Fetch Group Details
  const getGroupDetails = async (groupId: string): Promise<Group | null> => {
    try {
      return await fetchGroupDetails(groupId);
    } catch (error) {
      console.error("Error fetching group details:", error);
      return null;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        friends,
        refreshGroups,
        refreshFriends,
        addGroup,
        editGroup,
        deleteGroup,
        getGroupDetails,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

// ✅ Custom Hook for Context
export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
};
