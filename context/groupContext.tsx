"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  fetchGroups,
  fetchFriends,
  Friend, // Import the Friend type
  Group,
  GroupStats,
  NewGroup,
  fetchGroupStats,
  fetchGroupsByIds,
  archiveGroup as apiArchiveGroup,
  toggleGroupFavorite as apiToggleGroupFavorite,
} from "@/utils/api/group";
import { useAuth } from "./authContext";

interface GroupContextType {
  groups: Group[];
  favoriteGroups: Group[];
  archivedGroups: Group[]; // Keep this
  recentGroups: Group[];
  friends: Friend[]; // Update to use Friend type
  activeGroup: Group | null;
  activeGroupStats: GroupStats | null;
  groupsLoading: boolean;
  friendsLoading: boolean;
  statsLoading: boolean;

  refreshGroups: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  setActiveGroup: (group: Group | null) => void;
  refreshGroupStats: (groupId: string) => Promise<void>;
  getRecentlyViewedGroups: () => Promise<void>;
  archiveGroup: (groupId: string) => Promise<void>;
  toggleGroupFavorite: (groupId: string) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth() || { token: null };
  const [groups, setGroups] = useState<Group[]>([]);
  const [favoriteGroups, setFavoriteGroups] = useState<Group[]>([]);
  const [archivedGroups, setArchivedGroups] = useState<Group[]>([]); // Add this
  const [recentGroups, setRecentGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]); // Update type
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeGroupStats, setActiveGroupStats] = useState<GroupStats | null>(
    null
  );
  const [groupsLoading, setGroupsLoading] = useState<boolean>(true);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const refreshGroups = useCallback(async () => {
    if (!token) return;

    setGroupsLoading(true);
    try {
      const fetchedGroups = await fetchGroups(token);
      setGroups(fetchedGroups);

      // Separate groups into different categories
      const favorites = fetchedGroups.filter((group) => group.isFavorite);
      const archived = fetchedGroups.filter((group) => group.isArchived);

      setFavoriteGroups(favorites);
      setArchivedGroups(archived); // Set archived groups

      setGroupsLoading(false);
    } catch (error) {
      console.error("Error refreshing groups in context:", error);
      setGroupsLoading(false);
    }
  }, [token]);

  const archiveGroup = useCallback(
    async (groupId: string) => {
      if (!token) return;
      try {
        // Use the imported API method
        await apiArchiveGroup(groupId, token);
        await refreshGroups();
      } catch (error) {
        console.error("Error archiving group:", error);
        // Consider adding user-facing error handling
        throw error; // Re-throw to allow caller to handle
      }
    },
    [token, refreshGroups]
  );

  const toggleGroupFavorite = useCallback(
    async (groupId: string) => {
      if (!token) return;
      try {
        // Use the imported API method
        await apiToggleGroupFavorite(groupId, token);
        await refreshGroups();
      } catch (error) {
        console.error("Error toggling group favorite:", error);
        // Consider adding user-facing error handling
        throw error; // Re-throw to allow caller to handle
      }
    },
    [token, refreshGroups]
  );

  const refreshFriends = useCallback(async () => {
    if (!token) return;

    setFriendsLoading(true);
    try {
      const fetchedFriends = await fetchFriends(token);
      setFriends(fetchedFriends);
      setFriendsLoading(false);
    } catch (error) {
      console.error("Error refreshing friends in context:", error);
      setFriendsLoading(false);
    }
  }, [token]);

  const refreshGroupStats = useCallback(
    async (groupId: string) => {
      if (!token || !groupId) return;

      setStatsLoading(true);
      try {
        const stats = await fetchGroupStats(groupId, token);
        setActiveGroupStats(stats);
        setStatsLoading(false);
      } catch (error) {
        console.error("Error refreshing group stats:", error);
        setStatsLoading(false);
      }
    },
    [token]
  );

  // Get recently viewed groups from local storage
  const getRecentlyViewedGroups = useCallback(async () => {
    if (!token) return;

    try {
      const storedGroups = localStorage.getItem("recentlyViewedGroups");
      if (storedGroups) {
        const groupIds = JSON.parse(storedGroups);
        if (groupIds.length > 0) {
          const fetchedGroups = await fetchGroupsByIds(groupIds, token);
          setRecentGroups(fetchedGroups);
        }
      }
    } catch (error) {
      console.error("Error fetching recently viewed groups:", error);
    }
  }, [token]);

  // Update recently viewed groups when active group changes
  useEffect(() => {
    if (activeGroup) {
      try {
        // Get existing recently viewed groups
        const storedGroups = localStorage.getItem("recentlyViewedGroups");
        let groupIds: string[] = storedGroups ? JSON.parse(storedGroups) : [];

        // Remove the current group if it exists already
        groupIds = groupIds.filter((id) => id !== activeGroup._id);

        // Add the current group to the beginning
        groupIds.unshift(activeGroup._id);

        // Keep only the most recent 5
        groupIds = groupIds.slice(0, 5);

        // Store the updated list
        localStorage.setItem("recentlyViewedGroups", JSON.stringify(groupIds));
      } catch (error) {
        console.error("Error updating recently viewed groups:", error);
      }
    }
  }, [activeGroup]);

  // Reset active group when unmounting
  useEffect(() => {
    return () => {
      setActiveGroup(null);
      setActiveGroupStats(null);
    };
  }, []);

  // Initialize data when component mounts
  useEffect(() => {
    if (token) {
      refreshGroups();
      refreshFriends();
      getRecentlyViewedGroups();
    }
  }, [token, refreshGroups, refreshFriends, getRecentlyViewedGroups]);

  const contextValue: GroupContextType = {
    groups,
    favoriteGroups,
    archivedGroups, // Include in context value
    recentGroups,
    friends,
    activeGroup,
    activeGroupStats,
    groupsLoading,
    friendsLoading,
    statsLoading,
    refreshGroups,
    refreshFriends,
    setActiveGroup,
    refreshGroupStats,
    getRecentlyViewedGroups,
    archiveGroup,
    toggleGroupFavorite,
  };

  return (
    <GroupContext.Provider value={contextValue}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
}
