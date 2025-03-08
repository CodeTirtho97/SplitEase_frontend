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
import { useAuth } from "@/context/authContext"; // Import useAuth for authentication

interface Friend {
  _id: string;
  fullName: string;
}

// ✅ Type for Group Object
interface Group {
  _id: string;
  name: string;
  description: string;
  type: "Travel" | "Household" | "Event" | "Work" | "Friends";
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
  refreshGroups: () => Promise<void>; // Updated to return Promise for async clarity
  refreshFriends: () => Promise<void>; // Updated to return Promise for async clarity
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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth() || {}; // Use token from AuthContext

  // ✅ Fetch Groups from API with token (Server-safe, async)
  const refreshGroups = async () => {
    if (!token) {
      console.warn("User not authenticated, returning empty groups list.");
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userGroups = await fetchUserGroups(token);
      setGroups(userGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]); // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Friends from API with token (Server-safe, async)
  const refreshFriends = async () => {
    if (!token) {
      console.warn("User not authenticated, returning empty friends list.");
      setFriends([]);
      return;
    }

    try {
      const friendsList = await fetchUserFriends(token);
      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
      setFriends([]); // Handle error gracefully
    }
  };

  // Initial load (client-side only to prevent SSR hydration issues)
  useEffect(() => {
    if (typeof window !== "undefined") {
      refreshFriends();
      refreshGroups();
    }
  }, [token]); // Re-run when token changes

  // ✅ Add a New Group (Server-safe, async)
  const addGroup = async (groupData: Omit<Group, "_id" | "createdAt">) => {
    if (!token) throw new Error("User not authenticated!");
    try {
      const newGroup = await createNewGroup(groupData, token);
      setGroups((prevGroups) => [...prevGroups, newGroup]);
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  // ✅ Edit a Group (Server-safe, async)
  const editGroup = async (groupId: string, updatedData: Partial<Group>) => {
    if (!token) throw new Error("User not authenticated!");
    try {
      const updatedGroup = await updateGroup(groupId, updatedData, token);
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId ? updatedGroup : group
        )
      );
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };

  // ✅ Delete a Group (Server-safe, async)
  const deleteGroup = async (groupId: string) => {
    if (!token) throw new Error("User not authenticated!");
    try {
      await removeGroup(groupId, token);
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  };

  // ✅ Fetch Group Details (Server-safe, async)
  const getGroupDetails = async (groupId: string): Promise<Group | null> => {
    if (!token) throw new Error("User not authenticated!");
    try {
      return await fetchGroupDetails(groupId, token);
    } catch (error) {
      console.error("Error fetching group details:", error);
      return null;
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        friends,
        loading,
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
