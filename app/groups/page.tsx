"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEye,
  faPenAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useGroups } from "@/context/groupContext";
import {
  createNewGroup,
  updateGroup,
  removeGroup,
  fetchGroupTransactions,
  calculateOwes,
  getGroupDebtSummary,
} from "@/utils/api/group";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { formatCurrency } from "@/utils/formatCurrency";
import NotificationPanel from "@/components/NotificationPanel";
import ConnectionStatus from "@/components/ConnectionStatus";

interface DebtSummary {
  originalTransactionCount: number;
  optimizedTransactionCount: number;
  reductionPercentage: number;
  optimizedSettlements: Array<{
    from: { fullName: string };
    to: { fullName: string };
    amount: number;
  }>;
  settlementSummary: string[];
}

export default function Groups() {
  const router = useRouter();
  const { groups, refreshGroups, friends, refreshFriends } = useGroups();
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
  const {
    addEventListener,
    removeEventListener,
    joinGroupRoom,
    leaveGroupRoom,
  } = useSocket();
  const [owesList, setOwesList] = useState<any[]>([]);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [debtSummaryLoading, setDebtSummaryLoading] = useState(false);

  // Enhanced state management
  const [isUpdating, setIsUpdating] = useState(false);

  const [shouldRefreshGroups, setShouldRefreshGroups] = useState(false);

  useEffect(() => {
    // If not loading and no token exists, redirect to login
    if (!authLoading && !token) {
      router.push("/login"); // Adjust the login route as needed
    }
  }, [token, authLoading, router]);

  // Add this useEffect for real-time group updates
  useEffect(() => {
    // Handler for group updates
    const handleGroupUpdate = (data: any) => {
      console.log("Group update received:", data);

      if (
        data.event === "group_created" ||
        data.event === "group_updated" ||
        data.event === "group_deleted"
      ) {
        // Instead of immediately refreshing, set a flag
        setShouldRefreshGroups(true);
      }
    };

    // Register event listeners
    addEventListener("group_update", handleGroupUpdate);

    // Cleanup on unmount
    return () => {
      removeEventListener("group_update", handleGroupUpdate);
    };
  }, [addEventListener, removeEventListener]);

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "Friends",
    members: [] as string[],
  });

  const [groupDescription, setGroupDescription] = useState("");
  const [completedStatus, setCompletedStatus] = useState(false);
  const [newMembers, setNewMembers] = useState<string[]>([]);

  // Sync selected group data (Client-side only)
  useEffect(() => {
    if (selectedGroup) {
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
    if (isModalOpen && token) {
      refreshFriends(); // Calls the API only when modal opens, using token from groupContext
    }
  }, [isModalOpen, refreshFriends, token]);

  // Fetch groups on page load (Client-side only)
  useEffect(() => {
    if (token) {
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


  // ✅ Create New Group (Client-side only)
  const handleAddGroup = async () => {
    if (token) {
      if (!newGroup.name.trim() || newGroup.members.length === 0) {
        toast.error("Group name & members required!");
        return;
      }

      try {
        setIsUpdating(true);

        await createNewGroup(newGroup, token);

        setIsModalOpen(false);

        // Reset form fields
        setNewGroup({
          name: "",
          description: "",
          type: "Friends",
          members: [],
        });

        // Show success message
        toast.success("Group created successfully!");
      } catch (error: any) {
        console.error("Error creating group:", error);
        toast.error(error.message || "Failed to create group");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // ✅ Edit Group Details (Client-side only)
  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setGroupDescription(group.description || "");
    setCompletedStatus(group.completed || false);
    setNewMembers([...group.members]);
    setIsEditModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (token) {
      if (newMembers.length < 1) {
        toast.error("A group must have at least 2 members (including the creator)!");
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
        setShouldRefreshGroups(true);
        toast.success("Group updated successfully!");
      } catch (error) {
        console.error("Error updating group:", error);
        toast.error("Failed to update group!");
      }
    }
  };

  // ✅ Delete Group (Client-side only)
  const handleDeleteGroup = (group: any) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedGroup && token) {
      try {
        await removeGroup(selectedGroup._id, token); // Use token from AuthContext
        setIsDeleteModalOpen(false);
        setShouldRefreshGroups(true);
        toast.success("Group deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete group");
      }
    }
  };

  // ✅ Fetch Group Transactions and "Who Owes Whom" when viewing a group (Client-side only)
  const handleViewGroup = async (group: any) => {
    if (token) {
      if (!group || !group._id) {
        console.error("Invalid group selected:", group);
        toast.error("Invalid group selected!");
        return;
      }

      setSelectedGroup(group);
      setIsViewModalOpen(true);

      // Join the group's socket room for real-time updates
      joinGroupRoom(group._id);

      try {
        const transactions = await fetchGroupTransactions(group._id, token);
        setGroupTransactions(transactions || { completed: [], pending: [] });

        const owes = await calculateOwes(group._id, token);
        setOwesList(owes || []);

        setDebtSummary(null);
        setDebtSummaryLoading(true);
        const summary = await getGroupDebtSummary(group._id, token);
        setDebtSummary(summary);
      } catch (error: any) {
        console.error("Error fetching transactions:", error.message || error);
        toast.error("Failed to fetch transactions!");
        setGroupTransactions({ completed: [], pending: [] });
        setOwesList([]);
      } finally {
        setDebtSummaryLoading(false);
      }
    }
  };

  const closeViewModal = () => {
    if (selectedGroup && selectedGroup._id) {
      // Leave the socket room when modal closes
      leaveGroupRoom(selectedGroup._id);
    }
    setIsViewModalOpen(false);
  };

  // UseEffect to handle group refresh
  useEffect(() => {
    if (shouldRefreshGroups && token) {
      refreshGroups();
      // Reset the refresh flag
      setShouldRefreshGroups(false);
    }
  }, [shouldRefreshGroups, token, refreshGroups]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 pt-16">
        <Sidebar activePage="groups" />
        <div className="flex-1 min-w-0 p-8 animate-pulse">
          <div className="flex items-center justify-between mb-10">
            <div className="h-9 w-32 bg-gray-200 rounded-lg" />
            <div className="h-10 w-32 bg-gray-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
                <div className="h-10 w-16 bg-gray-200 rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="h-1.5 bg-gray-200" />
                <div className="p-6">
                  <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded-2xl mb-4" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-gray-50 pt-16"
      suppressHydrationWarning
    >
      <Sidebar activePage="groups" />

      <div className="fixed top-5 right-5 z-50">
        <NotificationPanel />
      </div>
      <ConnectionStatus />

      <div className="flex-1 min-w-0 p-8">
        {/* Modern Page Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <Button
            text="Add Group"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="lg"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xl" />
            <span>Add Group</span>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Groups", value: groups.length, accent: "bg-indigo-500", numColor: "text-indigo-600" },
            { label: "Active Groups", value: groups.filter((g) => !g.completed).length, accent: "bg-emerald-500", numColor: "text-emerald-600" },
            { label: "Completed Groups", value: groups.filter((g) => g.completed).length, accent: "bg-slate-400", numColor: "text-slate-600" },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className={`h-1 ${card.accent}`}></div>
              <div className="p-5 flex flex-col items-center">
                <p className={`text-4xl font-bold ${card.numColor} mb-1`}>{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Updated Group Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Groups with Energetic Design */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-1 bg-emerald-500"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
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
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Create a Group
                  </button>
                </div>
              ) : (
                groups
                  .filter((group) => !group.completed)
                  .map((group) => (
                    <div
                      key={group._id}
                      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 flex items-center hover:border-gray-300 hover:shadow-sm transition-all duration-150"
                    >
                      <div className="mr-5">
                        <Image
                          src={
                            avatarMap[group.type] ||
                            "/friends_group_gradient.png"
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
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
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
                          variant="secondary"
                          size="sm"
                          icon={faPenAlt} // or faTrash if you prefer
                          className="font-medium"
                        />
                        <Button
                          text="View"
                          onClick={() => handleViewGroup(group)}
                          variant="info"
                          size="sm"
                          icon={faEye} // or faTrash if you prefer
                          className="font-medium"
                        />
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Completed Groups with Subdued Design */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-1 bg-slate-400"></div>
            <div className="p-6">
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
                      className="bg-white rounded-lg border border-gray-200 p-4 mb-3 flex items-center opacity-60 hover:opacity-100 transition-all duration-150"
                    >
                      <div className="mr-5 relative">
                        <Image
                          src={
                            avatarMap[group.type] ||
                            "/friends_group_gradient.png"
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
                              Created by{" "}
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
                        variant="danger"
                        size="sm"
                        icon={faTrash} // or faTrash if you prefer
                        className="font-medium"
                      />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {isDeleteModalOpen &&
          selectedGroup && (
            <div
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
              suppressHydrationWarning
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
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
                  <div className="flex space-x-4 justify-between">
                    <Button
                      text="Cancel"
                      onClick={() => setIsDeleteModalOpen(false)}
                      variant="secondary"
                      size="md"
                    />
                    <Button
                      text="Delete"
                      onClick={handleConfirmDelete}
                      variant="danger"
                      size="md"
                      loading={isUpdating} // Use your loading state if applicable
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {isModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
            suppressHydrationWarning
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Create a New Group
                </h2>
                <Image
                  src={avatarMap[newGroup.type]}
                  alt={`${newGroup.type} Group Avatar`}
                  width={48}
                  height={48}
                  className="bg-gray-50 p-1 rounded-lg border border-gray-200"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
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
                                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                  <span>{friend.fullName}</span>
                                  <button
                                    type="button"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
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
                  variant="secondary"
                  size="md"
                  className="font-medium"
                />
                <Button
                  text={isUpdating ? "Creating..." : "Create Group"}
                  onClick={handleAddGroup}
                  variant="success"
                  size="md"
                  className="font-medium"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Group</h2>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                      placeholder="Add a detailed description"
                    />
                  </div>

                  {/* Completed Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={completedStatus}
                      onChange={(e) => setCompletedStatus(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
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
                                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                >
                                  <span>{friend.fullName}</span>
                                  <button
                                    type="button"
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    onClick={() => {
                                      if (newMembers.length <= 1) {
                                        toast.error("❌ A group must have at least 2 members (including the creator)!");
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
                  variant="secondary"
                  size="md"
                />
                <Button
                  text="Save Changes"
                  onClick={handleSaveGroup}
                  variant="success"
                  size="md"
                />
              </div>
            </div>
          </div>
        )}

        {isViewModalOpen && selectedGroup && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50"
            suppressHydrationWarning
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto grid grid-cols-2 overflow-hidden">
              {/* Left Panel: Group Overview */}
              <div className="p-8 bg-white border-r border-gray-100">
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
                    <p className="text-gray-500 text-sm">
                      {selectedGroup.type} Group
                    </p>
                  </div>
                </div>

                {/* Group Details Section */}
                <div className="space-y-4">
                  {/* Group Description Section */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-gray-700 text-sm">
                        {selectedGroup.description || (
                          <span className="text-gray-400 italic">No description provided</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Group Owner Section */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Owner</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 font-semibold text-sm">
                          {selectedGroup.createdBy?.fullName?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-800 text-sm font-medium">
                          {selectedGroup.createdBy?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">Group Creator</p>
                      </div>
                    </div>
                  </div>

                  {/* Members Section */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</p>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {selectedGroup?.members?.length || 0}
                      </span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {selectedGroup?.members?.map(
                        (member: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium text-xs">
                                  {member.fullName?.charAt(0).toUpperCase() || "?"}
                                </span>
                              </div>
                              <span className="text-gray-800 text-sm">
                                {member.fullName || "Unknown"}
                              </span>
                            </div>
                            {member._id === selectedGroup.createdBy._id && (
                              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                Owner
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Group Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(selectedGroup.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className={`text-sm font-semibold ${selectedGroup.completed ? "text-emerald-600" : "text-blue-600"}`}>
                        {selectedGroup.completed ? "Completed" : "Active"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6">
                  <Button
                    text="Close"
                    onClick={closeViewModal}
                    variant="secondary"
                    size="md"
                  />
                </div>
              </div>

              {/* Right Panel: Financial Details */}
              <div className="p-8 bg-gray-50 flex flex-col justify-between">
                <div className="overflow-y-auto max-h-[600px] pr-1">
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
                              className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:border-gray-300 transition-all"
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
                                {formatCurrency(txn.amount, txn.currency)}
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
                            className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:border-gray-300 transition-all"
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
                              {formatCurrency(entry.amount, selectedGroup?.currency)}
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

                  {/* Debt Simplification Section */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-700">Debt Simplification</h3>
                      </div>
                    </div>

                    {debtSummaryLoading ? (
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : debtSummary && debtSummary.optimizedTransactionCount !== undefined ? (
                      <div>
                        {/* Metrics banner */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900">{debtSummary.originalTransactionCount}</p>
                              <p className="text-xs text-gray-500 mt-0.5">pending txns</p>
                            </div>
                            <div className="flex items-center text-gray-400 px-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{debtSummary.optimizedTransactionCount}</p>
                              <p className="text-xs text-gray-500 mt-0.5">settlements</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-900">{debtSummary.reductionPercentage}%</p>
                              <p className="text-xs text-gray-500 mt-0.5">fewer transactions</p>
                            </div>
                          </div>
                        </div>

                        {/* Optimized settlements list */}
                        {debtSummary.optimizedSettlements.length > 0 ? (
                          <div className="space-y-2">
                            {debtSummary.optimizedSettlements.map((s, i) => (
                              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                                <div>
                                  <p className="text-gray-800 font-medium text-sm">
                                    <span className="text-blue-600">{s.from.fullName}</span>
                                    <span className="mx-2 text-gray-400">pays</span>
                                    <span className="text-gray-700">{s.to.fullName}</span>
                                  </p>
                                </div>
                                <span className="font-semibold text-gray-900">{formatCurrency(s.amount, selectedGroup?.currency)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <p className="text-gray-500 italic text-sm">All debts are settled!</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-500 italic text-sm">No debt data available</p>
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
