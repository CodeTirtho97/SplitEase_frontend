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

export default function Groups() {
  const router = useRouter();
  const { groups, refreshGroups } = useGroups();
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

  // Fetch Who Owes Whom Data
  useEffect(() => {
    const fetchOwesData = async () => {
      if (selectedGroup) {
        try {
          const owesData = await calculateOwes(selectedGroup._id); // ✅ Await the promise
          setOwesList(owesData);
        } catch (error) {
          console.error("Error calculating owes:", error);
        }
      }
    };

    fetchOwesData();
  }, [selectedGroup]);

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

  useEffect(() => {
    if (selectedGroup) {
      console.log("🛠️ Selected Group Data:", selectedGroup);

      if (!selectedGroup.members || !Array.isArray(selectedGroup.members)) {
        console.warn(
          "⚠️ Members array is missing or invalid!",
          selectedGroup.members
        );
        return;
      }

      // ✅ Ensure the creator is not in the members list
      const filteredMembers = selectedGroup.members.filter(
        (member: any) => member._id !== selectedGroup.createdBy._id
      );

      console.log("✅ Filtered Members (Excluding Creator):", filteredMembers);

      setNewMembers(filteredMembers.map((member: any) => member._id));
      setGroupDescription(selectedGroup.description || "");
      setCompletedStatus(selectedGroup.completed || false);
    }
  }, [selectedGroup]);

  const { friends, refreshFriends } = useGroups();
  //console.log("✅ Friends in Group Page:", friends);
  //console.log("🛠️ Group Context Debug:", { friends, refreshFriends });

  // Fetch friends when modal opens
  useEffect(() => {
    //console.log("🚀 Forcing Friends API Call on Page Load");
    refreshFriends(); // ✅ Calls the API on page load
  }, []);

  useEffect(() => {
    console.log("🚀 Fetching Groups on Page Load...");
    refreshGroups(); // ✅ Ensures groups are reloaded when page loads
  }, []);

  useEffect(() => {
    console.log("🛠️ Groups Data:", groups);
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
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // ✅ Create New Group
  const handleAddGroup = async () => {
    if (!newGroup.name.trim() || newGroup.members.length === 0) {
      setToast({ message: "Group name & members required!", type: "error" });
      return;
    }

    try {
      await createNewGroup(newGroup);
      setIsModalOpen(false);
      refreshGroups();
      setToast({ message: "Group created successfully!", type: "success" });

      // Reset fields
      setNewGroup({ name: "", description: "", type: "Friends", members: [] });
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    }
  };

  // ✅ Edit Group Details
  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setGroupDescription(group.description || "");
    setCompletedStatus(group.completed || false);
    setNewMembers([...group.members]);
    setIsEditModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (newMembers.length < 1) {
      // ✅ Ensure at least 1 member + creator
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
      members: [...newMembers, selectedGroup.createdBy._id], // ✅ Ensure creator is included
    };

    try {
      await updateGroup(selectedGroup._id, updatedData);
      setIsEditModalOpen(false);
      refreshGroups();
      setToast({ message: "✅ Group updated successfully!", type: "success" });
    } catch (error) {
      console.error("Error updating group:", error);
      setToast({ message: "❌ Failed to update group!", type: "error" });
    }
  };

  // ✅ Delete Group
  const handleDeleteGroup = (group: any) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup) return;
    try {
      await removeGroup(selectedGroup._id);
      setIsDeleteModalOpen(false);
      refreshGroups();
      setToast({ message: "Group deleted successfully!", type: "success" });
    } catch (error: any) {
      setToast({ message: error.message, type: "error" });
    }
  };

  // ✅ Fetch Group Transactions and "Who Owes Whom" when viewing a group
  const handleViewGroup = async (group: any) => {
    if (!group || !group._id) {
      console.error("❌ Invalid group selected:", group);
      setToast({ message: "Invalid group selected!", type: "error" });
      return;
    }

    console.log("🔍 Group Creator Data:", group.createdBy);

    setSelectedGroup(group);
    setIsViewModalOpen(true);

    try {
      // ✅ Fetch transactions safely
      const transactions = await fetchGroupTransactions(group._id);
      console.log("🔹 Transactions Fetched:", transactions);

      if (!transactions || typeof transactions !== "object") {
        console.warn("⚠️ Unexpected transaction data:", transactions);
        setGroupTransactions({ completed: [], pending: [] });
      } else {
        setGroupTransactions(transactions);
      }

      // ✅ Fetch "Who Owes Whom" safely
      const owes = await calculateOwes(group._id);
      console.log("🔹 Owes Data Fetched:", owes);
      setOwesList(owes || []); // Ensure empty array if API fails
    } catch (error: any) {
      console.error("❌ Error fetching transactions:", error.message || error);
      setToast({ message: "Failed to fetch transactions!", type: "error" });

      // ✅ Ensure UI doesn't break by setting safe defaults
      setGroupTransactions({ completed: [], pending: [] });
      setOwesList([]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="groups" />

      <div className="flex-1 p-8">
        {/* 🚀 Toast Notification */}
        {toast && (
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
                .map((group) => {
                  return (
                    <div
                      key={group._id}
                      className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition"
                    >
                      {/* Group Avatar */}
                      <Image
                        src={avatarMap[group.type] || "/friends_group.png"} // Fallback avatar
                        alt="Group Avatar"
                        width={50}
                        height={50}
                        className="rounded-full mr-3"
                      />

                      {/* Group Details */}
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

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          text="Edit"
                          onClick={() => handleEditGroup(group)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-md"
                        />
                        <Button
                          text="View"
                          onClick={() => handleViewGroup(group)} // ✅ Uses function to fetch transactions
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* ✅ Edit Group Modal (Two-Column Layout) */}
          {isEditModalOpen && selectedGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg w-[700px] max-w-2xl flex flex-col gap-6 relative">
                {/* 🔹 Modal Title */}
                <h2 className="text-xl font-bold text-center">Edit Group</h2>

                {/* ✅ Two-Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 🔹 Left Column */}
                  <div className="flex flex-col gap-4">
                    {/* Group Name (Non-Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">
                        Group Name
                      </label>
                      <input
                        type="text"
                        value={selectedGroup.name}
                        disabled
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* Group Type (Non-Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">
                        Group Type
                      </label>
                      <input
                        type="text"
                        value={selectedGroup.type}
                        disabled
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* Group Description (Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">
                        Group Description
                      </label>
                      <textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={completedStatus}
                        onChange={(e) => setCompletedStatus(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <label className="text-gray-700 font-semibold">
                        Completed
                      </label>
                    </div>
                  </div>

                  {/* 🔹 Right Column */}
                  <div className="flex flex-col gap-4">
                    {/* Group Owner (Created By) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">
                        Group Creator
                      </label>
                      <input
                        type="text"
                        value={selectedGroup.createdBy?.fullName || "Unknown"} // ✅ Fetch from `createdBy`
                        disabled
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* Add/Remove Members */}
                    <div>
                      <label className="block text-gray-700 font-semibold">
                        Group Members
                      </label>

                      {/* Member Dropdown - Show "No new friends to add" when empty */}
                      <select
                        onChange={(e) => {
                          const newMemberId = e.target.value;
                          if (
                            newMemberId &&
                            !newMembers.includes(newMemberId)
                          ) {
                            setNewMembers([...newMembers, newMemberId]);
                          }
                        }}
                        className="w-full border p-2 rounded mb-3"
                        disabled={
                          friends.length === 0 ||
                          friends.every(
                            (friend) =>
                              friend._id === selectedGroup.createdBy._id ||
                              newMembers.includes(friend._id)
                          )
                        } // ✅ Disable dropdown if no new members to add
                      >
                        {friends.length > 0 &&
                        !friends.some(
                          (friend) =>
                            !newMembers.includes(friend._id) &&
                            friend._id !== selectedGroup.createdBy._id
                        ) ? (
                          <option value="">No new friends to add</option> // ✅ Show this when no friends available
                        ) : (
                          <>
                            <option value="">Add a new member...</option>
                            {friends
                              .filter(
                                (friend) =>
                                  friend._id !== selectedGroup.createdBy._id && // ✅ Exclude creator
                                  !newMembers.includes(friend._id) // ✅ Exclude already added members
                              )
                              .map((friend) => (
                                <option key={friend._id} value={friend._id}>
                                  {friend.fullName}
                                </option>
                              ))}
                          </>
                        )}
                      </select>

                      {/* Member List with Remove Option */}
                      <div className="flex flex-wrap gap-2 mt-1 border p-2 rounded-md min-h-[50px]">
                        {newMembers.length > 0 ? (
                          newMembers.map((memberId, index) => {
                            const friend = friends.find(
                              (f) => f._id === memberId
                            );
                            return (
                              friend && (
                                <span
                                  key={index}
                                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                                >
                                  {friend.fullName}
                                  {/* Remove Button */}
                                  <button
                                    type="button"
                                    className="text-white ml-2"
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
                                    ❌
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
                </div>

                {/* 🔹 Action Buttons */}
                <div className="flex justify-between mt-4">
                  <Button
                    text="Cancel"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  />
                  <Button
                    text="Save Changes"
                    onClick={handleSaveGroup}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Completed Groups */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Completed Groups
            </h2>

            {groups.filter((group) => group.completed).length === 0 ? (
              <p className="text-gray-500 italic">No completed groups found.</p>
            ) : (
              groups
                .filter((group) => group.completed) // ✅ Filtering correctly using `completed: true`
                .map((group) => (
                  <div
                    key={group._id}
                    className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition"
                  >
                    {/* Group Avatar */}
                    <Image
                      src={avatarMap[group.type] || "/friends_group.png"} // ✅ Fallback image handling
                      alt="Group Avatar"
                      width={50}
                      height={50}
                      className="rounded-full mr-3"
                    />

                    {/* Group Details */}
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

                    {/* Delete Button */}
                    <Button
                      text="Delete"
                      onClick={() => handleDeleteGroup(group)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    />
                  </div>
                ))
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && selectedGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transition-all transform scale-95 animate-fadeIn">
                {/* 🔹 Modal Title */}
                <h2 className="text-xl font-semibold text-red-600">
                  Delete Group
                </h2>

                {/* 🔹 Group Details */}
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

                {/* 🔹 Group Info */}
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

                {/* 🔹 Action Buttons */}
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

          {/* Create Group Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[750px] max-w-[750px] flex flex-col gap-6 relative transition-all transform scale-95 animate-fadeIn">
                {/* Group Avatar */}
                <div className="flex justify-center mb-4">
                  <Image
                    src={avatarMap[newGroup.type]} // Dynamically fetch avatar based on group type
                    alt={`${newGroup.type} Group Avatar`}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-gray-300 shadow-lg"
                  />
                </div>

                <h2 className="text-xl text-center font-semibold mb-4">
                  Create a New Group
                </h2>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column - Group Details */}
                  <div className="flex-1">
                    {/* Group Name */}
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

                    {/* Group Description */}
                    <textarea
                      placeholder="Group Description (optional)"
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded mb-3"
                    />

                    {/* Group Type */}
                    <select
                      value={newGroup.type}
                      onChange={handleGroupTypeChange}
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

                  {/* Right Column - Member Selection */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Select Members
                    </h3>
                    {/* Dropdown for Available Friends (Real List from Context) */}
                    <select
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !newGroup.members.includes(e.target.value)
                        ) {
                          setNewGroup((prevGroup) => ({
                            ...prevGroup,
                            members: [...prevGroup.members, e.target.value],
                          }));
                        }
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
                    ;{/* Selected Members List */}
                    <h3 className="font-semibold text-gray-700 mt-2">
                      Selected Members{" "}
                      {newGroup.members.length > 0
                        ? `(${newGroup.members.length})`
                        : ""}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1 border p-2 rounded-md min-h-[50px]">
                      {newGroup.members.length > 0 ? (
                        newGroup.members.map((memberId, index) => {
                          const friend = friends.find(
                            (f) => f._id === memberId
                          );
                          return (
                            friend && (
                              <span
                                key={index}
                                className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                              >
                                {friend.fullName}
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
                                  ❌
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

                {/* Footer - Buttons */}
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

          {/* ✅ View Group Modal */}
          {isViewModalOpen && selectedGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg w-[900px] max-w-5xl h-auto flex flex-col md:flex-row gap-8">
                {/* 🔹 Left Column - Group Info */}
                <div className="flex-1 p-6">
                  {/* Group Avatar, Name, Type */}
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
                      <h2 className="text-xl font-bold">
                        {selectedGroup.name}
                      </h2>
                      <p className="text-gray-500 text-sm">
                        {selectedGroup.type} Group
                      </p>
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-700">
                      Group Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroup.description || "No description provided."}
                    </p>
                  </div>

                  {/* Group Owner */}
                  <div className="mt-2">
                    <h3 className="font-semibold text-gray-700">Group Owner</h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroup.createdBy?.fullName || "Unknown"}
                    </p>
                  </div>

                  {/* Members List */}
                  <h3 className="font-semibold text-gray-700 mt-4">
                    Members ({selectedGroup?.members?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 max-h-[200px] overflow-y-auto">
                    {selectedGroup?.members?.map(
                      (member: any, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-200 px-3 py-1 rounded-md text-sm"
                        >
                          {member.fullName || "Unknown"}
                        </span>
                      )
                    )}
                  </div>

                  {/* Start Date & Status */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <h4 className="text-gray-700 font-semibold">
                        Start Date
                      </h4>
                      <p className="text-sm">
                        {new Date(selectedGroup.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* Group Status */}
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

                  {/* Close Button */}
                  <div className="flex justify-center mt-6">
                    <Button
                      text="Close"
                      onClick={() => setIsViewModalOpen(false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg text-lg"
                    />
                  </div>
                </div>

                {/* 🔹 Right Column - Transactions & Actions */}
                <div className="flex-1 p-6 flex flex-col gap-6 bg-gray-50 rounded-lg">
                  {/* Recent Transactions */}
                  <div>
                    <h3 className="font-semibold text-gray-700">
                      Recent Transactions
                    </h3>
                    {/* Display transactions only if groupTransactions is an array */}
                    {Array.isArray(groupTransactions) ? (
                      groupTransactions
                        .filter((txn) => txn.groupId === selectedGroup._id)
                        .slice(0, 3)
                        .map((txn, index) => (
                          <div
                            key={index}
                            className="flex justify-between border-b py-2"
                          >
                            <span className="text-gray-600">
                              {txn.member.fullName || "Unknown"}
                            </span>
                            <span className="font-bold">
                              ₹{txn.amount.toLocaleString()}
                            </span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No transactions found.
                      </p>
                    )}
                  </div>

                  {/* Who Owes Whom Calculation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Who Owes Whom
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

                  {/* Navigation Buttons - Updated Layout */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => router.push("/expenses")}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg"
                    >
                      Go to Expense Page
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/split-expenses?groupId=${selectedGroup._id}`
                        )
                      }
                      className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 text-lg"
                    >
                      Go to Split Expenses
                    </button>
                    <button
                      onClick={() => router.push("/payments")}
                      className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 text-lg"
                    >
                      Settle Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
