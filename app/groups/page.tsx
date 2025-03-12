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
  faRupeeSign,
} from "@fortawesome/free-solid-svg-icons";
import { useGroups } from "@/context/groupContext";
import {
  createNewGroup,
  updateGroup,
  removeGroup,
  fetchGroupTransactions,
  calculateOwes,
} from "@/utils/api/group";
import Cookies from "js-cookie";
import { useAuth } from "@/context/authContext";

export default function Groups() {
  const router = useRouter();
  const {
    groups,
    refreshGroups,
    friends,
    loading: groupsLoading,
    refreshFriends,
  } = useGroups();
  const { token, loading: authLoading } = useAuth() || {};
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

  // Enhanced state management
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // If not loading and no token exists, redirect to login
    if (!authLoading && !token) {
      router.push("/login"); // Adjust the login route as needed
    }
  }, [token, authLoading, router]);

  // Fetch groups only when token is available and not already loading
  useEffect(() => {
    if (token && !groupsLoading) {
      refreshGroups();
    }
  }, [token, refreshGroups, groupsLoading]);

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

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "Friends",
    members: [] as string[],
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
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     console.log("Groups Data:", groups);
  //   }
  // }, [groups]);

  const avatarMap: { [key: string]: string } = {
    Travel: "/travel_group.png",
    Household: "/accomodation_group.png",
    Event: "/event_group.png",
    Work: "/work_group.png",
    Friends: "/friends_group.png",
  };

  const handleGroupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewGroup((prevGroup) => ({
      ...prevGroup,
      type: e.target.value, // Update only type, avatar is dynamically handled
    }));
  };

  useEffect(() => {
    if (toast && typeof window !== "undefined") {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Create New Group (Client-side only)
  const handleAddGroup = async () => {
    if (typeof window !== "undefined" && token) {
      if (!newGroup.name.trim() || newGroup.members.length === 0) {
        setToast({ message: "Group name & members required!", type: "error" });
        return;
      }

      try {
        setIsUpdating(true);
        await createNewGroup(newGroup, token); // Use token from AuthContext

        await new Promise((resolve) => setTimeout(resolve, 500));

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
      } catch (error: any) {
        setToast({ message: error.message, type: "error" });
      } finally {
        setIsUpdating(false); // End update state
      }
    }
  };

  // ✅ Edit Group Details (Client-side only)
  const handleEditGroup = (group: any) => {
    if (typeof window !== "undefined") {
      setSelectedGroup(group);
      setGroupDescription(group.description || "");
      setCompletedStatus(group.completed || false);
      setNewMembers([...group.members]);
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

  // ✅ Delete Group (Client-side only)
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

  // ✅ Fetch Group Transactions and "Who Owes Whom" when viewing a group (Client-side only)
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

  if (authLoading || groupsLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 pt-20 justify-center items-center">
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/70 rounded-2xl shadow-2xl backdrop-blur-lg animate-pulse">
          <svg
            className="w-20 h-20 text-purple-500 animate-spin"
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
          <p className="mt-6 text-2xl font-semibold text-gray-800">
            Loading Groups
          </p>
          <p className="text-sm text-gray-600 text-center">
            Preparing your collaborative spaces securely...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 pt-20"
      suppressHydrationWarning
    >
      <Sidebar activePage="groups" />

      <div className="flex-1 p-8 max-w-7xl mx-auto">
        {/* Toast Notification with Modern Design */}
        {toast && typeof window !== "undefined" && (
          <div
            className={`fixed top-24 right-6 px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 text-white text-sm transition-all duration-500 transform origin-top-right ${
              toast.type === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : toast.type === "info"
                ? "bg-gradient-to-r from-blue-500 to-blue-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            }`}
            style={{ zIndex: 10000 }}
          >
            <FontAwesomeIcon
              icon={
                toast.type === "success" ? faCheckCircle : faExclamationCircle
              }
              className="text-xl"
            />
            <span className="font-medium">{toast.message}</span>
          </div>
        )}

        {/* Modern Page Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500">
            Groups
          </h1>
          <Button
            text="Add Group"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
            <span>Add Group</span>
          </Button>
        </div>

        {/* Updated Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: "Total Groups",
              value: groups.length,
              bgClass: "bg-purple-100",
              textClass: "text-purple-700",
              numberClass: "bg-gradient-to-r from-purple-500 to-purple-600",
            },
            {
              label: "Active Groups",
              value: groups.filter((group) => !group.completed).length,
              bgClass: "bg-green-100",
              textClass: "text-green-800",
              numberClass: "bg-gradient-to-r from-green-500 to-green-600",
            },
            {
              label: "Completed Groups",
              value: groups.filter((group) => group.completed).length,
              bgClass: "bg-blue-100",
              textClass: "text-blue-800",
              numberClass: "bg-gradient-to-r from-blue-500 to-blue-600",
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`${card.bgClass} rounded-2xl p-6 text-center shadow-md transform transition-all duration-300 hover:-translate-y-2`}
            >
              <h2 className={`text-lg font-semibold ${card.textClass} mb-2`}>
                {card.label}
              </h2>
              <p
                className={`text-4xl font-bold text-transparent bg-clip-text ${card.numberClass}`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Updated Group Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Groups with Energetic Design */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border-2 border-green-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-green-800">
                Active Groups
              </h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {groups.filter((group) => !group.completed).length}
              </span>
            </div>

            {groups.filter((group) => !group.completed).length === 0 ? (
              <div className="text-center py-10 bg-green-50/50 rounded-xl">
                <p className="text-lg font-medium text-green-700 italic">
                  No active groups
                </p>
                <p className="text-sm mt-2 text-green-600">
                  Start a new group adventure!
                </p>
              </div>
            ) : (
              groups
                .filter((group) => !group.completed)
                .map((group) => (
                  <div
                    key={group._id}
                    className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100 p-5 mb-4 flex items-center hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-300"
                  >
                    <div className="mr-5">
                      <Image
                        src={
                          avatarMap[group.type] || "/friends_group_gradient.png"
                        }
                        alt="Group Avatar"
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-gray-100 shadow-sm"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 mr-3">
                          {group.name}
                        </h3>
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                          {group.type} Group
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          <span className="font-medium text-gray-600">
                            {group.members.length} Members
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>
                            Created by{" "}
                            {typeof group.createdBy === "object" &&
                            group.createdBy?.fullName
                              ? group.createdBy.fullName
                              : "Unknown"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Created on{" "}
                          {new Date(group.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        text="Edit"
                        onClick={() => handleEditGroup(group)}
                        className="
            px-4 py-2 
            bg-white 
            border border-gray-200 
            text-gray-700 
            rounded-lg 
            text-sm 
            font-medium 
            hover:bg-gray-50 
            hover:border-blue-500 
            transition-colors 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-600/50
          "
                      />
                      <Button
                        text="View"
                        onClick={() => handleViewGroup(group)}
                        className="
            px-4 py-2 
            bg-blue-600 
            text-white 
            rounded-lg 
            text-sm 
            font-medium 
            hover:bg-blue-700 
            transition-colors 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500
            shadow-md 
            hover:shadow-lg
          "
                      />
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Completed Groups with Subdued Design */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border-2 border-gray-50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Completed Groups
              </h2>
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                {groups.filter((group) => group.completed).length}
              </span>
            </div>

            {groups.filter((group) => group.completed).length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 rounded-xl">
                <p className="text-lg font-medium text-gray-700 italic">
                  No completed groups
                </p>
                <p className="text-sm mt-2 text-gray-600">
                  Complete an active group to see it here
                </p>
              </div>
            ) : (
              groups
                .filter((group) => group.completed)
                .map((group) => (
                  <div
                    key={group._id}
                    className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100 p-5 mb-4 flex items-center opacity-70 hover:opacity-100 transition-all duration-300"
                  >
                    <div className="mr-5 relative">
                      <Image
                        src={
                          avatarMap[group.type] || "/friends_group_gradient.png"
                        }
                        alt="Group Avatar"
                        width={60}
                        height={60}
                        className="rounded-full border-2 border-gray-200 grayscale"
                      />
                      <div className="absolute bottom-0 right-0 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-500 mr-3 line-through">
                          {group.name}
                        </h3>
                        {/* <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Completed {group.type} Group
                        </span> */}
                      </div>

                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          <span className="font-medium text-gray-500">
                            {group.members.length} Members
                          </span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>
                            Completed by{" "}
                            {typeof group.createdBy === "object" &&
                            group.createdBy?.fullName
                              ? group.createdBy.fullName
                              : "Unknown"}
                          </span>
                        </p>
                        {/* <p className="text-xs text-gray-400">
                          Completed on{" "}
                          {new Date(
                            group.updatedAt || group.createdAt
                          ).toLocaleDateString()}
                        </p> */}
                      </div>
                    </div>

                    <Button
                      text="Delete"
                      onClick={() => handleDeleteGroup(group)}
                      className="
          px-4 py-2 
          bg-gray-100 
          text-gray-600 
          rounded-lg 
          text-sm 
          font-medium 
          hover:bg-gray-200 
          hover:text-red-600
          transition-colors 
          focus:outline-none 
          focus:ring-2 
          focus:ring-red-700/100
        "
                    />
                  </div>
                ))
            )}
          </div>
        </div>

        {isDeleteModalOpen &&
          selectedGroup &&
          typeof window !== "undefined" && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
              suppressHydrationWarning
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
                  <h2 className="text-2xl font-bold text-white">
                    Delete Group
                  </h2>
                </div>

                {/* Modal Content */}
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <p className="text-gray-700 text-lg">
                      Are you sure you want to delete{" "}
                      <strong className="text-red-600">
                        {selectedGroup.name || "this group"}
                      </strong>
                      ?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      This action{" "}
                      <span className="font-bold text-red-500">cannot</span> be
                      undone.
                    </p>
                  </div>

                  {/* Group Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Group Type:
                      </span>
                      <span className="text-gray-600">
                        {selectedGroup.type || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">
                        Created By:
                      </span>
                      <span className="text-gray-600">
                        {typeof selectedGroup.createdBy === "object"
                          ? selectedGroup.createdBy.fullName
                          : "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      text="Cancel"
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="
                flex-1 
                bg-white 
                border border-gray-300 
                text-gray-700 
                px-5 
                py-3 
                rounded-lg 
                hover:bg-gray-100 
                transition-colors
              "
                    />
                    <Button
                      text="Delete"
                      onClick={handleConfirmDelete}
                      className="
                flex-1 
                bg-red-500 
                text-white 
                px-5 
                py-3 
                rounded-lg 
                hover:bg-red-600 
                transition-colors 
                shadow-md 
                hover:shadow-lg
              "
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {isModalOpen && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
            suppressHydrationWarning
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-6 text-center relative">
                <h2 className="text-2xl font-bold text-white">
                  Create a New Group
                </h2>
                <Image
                  src={avatarMap[newGroup.type]}
                  alt={`${newGroup.type} Group Avatar`}
                  width={100}
                  height={100}
                  className="absolute top-4 right-4 bg-white/80 p-2 rounded-full shadow-md border border-purple-100"
                />
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-2 gap-8 p-8">
                {/* Left Column: Group Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter group name"
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Description
                    </label>
                    <textarea
                      placeholder="Add a brief description"
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Type
                    </label>
                    <select
                      value={newGroup.type}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, type: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 transition-all"
                      required
                    >
                      <option value="Travel">Travel/Trip</option>
                      <option value="Household">Household</option>
                      <option value="Event">Event/Party</option>
                      <option value="Work">Work/Office</option>
                      <option value="Friends">Friends/Family</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Member Selection */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Members
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 transition-all"
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Members{" "}
                      {newGroup.members.length > 0
                        ? `(${newGroup.members.length})`
                        : ""}
                    </label>
                    <div className="border border-gray-300 rounded-lg min-h-[150px] p-4">
                      {newGroup.members.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {newGroup.members.map((memberId, index) => {
                            const friend = friends.find(
                              (f) => f._id === memberId
                            );
                            return (
                              friend && (
                                <div
                                  key={index}
                                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                  <span>{friend.fullName}</span>
                                  <button
                                    type="button"
                                    className="text-purple-500 hover:text-red-500 transition-colors"
                                    onClick={() =>
                                      setNewGroup((prevGroup) => ({
                                        ...prevGroup,
                                        members: prevGroup.members.filter(
                                          (id) => id !== memberId
                                        ),
                                      }))
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center italic mt-8">
                          No members selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-gray-50 px-8 py-5 flex justify-end space-x-4 border-t">
                <Button
                  text="Cancel"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                />
                <Button
                  text="Create Group"
                  onClick={handleAddGroup}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-500 p-6 text-center relative">
                <h2 className="text-2xl font-bold text-white">Edit Group</h2>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-2 gap-8 p-8">
                {/* Left Column: Group Details */}
                <div className="space-y-6">
                  {/* Group Name (Non-Editable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={selectedGroup.name}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Group Type (Non-Editable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Type
                    </label>
                    <input
                      type="text"
                      value={selectedGroup.type}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Group Description (Editable) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Description
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Add a detailed description"
                    />
                  </div>

                  {/* Completed Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={completedStatus}
                      onChange={(e) => setCompletedStatus(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="text-sm text-gray-700 font-medium">
                      Mark as Completed
                    </label>
                  </div>
                </div>

                {/* Right Column: Member Management */}
                <div className="space-y-6">
                  {/* Group Creator */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Creator
                    </label>
                    <input
                      type="text"
                      value={selectedGroup.createdBy?.fullName || "Unknown"}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Member Management */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Members
                    </label>
                    <select
                      onChange={(e) => {
                        const newMemberId = e.target.value;
                        if (newMemberId && !newMembers.includes(newMemberId)) {
                          setNewMembers([...newMembers, newMemberId]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/50 transition-all"
                      disabled={
                        friends.length === 0 ||
                        friends.every(
                          (friend) =>
                            friend._id === selectedGroup.createdBy._id ||
                            newMembers.includes(friend._id)
                        )
                      }
                    >
                      {friends.length > 0 &&
                      !friends.some(
                        (friend) =>
                          !newMembers.includes(friend._id) &&
                          friend._id !== selectedGroup.createdBy._id
                      ) ? (
                        <option value="">No new friends to add</option>
                      ) : (
                        <>
                          <option value="">Add a new member...</option>
                          {friends
                            .filter(
                              (friend) =>
                                friend._id !== selectedGroup.createdBy._id &&
                                !newMembers.includes(friend._id)
                            )
                            .map((friend) => (
                              <option key={friend._id} value={friend._id}>
                                {friend.fullName}
                              </option>
                            ))}
                        </>
                      )}
                    </select>

                    {/* Selected Members */}
                    <div className="mt-4 border border-gray-300 rounded-lg min-h-[150px] p-4">
                      {newMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {newMembers.map((memberId, index) => {
                            const friend = friends.find(
                              (f) => f._id === memberId
                            );
                            return (
                              friend && (
                                <div
                                  key={index}
                                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                  <span>{friend.fullName}</span>
                                  <button
                                    type="button"
                                    className="text-purple-500 hover:text-red-500 transition-colors"
                                    onClick={() => {
                                      if (newMembers.length <= 1) {
                                        setToast({
                                          message:
                                            "❌ A group must have at least 2 members (including the creator)!",
                                          type: "error",
                                        });
                                        return;
                                      }
                                      setNewMembers(
                                        newMembers.filter((m) => m !== memberId)
                                      );
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              )
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-center italic mt-8">
                          No members selected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="bg-gray-50 px-8 py-5 flex justify-end space-x-4 border-t">
                <Button
                  text="Cancel"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                />
                <Button
                  text="Save Changes"
                  onClick={handleSaveGroup}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && selectedGroup && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
            suppressHydrationWarning
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto grid grid-cols-2 overflow-hidden">
              {/* Left Panel: Group Overview */}
              <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="flex items-center space-x-5 mb-6">
                  <Image
                    src={
                      selectedGroup?.avatar ||
                      avatarMap[selectedGroup?.type] ||
                      "/friends_group.png"
                    }
                    alt="Group Avatar"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedGroup.name}
                    </h2>
                    <p className="text-purple-600 font-medium">
                      {selectedGroup.type} Group
                    </p>
                  </div>
                </div>

                {/* Group Details Section */}
                <div className="space-y-4">
                  {/* Group Description Section */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-indigo-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 3H4zm3 6a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-gray-600">
                        Group Description
                      </h3>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
                      <p className="text-gray-800 italic">
                        {selectedGroup.description || (
                          <span className="text-gray-500">
                            No description provided
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Group Owner Section */}
                  <div className="mt-4">
                    <div className="flex items-center mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <h3 className="text-sm font-semibold text-gray-600">
                        Group Owner
                      </h3>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center mr-4">
                        <span className="text-green-700 font-bold text-lg">
                          {selectedGroup.createdBy?.fullName
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">
                          {selectedGroup.createdBy?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">Group Creator</p>
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold text-gray-600 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-purple-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.5 17c0-2.757 2.243-5 5-5v-2c-3.157 0-5.868 2.167-6.72 5.007C10.399 14.766 8.666 13 6.5 13a4.5 4.5 0 00-4.5 4.5v2h10v-2z" />
                        </svg>
                        Members
                      </h3>
                      <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                        {selectedGroup?.members?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                      {selectedGroup?.members?.map(
                        (member: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-b-0 border-purple-200"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center mr-3">
                                <span className="text-purple-700 font-medium text-sm">
                                  {member.fullName?.charAt(0).toUpperCase() ||
                                    "?"}
                                </span>
                              </div>
                              <span className="text-gray-800 font-medium">
                                {member.fullName || "Unknown"}
                              </span>
                            </div>
                            {member._id === selectedGroup.createdBy._id && (
                              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Group Metadata */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="flex justify-center items-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="text-xs font-semibold text-blue-700">
                          Start Date
                        </h4>
                      </div>
                      <p className="text-blue-800 font-bold">
                        {new Date(selectedGroup.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center">
                      <div className="flex justify-center items-center mb-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="text-xs font-semibold text-green-700">
                          Group Status
                        </h4>
                      </div>
                      <p
                        className={`font-bold ${
                          selectedGroup.completed
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {selectedGroup.completed ? "Completed" : "Active"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 text-center">
                  <Button
                    text="Close"
                    onClick={() => setIsViewModalOpen(false)}
                    className="
      px-8 py-3 
      bg-red-500 
      text-white 
      rounded-lg 
      hover:bg-red-600 
      transition-colors 
      flex 
      items-center 
      justify-center 
      mx-auto 
      group
    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white group-hover:animate-pulse"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Close
                  </Button>
                </div>
              </div>

              {/* Right Panel: Financial Details */}
              <div className="p-8 bg-gray-50 flex flex-col justify-between">
                <div>
                  {/* Pending Transactions Section */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-yellow-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M4 4a2 2 0 00-2 2v4h16V6a2 2 0 00-2-2H4z" />
                          <path
                            fillRule="evenodd"
                            d="M18 11H2v5a2 2 0 002 2h12a2 2 0 002-2v-5zM4 15a1 1 0 100-2 1 1 0 000 2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Pending Transactions
                        </h3>
                      </div>
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                        {groupTransactions.pending.length}
                      </span>
                    </div>
                    {groupTransactions.pending.length > 0 ? (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {groupTransactions.pending.map(
                          (txn: any, index: number) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-all"
                            >
                              <div>
                                <p className="text-gray-800 font-medium">
                                  {txn.sender?.fullName || "Unknown"}
                                  <span className="mx-2 text-gray-400">→</span>
                                  {txn.receiver?.fullName || "Unknown"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Pending Transaction
                                </p>
                              </div>
                              <span className="font-bold text-yellow-700">
                                ₹{txn.amount.toLocaleString()}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-500 italic">
                          No pending transactions found
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Who Owes Whom Section */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-700">
                          Who Owes Whom
                        </h3>
                      </div>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                        {owesList.length}
                      </span>
                    </div>
                    {owesList.length > 0 ? (
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {owesList.map((entry, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 flex justify-between items-center shadow-sm hover:shadow-md transition-all"
                          >
                            <div>
                              <p className="text-gray-800 font-medium">
                                {entry.from}
                                <span className="mx-2 text-gray-400">owes</span>
                                {entry.to}
                              </p>
                              <p className="text-xs text-gray-500">
                                Pending Settlement
                              </p>
                            </div>
                            <span className="font-bold text-red-600">
                              ₹{entry.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-500 italic">
                          All payments settled!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => router.push("/expenses")}
                    className="
      flex items-center justify-center 
      bg-indigo-500 
      text-white 
      py-3 
      rounded-lg 
      hover:bg-indigo-600 
      transition-colors 
      group
    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white group-hover:animate-pulse"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path
                        fillRule="evenodd"
                        d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Check Expenses
                  </button>
                  <button
                    onClick={() => router.push("/payments")}
                    className="
      flex items-center justify-center 
      bg-green-500 
      text-white 
      py-3 
      rounded-lg 
      hover:bg-green-600 
      transition-colors 
      group
    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-white group-hover:animate-pulse"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Settle Payments
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
