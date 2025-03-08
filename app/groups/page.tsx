"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCheckCircle,
  faExclamationCircle,
  faUser,
  faUsers,
  faRupeeSign,
  faList,
  faThLarge,
  faSearch,
  faStar,
  faStarHalfAlt,
  faFilter,
  faSort,
  faSortAmountDown,
  faSortAmountUp,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useGroups } from "@/context/groupContext";
import {
  NewGroup,
  createNewGroup,
  updateGroup,
  removeGroup,
  fetchGroupTransactions,
  calculateOwes,
} from "@/utils/api/group";
import Cookies from "js-cookie"; // Using cookies instead of localStorage
import { useAuth } from "@/context/authContext"; // Import useAuth for authentication

export default function Groups() {
  const router = useRouter();
  const { groups, refreshGroups, friends, refreshFriends, groupsLoading } =
    useGroups();
  const { token, loading: authLoading } = useAuth() || {}; // Use useAuth for authentication state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupTransactions, setGroupTransactions] = useState<any>({
    completed: [],
    pending: [],
  });
  const [owesList, setOwesList] = useState<any[]>([]);

  // New state variables for enhanced UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "activity">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Multi-step form state
  const [formStep, setFormStep] = useState(1);

  // Fetch Who Owes Whom Data (Client-side only)
  useEffect(() => {
    const fetchOwesData = async () => {
      if (selectedGroup && typeof window !== "undefined" && token) {
        try {
          const owesData = await calculateOwes(selectedGroup._id, token); // Use token from AuthContext
          setOwesList(owesData);
        } catch (error) {
          console.error("Error calculating owes:", error);
        }
      }
    };

    fetchOwesData();
  }, [selectedGroup, token]);

  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    description: "",
    type: "Friends", // This is now type-safe
    members: [],
  });

  const [groupDescription, setGroupDescription] = useState("");
  const [completedStatus, setCompletedStatus] = useState(false);
  const [newMembers, setNewMembers] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  // Sync selected group data (Client-side only)
  useEffect(() => {
    if (selectedGroup && typeof window !== "undefined") {
      if (!selectedGroup.members || !Array.isArray(selectedGroup.members)) {
        console.warn(
          "Members array is missing or invalid!",
          selectedGroup.members
        );
        return;
      }

      const filteredMembers = selectedGroup.members.filter(
        (member: any) => member._id !== selectedGroup.createdBy._id
      );

      setNewMembers(filteredMembers.map((member: any) => member._id));
      setGroupDescription(selectedGroup.description || "");
      setCompletedStatus(selectedGroup.completed || false);
    }
  }, [selectedGroup]);

  // Fetch friends when modal opens (Client-side only)
  useEffect(() => {
    if (isModalOpen && typeof window !== "undefined" && token) {
      refreshFriends(); // Calls the API only when modal opens, using token from groupContext
    }
  }, [isModalOpen, refreshFriends, token]);

  // Fetch groups on page load (Client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      refreshGroups(); // Use token from AuthContext via groupContext
    }
  }, [refreshGroups, token]);

  // Log groups for debugging (Client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Groups Data:", groups);
    }
  }, [groups]);

  const avatarMap: { [key: string]: string } = {
    Travel: "/travel_group.png",
    Household: "/household_group.png",
    Event: "/event_group.png",
    Work: "/work_group.png",
    Friends: "/friends_group.png",
  };

  const handleGroupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Type assertion ensures only valid group types are used
    const selectedType = e.target.value as NewGroup["type"];
    setNewGroup((prevGroup) => ({
      ...prevGroup,
      type: selectedType,
    }));
  };

  useEffect(() => {
    if (toast && typeof window !== "undefined") {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle form step navigation
  const goToNextStep = () => {
    if (formStep === 1 && !newGroup.name.trim()) {
      setToast({ message: "Group name is required!", type: "error" });
      return;
    }

    if (formStep === 2 && newGroup.members.length === 0) {
      setToast({ message: "At least one member is required!", type: "error" });
      return;
    }

    setFormStep(formStep + 1);
  };

  const goToPrevStep = () => {
    setFormStep(formStep - 1);
  };

  // Create New Group (Client-side only)
  const handleAddGroup = async () => {
    if (typeof window !== "undefined" && token) {
      if (!newGroup.name.trim() || newGroup.members.length === 0) {
        setToast({ message: "Group name & members required!", type: "error" });
        return;
      }

      try {
        await createNewGroup(newGroup, token); // Use token from AuthContext
        setIsModalOpen(false);
        refreshGroups();
        setToast({ message: "Group created successfully!", type: "success" });

        // Reset fields
        setNewGroup({
          name: "",
          description: "",
          type: "Friends",
          members: [],
        });
        setFormStep(1);
      } catch (error: any) {
        setToast({ message: error.message, type: "error" });
      }
    }
  };

  // Edit Group Details (Client-side only)
  const handleEditGroup = (group: any) => {
    if (typeof window !== "undefined") {
      setSelectedGroup(group);
      setGroupDescription(group.description || "");
      setCompletedStatus(group.completed || false);
      setNewMembers(
        group.members
          .filter((member: any) =>
            typeof member === "object"
              ? member._id !== group.createdBy._id
              : member !== group.createdBy._id
          )
          .map((member: any) =>
            typeof member === "object" ? member._id : member
          )
      );
      setIsEditModalOpen(true);
    }
  };

  const handleSaveGroup = async () => {
    if (typeof window !== "undefined" && token) {
      if (newMembers.length < 1) {
        setToast({
          message:
            "A group must have at least 2 members (including the creator)!",
          type: "error",
        });
        return;
      }

      const updatedData = {
        description: groupDescription,
        completed: completedStatus,
        members: [...newMembers, selectedGroup.createdBy._id], // Ensure creator is included
      };

      try {
        await updateGroup(selectedGroup._id, updatedData, token); // Use token from AuthContext
        setIsEditModalOpen(false);
        refreshGroups();
        setToast({ message: "Group updated successfully!", type: "success" });
      } catch (error) {
        console.error("Error updating group:", error);
        setToast({ message: "Failed to update group!", type: "error" });
      }
    }
  };

  // Delete Group (Client-side only)
  const handleDeleteGroup = (group: any) => {
    if (typeof window !== "undefined") {
      setSelectedGroup(group);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (typeof window !== "undefined" && selectedGroup && token) {
      try {
        await removeGroup(selectedGroup._id, token); // Use token from AuthContext
        setIsDeleteModalOpen(false);
        refreshGroups();
        setToast({ message: "Group deleted successfully!", type: "success" });
      } catch (error: any) {
        setToast({ message: error.message, type: "error" });
      }
    }
  };

  // Fetch Group Transactions and "Who Owes Whom" when viewing a group (Client-side only)
  const handleViewGroup = async (group: any) => {
    if (typeof window !== "undefined" && token) {
      if (!group || !group._id) {
        console.error("Invalid group selected:", group);
        setToast({ message: "Invalid group selected!", type: "error" });
        return;
      }

      setSelectedGroup(group);
      setIsViewModalOpen(true);

      try {
        const transactions = await fetchGroupTransactions(group._id, token); // Use token from AuthContext
        setGroupTransactions(transactions || { completed: [], pending: [] });

        const owes = await calculateOwes(group._id, token); // Use token from AuthContext
        setOwesList(owes || []);
      } catch (error: any) {
        console.error("Error fetching transactions:", error.message || error);
        setToast({ message: "Failed to fetch transactions!", type: "error" });
        setGroupTransactions({ completed: [], pending: [] });
        setOwesList([]);
      }
    }
  };

  // Calculate group activity level for UI indicators
  const calculateActivityLevel = (group: any) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Check if created recently (within a week)
    const createdDate = new Date(group.createdAt);
    if (createdDate > oneWeekAgo) return "high";

    // Default to medium for active, low for completed
    return group.completed ? "low" : "medium";
  };

  // Filter and sort groups based on user selection
  const filteredAndSortedGroups = () => {
    return [...groups]
      .filter((group) => {
        // Apply search filter
        if (
          searchTerm &&
          !group.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Apply type filter
        if (filterType !== "all" && group.type !== filterType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === "date") {
          return sortOrder === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "activity") {
          const activityLevelMap = { high: 3, medium: 2, low: 1 };
          const aLevel = activityLevelMap[calculateActivityLevel(a)];
          const bLevel = activityLevelMap[calculateActivityLevel(b)];
          return sortOrder === "asc" ? aLevel - bLevel : bLevel - aLevel;
        }
        return 0;
      });
  };

  // Split groups into active and completed
  const activeGroups = filteredAndSortedGroups().filter(
    (group) => !group.completed
  );
  const completedGroups = filteredAndSortedGroups().filter(
    (group) => group.completed
  );

  if (authLoading || groupsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100 pt-20 justify-center items-center">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/90 rounded-xl shadow-lg backdrop-blur-md animate-pulse">
          <svg
            className="w-16 h-16 text-indigo-500 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <p className="mt-4 text-xl font-medium text-gray-700">
            Loading Groups...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we fetch your groups securely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-gray-100 pt-20"
      suppressHydrationWarning
    >
      {/* Sidebar */}
      <Sidebar activePage="groups" />

      <div className="flex-1 p-8">
        {/* Toast Notification (Client-side only) */}
        {toast && typeof window !== "undefined" && (
          <div
            className={`fixed top-24 right-6 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm transition-all duration-500 transform ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "info"
                ? "bg-blue-500"
                : "bg-red-500"
            }`}
            style={{ zIndex: 10000 }}
          >
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
              className="text-lg"
            />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Groups
          </h1>
          <Button
            text="Add Group"
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-xl flex items-center gap-2 text-xl"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Group</span>
          </Button>
        </div>

        {/* Group Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Total Groups
            </h2>
            <p className="text-2xl font-bold text-indigo-600">
              {groups.length}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Active Groups
            </h2>
            <p className="text-2xl font-bold text-green-600">
              {groups.filter((group) => !group.completed).length}
            </p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Completed Groups
            </h2>
            <p className="text-2xl font-bold text-gray-500">
              {groups.filter((group) => group.completed).length}
            </p>
          </div>
        </div>

        {/* Search, Filter and View Control Bar */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative group">
              <button
                onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
              >
                <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
                <span className="text-gray-700">Filter</span>
              </button>

              {isFilterModalOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 p-2">
                  <div className="p-2">
                    <div className="font-medium text-gray-800 mb-2">
                      Group Type
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="all">All Types</option>
                      <option value="Travel">Travel</option>
                      <option value="Household">Household</option>
                      <option value="Event">Event</option>
                      <option value="Work">Work</option>
                      <option value="Friends">Friends</option>
                    </select>
                  </div>

                  <div className="p-2">
                    <div className="font-medium text-gray-800 mb-2">
                      Sort By
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="date">Date Created</option>
                      <option value="name">Group Name</option>
                      <option value="activity">Activity Level</option>
                    </select>
                  </div>

                  <div className="flex justify-between p-2">
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800"
                    >
                      <FontAwesomeIcon
                        icon={
                          sortOrder === "asc"
                            ? faSortAmountUp
                            : faSortAmountDown
                        }
                        className="text-sm"
                      />
                      <span>
                        {sortOrder === "asc" ? "Ascending" : "Descending"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faThLarge} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 flex items-center justify-center ${
                  viewMode === "list"
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
        </div>

        {/* Active Groups */}
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4 flex items-center">
            <span>Active Groups</span>
            {activeGroups.length > 0 && (
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeGroups.length}
              </span>
            )}
          </h2>

          {activeGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-gray-400 text-xl"
                />
              </div>
              <p className="text-center">No active groups found.</p>
              <p className="text-sm text-center mt-1">
                Create a new group to get started!
              </p>
              <Button
                text="Create Group"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg"
              />
            </div>
          ) : viewMode === "grid" ? (
            // Grid View for Active Groups
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeGroups.map((group) => {
                const activityLevel = calculateActivityLevel(group);

                return (
                  <div
                    key={group._id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Group Header with Activity Indicator */}
                    <div className="relative">
                      <div
                        className={`h-3 w-full ${
                          activityLevel === "high"
                            ? "bg-green-500"
                            : activityLevel === "medium"
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      <div className="p-4 flex items-center gap-3">
                        <Image
                          src={avatarMap[group.type] || "/friends_group.png"}
                          alt={group.type}
                          width={50}
                          height={50}
                          className="rounded-full border-2 border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 truncate">
                            {group.name}
                          </h3>
                          <p className="text-sm text-gray-500">{group.type}</p>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center text-xs font-medium">
                            <span
                              className={`h-2 w-2 rounded-full mr-1 ${
                                activityLevel === "high"
                                  ? "bg-green-500"
                                  : activityLevel === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            <span className="sr-only">
                              {activityLevel} activity
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Group Body */}
                    <div className="p-4 flex-1 text-sm text-gray-600">
                      <p className="line-clamp-2 mb-3">
                        {group.description || "No description provided."}
                      </p>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-gray-400 mr-1"
                        />
                        <span>{group.members?.length || 0} members</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Group Actions */}
                    <div className="p-4 bg-gray-50 border-t flex justify-between">
                      <button
                        onClick={() => handleViewGroup(group)}
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View for Active Groups
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {activeGroups.map((group) => {
                const activityLevel = calculateActivityLevel(group);

                return (
                  <div
                    key={group._id}
                    className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center p-4">
                      {/* Activity indicator */}
                      <div
                        className={`w-1.5 self-stretch mr-4 ${
                          activityLevel === "high"
                            ? "bg-green-500"
                            : activityLevel === "medium"
                            ? "bg-yellow-500"
                            : "bg-gray-300"
                        }`}
                      ></div>

                      {/* Group avatar */}
                      <Image
                        src={avatarMap[group.type] || "/friends_group.png"}
                        alt={group.type}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-200 mr-4"
                      />

                      {/* Group info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800">
                          {group.name}
                        </h3>
                        <div className="flex items-center text-sm space-x-3 text-gray-500">
                          <span>{group.type}</span>
                          <span>•</span>
                          <span>{group.members?.length || 0} members</span>
                          <span>•</span>
                          <span>
                            Created{" "}
                            {new Date(group.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {group.description || "No description provided."}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          text="View"
                          onClick={() => handleViewGroup(group)}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md text-sm"
                        />
                        <Button
                          text="Edit"
                          onClick={() => handleEditGroup(group)}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Groups */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span>Completed Groups</span>
            {completedGroups.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {completedGroups.length}
              </span>
            )}
          </h2>

          {completedGroups.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">
              No completed groups found.
            </p>
          ) : viewMode === "grid" ? (
            // Grid View for Completed Groups
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {completedGroups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col opacity-90"
                >
                  {/* Group Header */}
                  <div className="p-4 flex items-center gap-3 bg-gray-50">
                    <div className="relative">
                      <Image
                        src={avatarMap[group.type] || "/friends_group.png"}
                        alt={group.type}
                        width={50}
                        height={50}
                        className="rounded-full border-2 border-gray-200 grayscale"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-700 truncate flex items-center">
                        {group.name}
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Completed
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">{group.type}</p>
                    </div>
                  </div>

                  {/* Group Body */}
                  <div className="p-4 flex-1">
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {group.description || "No description provided."}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-gray-400 mr-1"
                      />
                      <span>{group.members?.length || 0} members</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Group Actions */}
                  <div className="p-4 bg-gray-50 border-t flex justify-between">
                    <button
                      onClick={() => handleViewGroup(group)}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group)}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View for Completed Groups
            <div className="overflow-hidden rounded-lg border border-gray-200">
              {completedGroups.map((group) => (
                <div
                  key={group._id}
                  className="bg-white border-b last:border-b-0 hover:bg-gray-50 transition-colors opacity-90"
                >
                  <div className="flex items-center p-4">
                    {/* Group avatar */}
                    <div className="w-1.5 self-stretch mr-4 bg-gray-300"></div>
                    <Image
                      src={avatarMap[group.type] || "/friends_group.png"}
                      alt={group.type}
                      width={48}
                      height={48}
                      className="rounded-full border border-gray-200 mr-4 grayscale"
                    />

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-700 flex items-center">
                        {group.name}
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                          Completed
                        </span>
                      </h3>
                      <div className="flex items-center text-sm space-x-3 text-gray-500">
                        <span>{group.type}</span>
                        <span>•</span>
                        <span>{group.members?.length || 0} members</span>
                        <span>•</span>
                        <span>
                          Created{" "}
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        text="View"
                        onClick={() => handleViewGroup(group)}
                        className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm"
                      />
                      <Button
                        text="Delete"
                        onClick={() => handleDeleteGroup(group)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen &&
          selectedGroup &&
          typeof window !== "undefined" && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
              suppressHydrationWarning
            >
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all transform scale-95 animate-fadeIn max-w-md w-full">
                <h2 className="text-xl font-semibold text-red-600">
                  Delete Group
                </h2>
                <p className="text-gray-700 mt-3">
                  Are you sure you want to delete{" "}
                  <strong className="text-red-500">
                    {selectedGroup.name || "this group"}
                  </strong>
                  ?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This action <span className="font-bold">cannot</span> be
                  undone.
                </p>
                <div className="mt-4 bg-gray-100 p-4 rounded-md text-sm">
                  <p>
                    <strong>Type:</strong> {selectedGroup.type || "Unknown"}
                  </p>
                  <p>
                    <strong>Created By:</strong>{" "}
                    {typeof selectedGroup.createdBy === "object"
                      ? selectedGroup.createdBy.fullName
                      : "Unknown"}
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    text="Cancel"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md transition"
                  />
                  <Button
                    text="Delete"
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md transition"
                  />
                </div>
              </div>
            </div>
          )}

        {/* Enhanced Create Group Modal with Multi-step Form */}
        {isModalOpen && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50"
            suppressHydrationWarning
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl flex flex-col gap-6 relative transition-all transform animate-fadeIn">
              {/* Progress Steps */}
              <div className="flex justify-between items-center mb-6">
                <div className="w-full flex items-center">
                  <div className="relative flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 text-white font-semibold ${
                        formStep >= 1
                          ? "bg-indigo-500"
                          : "bg-indigo-200 text-gray-700"
                      }`}
                    >
                      1
                    </div>
                    <div className="text-sm font-medium mt-2">Group Info</div>
                  </div>
                  <div
                    className={`h-1 flex-1 ${
                      formStep >= 2 ? "bg-indigo-500" : "bg-indigo-200"
                    }`}
                  ></div>
                  <div className="relative flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 font-semibold ${
                        formStep >= 2
                          ? "bg-indigo-500 text-white"
                          : "bg-indigo-200 text-gray-700"
                      }`}
                    >
                      2
                    </div>
                    <div className="text-sm font-medium mt-2">Add Members</div>
                  </div>
                  <div
                    className={`h-1 flex-1 ${
                      formStep >= 3 ? "bg-indigo-500" : "bg-indigo-200"
                    }`}
                  ></div>
                  <div className="relative flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 font-semibold ${
                        formStep >= 3
                          ? "bg-indigo-500 text-white"
                          : "bg-indigo-200 text-gray-700"
                      }`}
                    >
                      3
                    </div>
                    <div className="text-sm font-medium mt-2">Review</div>
                  </div>
                </div>
              </div>

              {/* Step 1: Group Info */}
              {formStep === 1 && (
                <>
                  <div className="flex justify-center mb-4">
                    <Image
                      src={avatarMap[newGroup.type] || "/friends_group.png"}
                      alt={`${newGroup.type} Group Avatar`}
                      width={80}
                      height={80}
                      className="rounded-full border-2 border-gray-300 shadow-lg"
                    />
                  </div>
                  <h2 className="text-xl text-center font-semibold mb-4">
                    Create a New Group
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter group name"
                        value={newGroup.name}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, name: e.target.value })
                        }
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Type
                      </label>
                      <select
                        value={newGroup.type}
                        onChange={handleGroupTypeChange}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="Travel">Travel/Trip</option>
                        <option value="Household">Household</option>
                        <option value="Event">Event/Party</option>
                        <option value="Work">Work/Office</option>
                        <option value="Friends">Friends/Family</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        placeholder="Describe your group"
                        value={newGroup.description}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            description: e.target.value,
                          })
                        }
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Add Members */}
              {formStep === 2 && (
                <>
                  <h2 className="text-xl text-center font-semibold mb-4">
                    Add Members to "{newGroup.name}"
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Friends to Add *
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (
                            e.target.value &&
                            !newGroup.members.includes(e.target.value)
                          )
                            setNewGroup((prevGroup) => ({
                              ...prevGroup,
                              members: [...prevGroup.members, e.target.value],
                            }));
                        }}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all mb-3"
                      >
                        <option value="">Select a friend...</option>
                        {friends.length > 0 ? (
                          friends
                            .filter(
                              (friend) => !newGroup.members.includes(friend._id)
                            )
                            .map((friend) => (
                              <option key={friend._id} value={friend._id}>
                                {friend.fullName}
                              </option>
                            ))
                        ) : (
                          <option disabled>No friends found</option>
                        )}
                      </select>

                      <div className="bg-gray-50 rounded-lg p-4 mb-2">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-gray-700">
                            Selected Members{" "}
                            {newGroup.members.length > 0
                              ? `(${newGroup.members.length})`
                              : ""}
                          </h3>
                          {newGroup.members.length > 0 && (
                            <button
                              onClick={() =>
                                setNewGroup({ ...newGroup, members: [] })
                              }
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-1 min-h-[100px]">
                          {newGroup.members.length > 0 ? (
                            newGroup.members.map((memberId, index) => {
                              const friend = friends.find(
                                (f) => f._id === memberId
                              );
                              return (
                                friend && (
                                  <span
                                    key={index}
                                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                  >
                                    <span>{friend.fullName}</span>
                                    <button
                                      type="button"
                                      className="text-indigo-800 hover:text-indigo-900"
                                      onClick={() =>
                                        setNewGroup((prevGroup) => ({
                                          ...prevGroup,
                                          members: prevGroup.members.filter(
                                            (id) => id !== memberId
                                          ),
                                        }))
                                      }
                                    >
                                      {"⨯"}
                                    </button>
                                  </span>
                                )
                              );
                            })
                          ) : (
                            <p className="text-gray-500 text-sm italic">
                              No members selected. Please add at least one
                              member.
                            </p>
                          )}
                        </div>
                      </div>

                      {friends.length === 0 && (
                        <div className="text-center p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                          <p className="text-yellow-700">
                            You don't have any friends added yet.
                          </p>
                          <button
                            onClick={() => router.push("/friends")}
                            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                          >
                            Add friends first
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {formStep === 3 && (
                <>
                  <h2 className="text-xl text-center font-semibold mb-4">
                    Review Group Details
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex mb-4">
                      <div className="mr-4">
                        <Image
                          src={avatarMap[newGroup.type] || "/friends_group.png"}
                          alt={newGroup.type}
                          width={80}
                          height={80}
                          className="rounded-full border-2 border-white shadow-md"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {newGroup.name}
                        </h3>
                        <p className="text-gray-500">{newGroup.type}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">
                        Description
                      </h4>
                      <p className="text-gray-600 bg-white p-3 rounded-md border">
                        {newGroup.description || "No description provided."}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">
                        Members ({newGroup.members.length})
                      </h4>
                      <div className="bg-white p-3 rounded-md border max-h-40 overflow-y-auto">
                        {newGroup.members.length > 0 ? (
                          <ul className="space-y-1">
                            {newGroup.members.map((memberId, idx) => {
                              const friend = friends.find(
                                (f) => f._id === memberId
                              );
                              return (
                                friend && (
                                  <li
                                    key={idx}
                                    className="text-gray-700 flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {friend.fullName}
                                  </li>
                                )
                              );
                            })}
                            <li className="text-gray-700 flex items-center gap-2 font-medium">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              You (Group Creator)
                            </li>
                          </ul>
                        ) : (
                          <p className="text-red-600 text-sm">
                            No members selected!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-4">
                {formStep > 1 ? (
                  <Button
                    text="Back"
                    onClick={goToPrevStep}
                    className="text-white bg-gray-500 hover:bg-gray-600 transition-all px-6 py-3 rounded-md w-[45%]"
                  />
                ) : (
                  <Button
                    text="Cancel"
                    onClick={() => {
                      setIsModalOpen(false);
                      setFormStep(1);
                      setNewGroup({
                        name: "",
                        description: "",
                        type: "Friends",
                        members: [],
                      });
                    }}
                    className="text-white bg-red-500 hover:bg-red-600 transition-all px-6 py-3 rounded-md w-[45%]"
                  />
                )}

                {formStep < 3 ? (
                  <Button
                    text="Next"
                    onClick={goToNextStep}
                    className="text-white bg-indigo-500 hover:bg-indigo-600 transition-all px-6 py-3 rounded-md w-[45%]"
                  />
                ) : (
                  <Button
                    text="Create Group"
                    onClick={handleAddGroup}
                    className="text-white bg-green-500 hover:bg-green-600 transition-all px-6 py-3 rounded-md w-[45%]"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced View Group Modal */}
        {isViewModalOpen && selectedGroup && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50 overflow-auto"
            onClick={() => setIsViewModalOpen(false)}
            suppressHydrationWarning
          >
            <div
              className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-5xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Section with Hero Pattern */}
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-lg -mt-6 -mx-6 px-8 py-8 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg
                    className="w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="triangles"
                        width="60"
                        height="60"
                        patternUnits="userSpaceOnUse"
                        patternTransform="scale(2)"
                      >
                        <path
                          d="M0,0 L30,52 L60,0 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#triangles)" />
                  </svg>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-5">
                    <Image
                      src={
                        avatarMap[selectedGroup.type] || "/friends_group.png"
                      }
                      alt={selectedGroup.type}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedGroup.name}
                    </h2>
                    <div className="flex items-center space-x-3 text-white/90">
                      <span>{selectedGroup.type}</span>
                      <span>•</span>
                      <span>{selectedGroup.members?.length || 0} members</span>
                      <span>•</span>
                      <span>
                        Created{" "}
                        {new Date(selectedGroup.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedGroup.completed
                            ? "bg-gray-200 text-gray-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedGroup.completed ? "Completed" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content in Tabs */}
              <div className="mt-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      Overview
                    </button>
                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      Members
                    </button>
                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                      Transactions
                    </button>
                  </nav>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                        <h3 className="text-lg font-medium text-gray-900">
                          Group Details
                        </h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <dl className="space-y-4">
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Description
                            </dt>
                            <dd className="mt-1 text-gray-900">
                              {selectedGroup.description ||
                                "No description provided."}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Created by
                            </dt>
                            <dd className="mt-1 text-gray-900 flex items-center">
                              <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2 text-indigo-500">
                                <FontAwesomeIcon icon={faUser} />
                              </span>
                              {selectedGroup.createdBy?.fullName || "Unknown"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Creation Date
                            </dt>
                            <dd className="mt-1 text-gray-900">
                              {new Date(
                                selectedGroup.createdAt
                              ).toLocaleDateString()}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">
                              Status
                            </dt>
                            <dd className="mt-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  selectedGroup.completed
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {selectedGroup.completed
                                  ? "Completed"
                                  : "Active"}
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          Group Members
                        </h3>
                        <span className="text-gray-600 text-sm">
                          {selectedGroup.members?.length || 0} members
                        </span>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedGroup.members?.map(
                            (member: any, index: number) => (
                              <li
                                key={index}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                              >
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                    <FontAwesomeIcon icon={faUser} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {member.fullName || "Unknown"}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {member === selectedGroup.createdBy ||
                                    (typeof member === "object" &&
                                      typeof selectedGroup.createdBy ===
                                        "object" &&
                                      member._id ===
                                        selectedGroup.createdBy._id)
                                      ? "(Creator)"
                                      : "Member"}
                                  </p>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                        <h3 className="text-lg font-medium text-gray-900">
                          Who Owes Whom
                        </h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        {owesList.length > 0 ? (
                          <ul className="space-y-3">
                            {owesList.map((entry, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between py-2 border-b"
                              >
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-orange-500">
                                    <FontAwesomeIcon
                                      icon={faUser}
                                      className="text-xs"
                                    />
                                  </div>
                                  <span className="text-gray-900">
                                    {entry.from}
                                  </span>
                                  <span className="mx-2 text-gray-500">→</span>
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 text-green-500">
                                    <FontAwesomeIcon
                                      icon={faUser}
                                      className="text-xs"
                                    />
                                  </div>
                                  <span className="text-gray-900">
                                    {entry.to}
                                  </span>
                                </div>
                                <span className="font-bold text-indigo-600">
                                  ₹{entry.amount.toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-green-500 text-3xl mb-3"
                            />
                            <p>All payments settled!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
                        <h3 className="text-lg font-medium text-gray-900">
                          Recent Transactions
                        </h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Pending Transactions
                            </h4>
                            {groupTransactions.pending &&
                            groupTransactions.pending.length > 0 ? (
                              <ul className="space-y-2">
                                {groupTransactions.pending.map(
                                  (txn: any, index: number) => (
                                    <li
                                      key={index}
                                      className="flex justify-between px-3 py-2 bg-yellow-50 rounded-lg"
                                    >
                                      <div className="text-sm">
                                        <p className="text-gray-900">
                                          {txn.sender?.fullName} →{" "}
                                          {txn.receiver?.fullName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                          Pending
                                        </p>
                                      </div>
                                      <span className="font-medium text-yellow-600">
                                        ₹{txn.amount}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No pending transactions.
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">
                              Completed Transactions
                            </h4>
                            {groupTransactions.completed &&
                            groupTransactions.completed.length > 0 ? (
                              <ul className="space-y-2">
                                {groupTransactions.completed.map(
                                  (txn: any, index: number) => (
                                    <li
                                      key={index}
                                      className="flex justify-between px-3 py-2 bg-green-50 rounded-lg"
                                    >
                                      <div className="text-sm">
                                        <p className="text-gray-900">
                                          {txn.sender?.fullName} →{" "}
                                          {txn.receiver?.fullName}
                                        </p>
                                        <p className="text-gray-500 text-xs">
                                          Completed
                                        </p>
                                      </div>
                                      <span className="font-medium text-green-600">
                                        ₹{txn.amount}
                                      </span>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                No completed transactions.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <Button
                  text="Check Expenses"
                  onClick={() => router.push("/expenses")}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
                />
                <Button
                  text="Settle Payments"
                  onClick={() => router.push("/payments")}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg shadow transition-colors"
                />
                <Button
                  text="Close"
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Edit Group Modal */}
        {isEditModalOpen && selectedGroup && typeof window !== "undefined" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="mb-6 text-center">
                <div className="flex justify-center mb-3">
                  <Image
                    src={avatarMap[selectedGroup.type] || "/friends_group.png"}
                    alt={selectedGroup.type}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-gray-300 shadow-lg"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  Edit Group: {selectedGroup.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={5}
                    placeholder="Enter group description"
                  ></textarea>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center">
                      <label className="inline-flex items-center mr-6">
                        <input
                          type="radio"
                          value="active"
                          checked={!completedStatus}
                          onChange={() => setCompletedStatus(false)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2">Active</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value="completed"
                          checked={completedStatus}
                          onChange={() => setCompletedStatus(true)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2">Completed</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Members
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !newMembers.includes(e.target.value)
                        ) {
                          setNewMembers([...newMembers, e.target.value]);
                        }
                      }}
                      value=""
                    >
                      <option value="">Add a member...</option>
                      {friends
                        .filter(
                          (friend) =>
                            !newMembers.includes(friend._id) &&
                            friend._id !== selectedGroup.createdBy._id
                        )
                        .map((friend) => (
                          <option key={friend._id} value={friend._id}>
                            {friend.fullName}
                          </option>
                        ))}
                    </select>

                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-[120px]">
                      {newMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {newMembers.map((memberId, idx) => {
                            const friend = friends.find(
                              (f) => f._id === memberId
                            );
                            return (
                              friend && (
                                <div
                                  key={idx}
                                  className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full"
                                >
                                  <span className="text-sm">
                                    {friend.fullName}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setNewMembers(
                                        newMembers.filter(
                                          (id) => id !== memberId
                                        )
                                      )
                                    }
                                    className="text-indigo-300 hover:text-indigo-600 focus:outline-none"
                                  >
                                    ×
                                  </button>
                                </div>
                              )
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No members selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  text="Cancel"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-md"
                />
                <Button
                  text="Save Changes"
                  onClick={handleSaveGroup}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
