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
import Cookies from "js-cookie"; // Using cookies instead of localStorage
import { useAuth } from "@/context/authContext"; // Import useAuth for authentication

export default function Groups() {
  const router = useRouter();
  const { groups, refreshGroups, friends, refreshFriends } = useGroups();
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
      } catch (error: any) {
        setToast({ message: error.message, type: "error" });
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

  if (authLoading) {
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

        {/* Kanban Style Group Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Groups */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Active Groups
            </h2>

            {groups.filter((group) => !group.completed).length === 0 ? (
              <p className="text-gray-500 italic">No active groups found.</p>
            ) : (
              groups
                .filter((group) => !group.completed)
                .map((group) => (
                  <div
                    key={group._id}
                    className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition"
                  >
                    <Image
                      src={avatarMap[group.type] || "/friends_group.png"} // Fallback avatar
                      alt="Group Avatar"
                      width={50}
                      height={50}
                      className="rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{group.name}</h3>
                      <p className="text-sm text-gray-600">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />{" "}
                        {group.members.length} members · Created by{" "}
                        <span className="font-semibold">
                          {typeof group.createdBy === "object" &&
                          group.createdBy?.fullName
                            ? group.createdBy.fullName
                            : "Unknown"}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          Created on{" "}
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        text="Edit"
                        onClick={() => handleEditGroup(group)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                      />
                      <Button
                        text="View"
                        onClick={() => handleViewGroup(group)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                      />
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Completed Groups */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Completed Groups
            </h2>

            {groups.filter((group) => group.completed).length === 0 ? (
              <p className="text-gray-500 italic">No completed groups found.</p>
            ) : (
              groups
                .filter((group) => group.completed)
                .map((group) => (
                  <div
                    key={group._id}
                    className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition"
                  >
                    <Image
                      src={avatarMap[group.type] || "/friends_group.png"} // Fallback image
                      alt="Group Avatar"
                      width={50}
                      height={50}
                      className="rounded-full mr-3"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{group.name}</h3>
                      <p className="text-sm text-gray-600">
                        <FontAwesomeIcon icon={faUser} className="mr-1" />{" "}
                        {group.members.length} members · Created by{" "}
                        <span className="font-semibold">
                          {typeof group.createdBy === "object" &&
                          group.createdBy?.fullName
                            ? group.createdBy.fullName
                            : "Unknown"}
                        </span>
                        <br />
                        <span className="text-xs text-gray-500">
                          Created on{" "}
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <Button
                      text="Delete"
                      onClick={() => handleDeleteGroup(group)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    />
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal (Client-side only) */}
        {isDeleteModalOpen &&
          selectedGroup &&
          typeof window !== "undefined" && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
              suppressHydrationWarning
            >
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all transform scale-95 animate-fadeIn">
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

        {/* Create Group Modal (Client-side only) */}
        {isModalOpen && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
            suppressHydrationWarning
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-[750px] max-w-[750px] flex flex-col gap-6 relative transition-all transform scale-95 animate-fadeIn">
              <div className="flex justify-center mb-4">
                <Image
                  src={avatarMap[newGroup.type]}
                  alt={`${newGroup.type} Group Avatar`}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-gray-300 shadow-lg"
                />
              </div>
              <h2 className="text-xl text-center font-semibold mb-4">
                Create a New Group
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Group Name *"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-3"
                    required
                  />
                  <textarea
                    placeholder="Group Description (optional)"
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-3"
                  />
                  <select
                    value={newGroup.type}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, type: e.target.value })
                    }
                    className="w-full border p-2 rounded mb-3"
                    required
                  >
                    <option value="Travel">Travel/Trip</option>
                    <option value="Household">Household</option>
                    <option value="Event">Event/Party</option>
                    <option value="Work">Work/Office</option>
                    <option value="Friends">Friends/Family</option>
                  </select>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Select Members
                  </h3>
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
                    className="w-full border p-2 rounded mb-3"
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
                  <h3 className="font-semibold text-gray-700 mt-2">
                    Selected Members{" "}
                    {newGroup.members.length > 0
                      ? `(${newGroup.members.length})`
                      : ""}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 border p-2 rounded-md min-h-[50px]">
                    {newGroup.members.length > 0 ? (
                      newGroup.members.map((memberId, index) => {
                        const friend = friends.find((f) => f._id === memberId);
                        return (
                          friend && (
                            <span
                              key={index}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                            >
                              <span>{friend.fullName}</span>
                              <button
                                type="button"
                                className="text-white ml-2"
                                onClick={() =>
                                  setNewGroup((prevGroup) => ({
                                    ...prevGroup,
                                    members: prevGroup.members.filter(
                                      (id) => id !== memberId
                                    ),
                                  }))
                                }
                              >
                                {"❌"}
                              </button>
                            </span>
                          )
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No members selected.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  text="Cancel"
                  onClick={() => setIsModalOpen(false)}
                  className="text-white bg-red-500 hover:bg-red-600 transition-all duration-300 ease-in-out px-6 py-3 rounded-md w-[45%]"
                />
                <Button
                  text="Create Group"
                  onClick={handleAddGroup}
                  className="text-white bg-green-500 hover:bg-green-600 transition-all duration-300 ease-in-out px-6 py-3 rounded-md w-[45%]"
                />
              </div>
            </div>
          </div>
        )}

        {/* View Group Modal (Client-side only) */}
        {isViewModalOpen && selectedGroup && typeof window !== "undefined" && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4"
            suppressHydrationWarning
          >
            <div className="bg-white p-8 rounded-lg shadow-lg w-[900px] max-w-5xl h-auto flex flex-col md:flex-row gap-8">
              <div className="flex-1 p-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      selectedGroup?.avatar ||
                      avatarMap[selectedGroup?.type] ||
                      "/friends_group.png"
                    }
                    alt="Group Avatar"
                    width={80}
                    height={80}
                    className="rounded-full border-2 shadow-lg"
                  />
                  <div>
                    <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                    <p className="text-gray-500 text-sm">
                      {selectedGroup.type} Group
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700">Group Details</h3>
                  <p className="text-sm text-gray-600">
                    {selectedGroup.description || "No description provided."}
                  </p>
                </div>
                <div className="mt-2">
                  <h3 className="font-semibold text-gray-700">Group Owner</h3>
                  <p className="text-sm text-gray-600">
                    {selectedGroup.createdBy?.fullName || "Unknown"}
                  </p>
                </div>
                <h3 className="font-semibold text-gray-700 mt-4">
                  Members ({selectedGroup?.members?.length || 0})
                </h3>
                <div className="flex flex-col text-start gap-2 mt-1 max-h-[200px] overflow-y-auto">
                  {selectedGroup?.members?.map((member: any, index: number) => (
                    <span
                      key={index}
                      className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm"
                    >
                      {member.fullName || "Unknown"}
                    </span>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-100 p-3 rounded-md text-center">
                    <h4 className="text-gray-700 font-semibold">Start Date</h4>
                    <p className="text-sm">
                      {new Date(selectedGroup.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-semibold text-gray-700">
                      Group Status
                    </h3>
                    <p
                      className={`text-sm font-semibold ${
                        selectedGroup.completed
                          ? "text-green-600"
                          : "text-blue-500"
                      }`}
                    >
                      {selectedGroup.completed ? "✅ Completed" : "🟢 Active"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-10 bottom-2">
                  <Button
                    text="Close"
                    onClick={() => setIsViewModalOpen(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg text-lg"
                  />
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col gap-6 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Pending Transactions ({groupTransactions.pending.length})
                  </h3>
                  {groupTransactions.pending.length > 0 ? (
                    groupTransactions.pending.map((txn: any, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between border-b py-2 text-yellow-600"
                      >
                        <span className="text-gray-600">
                          {txn.sender?.fullName || "Unknown"} →{" "}
                          {txn.receiver?.fullName || "Unknown"}
                        </span>
                        <span className="font-bold">
                          ₹{txn.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">
                      No pending transactions found.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Who Owes Whom ({owesList.length})
                  </h3>
                  {owesList.length > 0 ? (
                    <ul className="text-gray-600">
                      {owesList.map((entry, index) => (
                        <li key={index} className="border-b py-2">
                          {entry.from} owes {entry.to}{" "}
                          <span className="font-bold">
                            ₹{entry.amount.toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      All payments settled!
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/expenses")}
                    className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 text-lg"
                  >
                    Check Expenses
                  </button>
                  <button
                    onClick={() => router.push("/payments")}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 text-lg"
                  >
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
