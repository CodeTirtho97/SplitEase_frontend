"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCheckCircle, faExclamationCircle, faUser, faRupeeSign } from "@fortawesome/free-solid-svg-icons";

export default function Groups() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUserToken] = useState<{ name: string } | null>(null);
  // View Group Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  // Dummy members list for selection
  const dummyMembers = [
    "John Doe", "Jane Smith", "Alice Johnson", "Bob Williams", "Charlie Brown",
    "David Miller", "Eve Davis", "Franklin White", "Grace Hall", "Hannah Lee"
  ];

  //Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupDescription, setGroupDescription] = useState("");
  const [groupEndDate, setGroupEndDate] = useState("");
  const [newMembers, setNewMembers] = useState<string[]>([]);

  const [groupTransactions, setGroupTransactions] = useState([
    { groupId: 1, member: "Alice", amount: 1500, date: "2024-02-12" },
    { groupId: 1, member: "Bob", amount: 1200, date: "2024-02-10" },
    { groupId: 2, member: "Charlie", amount: 800, date: "2024-01-22" },
    { groupId: 3, member: "David", amount: 2000, date: "2024-03-05" },
    { groupId: 3, member: "Eve", amount: 1000, date: "2024-03-08" },
  ]);

  // ✅ Handle Edit Group
  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setGroupDescription(group.description || "");
    setGroupEndDate(group.endDate || "");
    setNewMembers(group.membersList ? [...group.membersList] : []); // Ensure it's an array
    setIsEditModalOpen(true);
  };

  // ✅ Handle Save Edited Group
  const handleSaveGroup = () => {
    if (!groupDescription.trim()) {
      setToast({ message: "Group Description cannot be empty!", type: "error" });
      return;
    }
  
    // ✅ Update Groups List
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === selectedGroup.id
          ? { ...group, description: groupDescription, endDate: groupEndDate, membersList: newMembers }
          : group
      )
    );
  
    setToast({ message: "Group updated successfully!", type: "success" });
    setIsEditModalOpen(false);
  };

  // ✅ Handle Delete Group
  const handleDeleteGroup = (group: any) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  // ✅ Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!selectedGroup) return;
    setGroups((prevGroups) => prevGroups.filter((group) => group.id !== selectedGroup.id));
    setIsDeleteModalOpen(false);
  };

  // ✅ 🟢 Add This Function Here 🟢 ✅
  const calculateOwes = (groupId: number) => {
    const groupExpenses = groupTransactions.filter((txn) => txn.groupId === groupId);
    const memberTotals: { [key: string]: number } = {};

    // 🟢 Step 1: Calculate total paid per member
    groupExpenses.forEach((txn) => {
      if (!memberTotals[txn.member]) memberTotals[txn.member] = 0;
      memberTotals[txn.member] += txn.amount;
    });

    // 🔹 Step 2: Calculate fair share per member
    const numMembers = Object.keys(memberTotals).length;
    const fairShare = Object.values(memberTotals).reduce((sum, val) => sum + val, 0) / numMembers;

    // 🔻 Step 3: Find who owes whom
    const balances: { name: string; balance: number }[] = Object.entries(memberTotals).map(
      ([name, totalPaid]) => ({
        name,
        balance: totalPaid - fairShare, // Positive = overpaid, Negative = underpaid
      })
    );

    // 🔄 Step 4: Matching debt payments
    const owesList: { from: string; to: string; amount: number }[] = [];
    let creditors = balances.filter((m) => m.balance > 0).sort((a, b) => b.balance - a.balance);
    let debtors = balances.filter((m) => m.balance < 0).sort((a, b) => a.balance - b.balance);

    while (creditors.length > 0 && debtors.length > 0) {
      let creditor = creditors[0];
      let debtor = debtors[0];
      let settleAmount = Math.min(creditor.balance, Math.abs(debtor.balance));

      owesList.push({ from: debtor.name, to: creditor.name, amount: settleAmount });

      // Adjust balances
      creditor.balance -= settleAmount;
      debtor.balance += settleAmount;

      // Remove fully settled members
      if (creditor.balance === 0) creditors.shift();
      if (debtor.balance === 0) debtors.shift();
    }

    return owesList;
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Group Avatar Mapping
  const avatarMap: { [key: string]: string } = {
    Food: "/food_group.png",
    Entertainment: "/entertainment_group.png",
    Transport: "/transport_group.png",
    Utilities: "/utilities_group.png",
    Other: "/other_group.png",
  };

  // Default new group state
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    members: [] as string[], // Explicitly defining as string array
    type: "Other",
    initialContribution: "",
    startDate: "",
    endDate: "",
    avatar: avatarMap["Other"], // Default avatar
  });

  const [groups, setGroups] = useState([
    {
      id: 1,
      name: "Weekend Getaway",
      description: "Short trip to the hills.",
      members: 5,
      membersList: ["John Doe", "Jane Smith", "Alice Johnson", "Bob Williams", "Charlie Brown"],
      totalExpense: 12000,
      status: "Active",
      type: "Entertainment",
      startDate: "2024-02-15",
      endDate: "2024-02-18",
    },
    {
      id: 2,
      name: "Office Lunch",
      description: "Team lunch event.",
      members: 8,
      membersList: ["David Miller", "Eve Davis", "Franklin White", "Grace Hall", "Hannah Lee", "Michael Scott", "Dwight Schrute", "Pam Beesly"],
      totalExpense: 4500,
      status: "Completed",
      type: "Food",
      startDate: "2024-01-20",
      endDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Trip to Goa",
      description: "Annual beach vacation.",
      members: 6,
      membersList: ["Jim Halpert", "Angela Martin", "Oscar Martinez", "Stanley Hudson", "Kevin Malone", "Phyllis Vance"],
      totalExpense: 25000,
      status: "Active",
      type: "Transport",
      startDate: "2024-03-10",
      endDate: "2024-03-15",
    },
  ]);

  // Handle Group Type Change & Auto-Assign Avatar
  const handleGroupTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    setNewGroup({ ...newGroup, type: selectedType, avatar: avatarMap[selectedType] });
  };

  // Function to Add a New Group
  const handleAddGroup = () => {
    if (!newGroup.name.trim() || !newGroup.startDate.trim() || newGroup.members.length === 0 || !newGroup.type.trim()) {
      setToast({ message: "Please fill in all required fields!", type: "error" });
      return;
    }

    const newGroupEntry = {
      id: groups.length + 1,
      name: newGroup.name,
      description: newGroup.description,
      members: newGroup.members.length, // Store count
      membersList: [...newGroup.members], // Store full list of members
      type: newGroup.type,
      initialContribution: newGroup.initialContribution,
      startDate: newGroup.startDate,
      endDate: newGroup.endDate,
      totalExpense: 0,
      status: "Active",
      avatar: newGroup.avatar,
    };

    setGroups([...groups, newGroupEntry]);
    setIsModalOpen(false);

    // Show Success Toast
    setToast({ message: "Group created successfully!", type: "success" });

    // Reset Fields After Creation
    setNewGroup({
      name: "",
      description: "",
      members: [],
      type: "Other",
      initialContribution: "",
      startDate: "",
      endDate: "",
      avatar: avatarMap["Other"],
    });
  };

  // Simulated authentication check
    useEffect(() => {
      try {
        const storedToken = localStorage.getItem("userToken");
        if (!storedToken) {
          router.push("/login");  // Redirect if no token found
        } else {
          setUserToken({ name: "Test User" });
        }
      } catch (error) {
        console.error("Error retrieving userToken:", error);
        router.push("/login");
      }
    }, [router]);
  

  return (
    <div className="flex min-h-screen bg-gray-100 pt-20">
      {/* Sidebar */}
      <Sidebar activePage="groups" />

      <div className="flex-1 p-8">

        {/* 🚀 Toast Notification */}
        {toast && (
        <div
            className={`fixed top-24 right-6 px-6 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm transition-all duration-500 transform ${
            toast.type === "success" ? "bg-green-500" : toast.type === "info" ? "bg-blue-500" : "bg-red-500"
            }`}
            style={{ zIndex: 10000 }} // 🔥 Ensuring Toast appears above the modal
        >
            <FontAwesomeIcon icon={toast.type === "success" ? faCheckCircle : faExclamationCircle} className="text-lg" />
            <span>{toast.message}</span>
        </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Groups
            </h1>
          </div>
          {/* Add Group Button */}
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
            <h2 className="text-lg font-semibold text-gray-700">Total Groups</h2>
            <p className="text-2xl font-bold text-indigo-600">{groups.length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Active Groups</h2>
            <p className="text-2xl font-bold text-green-600">{groups.filter(group => group.status === "Active").length}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-700">Completed Groups</h2>
            <p className="text-2xl font-bold text-gray-500">{groups.filter(group => group.status === "Completed").length}</p>
          </div>
        </div>

        {/* Kanban Style Group Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Groups */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Groups</h2>
            {groups.filter(group => group.status === "Active").map(group => (
              <div key={group.id} className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition">
                {/* Group Avatar */}
                <Image src={avatarMap[group.type]} alt="Group Avatar" width={50} height={50} className="rounded-full mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    <FontAwesomeIcon icon={faUser} className="mr-1" /> {group.members} members ·  
                    <FontAwesomeIcon icon={faRupeeSign} className="mx-1" /> {group.totalExpense} spent
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
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsViewModalOpen(true);
                    }} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" 
                  />
                </div>
              </div>
            ))}
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
                      <label className="block text-gray-700 font-semibold">Group Name</label>
                      <input
                        type="text"
                        value={selectedGroup.name}
                        disabled
                        onClick={() => setToast({ message: "Cannot Edit this detail!", type: "error" })}
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* Group Type (Non-Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">Group Type</label>
                      <input
                        type="text"
                        value={selectedGroup.type}
                        disabled
                        onClick={() => setToast({ message: "Cannot Edit this detail!", type: "error" })}
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* Group Description (Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">Group Description</label>
                      <textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                    </div>

                    {/* Start Date (Non-Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">Start Date</label>
                      <input
                        type="date"
                        value={selectedGroup.startDate}
                        disabled
                        onClick={() => setToast({ message: "Cannot Edit this detail!", type: "error" })}
                        className="w-full border bg-gray-200 text-gray-500 p-2 rounded cursor-not-allowed"
                      />
                    </div>

                    {/* End Date (Editable) */}
                    <div>
                      <label className="block text-gray-700 font-semibold">End Date</label>
                      <input
                        type="date"
                        value={groupEndDate}
                        onChange={(e) => setGroupEndDate(e.target.value)}
                        className="w-full border p-2 rounded"
                      />
                    </div>

                  </div>

                  {/* 🔹 Right Column */}
                  <div className="flex flex-col gap-4">

                    {/* Add/Remove Members */}
                    <div>
                      <label className="block text-gray-700 font-semibold">Group Members</label>

                      {/* Member Dropdown */}
                      <select
                        onChange={(e) => {
                          if (e.target.value && !newMembers.includes(e.target.value)) {
                            setNewMembers([...newMembers, e.target.value]);
                          }
                        }}
                        className="w-full border p-2 rounded mb-3"
                      >
                        <option value="">Add a new member...</option>
                        {dummyMembers
                          .filter((member) => !newMembers.includes(member))
                          .map((member, index) => (
                            <option key={index} value={member}>
                              {member}
                            </option>
                          ))}
                      </select>

                      {/* Member List with Remove Option */}
                      <div className="flex flex-wrap gap-2 mt-1 border p-2 rounded-md min-h-[50px]">
                        {newMembers.length > 0 ? (
                          newMembers.map((member, index) => (
                            <span
                              key={index}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                            >
                              {member}
                              {/* Remove Button */}
                              <button
                                type="button"
                                className="text-white ml-2"
                                onClick={() =>
                                  setNewMembers(newMembers.filter((m) => m !== member))
                                }
                              >
                                ❌
                              </button>
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">No members selected.</p>
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
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Completed Groups</h2>
            {groups.filter(group => group.status === "Completed").map(group => (
              <div key={group.id} className="bg-gray-100 p-4 rounded-lg mb-3 flex items-center shadow-sm hover:shadow-md transition">
                {/* Group Avatar */}
                <Image src={avatarMap[group.type]} alt="Group Avatar" width={50} height={50} className="rounded-full mr-3" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{group.name}</h3>
                  <p className="text-sm text-gray-600"><FontAwesomeIcon icon={faUser} className="mr-1" /> {group.members} members</p>
                </div>
                <Button text="Delete" onClick={() => handleDeleteGroup(group)} className="bg-red-500 text-white px-4 py-2 rounded-md" />
              </div>
            ))}
          </div>

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && selectedGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold">Delete Group</h2>
                <p>Are you sure you want to delete <strong>{selectedGroup.name}</strong>?</p>
                <div className="flex justify-between mt-4">
                  <Button text="Cancel" onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md" />
                  <Button text="Delete" onClick={handleConfirmDelete} className="bg-red-500 text-white px-4 py-2 rounded-md" />
                </div>
              </div>
            </div>
          )}

          {/* Create Group Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-[750px] max-w-[750px] flex flex-col gap-6 relative">
                    {/* Group Avatar */}
                    <div className="flex justify-center mb-4">
                      <Image
                        src={newGroup.avatar}
                        alt="Group Avatar"
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-gray-300 shadow-lg"
                      />
                    </div>

                    <h2 className="text-xl text-center font-semibold mb-4">Create a New Group</h2>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column - Group Details */}
                      <div className="flex-1">

                      {/* Group Name */}
                      <input
                        type="text"
                        placeholder="Group Name *"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        className="w-full border p-2 rounded mb-3"
                        required
                      />

                      {/* Group Description */}
                      <textarea
                        placeholder="Group Description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        className="w-full border p-2 rounded mb-3"
                      />

                      {/* Group Type */}
                      <select
                        value={newGroup.type}
                        onChange={handleGroupTypeChange}
                        className="w-full border p-2 rounded mb-3"
                        required
                      >
                        <option value="Food">Food</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Transport">Transport</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other</option>
                      </select>

                      {/* Initial Contribution */}
                      <input
                        type="number"
                        placeholder="Initial Contribution (₹)"
                        value={newGroup.initialContribution}
                        onChange={(e) => setNewGroup({ ...newGroup, initialContribution: e.target.value })}
                        className="w-full border p-2 rounded mb-3"
                      />

                      {/* Start & End Date */}
                      <div className="flex gap-3">
                        <input
                          type="date"
                          placeholder="Start Date *"
                          value={newGroup.startDate}
                          onChange={(e) => setNewGroup({ ...newGroup, startDate: e.target.value })}
                          className="w-3/6 border p-2 rounded mb-3"
                          required
                        />
                        <input
                          type="date"
                          placeholder="End Date"
                          value={newGroup.endDate}
                          onChange={(e) => setNewGroup({ ...newGroup, endDate: e.target.value })}
                          className="w-3/6 border p-2 rounded mb-3"
                        />
                      </div>
                    </div>

                    {/* Right Column - Member Selection */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-700 mb-2">Select Members</h3>

                      {/* Dropdown for Available Members */}
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            setNewGroup((prevGroup) => ({
                              ...prevGroup,
                              members: [...prevGroup.members, e.target.value],
                            }));
                          }
                        }}
                        className="w-full border p-2 rounded mb-3"
                      >
                        <option value="">Select a member...</option>
                        {dummyMembers
                          .filter((member) => !newGroup.members.includes(member)) // Remove selected members from dropdown
                          .map((member, index) => (
                            <option key={index} value={member}>
                              {member}
                            </option>
                          ))}
                      </select>

                      {/* Selected Members List */}
                      <h3 className="font-semibold text-gray-700 mt-2">
                        Selected Members {newGroup.members.length > 0 ? `(${newGroup.members.length})` : ""}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1 border p-2 rounded-md min-h-[50px]">
                        {newGroup.members.length > 0 ? (
                          newGroup.members.map((member, index) => (
                            <span
                              key={index}
                              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center gap-2"
                            >
                              {member}
                              {/* Remove Button */}
                              <button
                                type="button"
                                className="text-white ml-2"
                                onClick={() =>
                                  setNewGroup((prevGroup) => ({
                                    ...prevGroup,
                                    members: prevGroup.members.filter((m) => m !== member),
                                  }))
                                }
                              >
                                ❌
                              </button>
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">No members selected.</p>
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

          {/* View Group Modal */}
          {isViewModalOpen && selectedGroup && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
              <div className="bg-white p-8 rounded-lg shadow-lg w-[900px] max-w-5xl h-auto flex flex-col md:flex-row gap-8">
                
                {/* 🔹 Left Column - Group Info */}
                <div className="flex-1 p-6">
                  {/* Group Avatar, Name, Type */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={selectedGroup?.avatar || avatarMap[selectedGroup?.type] || "/other_group.png"}
                      alt="Group Avatar"
                      width={80}
                      height={80}
                      className="rounded-full border-2 shadow-lg"
                    />
                    <div>
                      <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
                      <p className="text-gray-500 text-sm">{selectedGroup.type} Group</p>
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-700">Group Details</h3>
                    <p className="text-sm text-gray-600">{selectedGroup.description || "No description provided."}</p>
                  </div>

                  {/* Members List */}
                  <h3 className="font-semibold text-gray-700 mt-4">
                    Members ({selectedGroup?.membersList.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1 max-h-[200px] overflow-y-auto">
                    {selectedGroup?.membersList?.map((member: string, index: number) => (
                      <span key={index} className="bg-gray-200 px-3 py-1 rounded-md text-sm">
                        {member}
                      </span>
                    )) || []}
                  </div>

                  {/* Expense Summary */}
                  <div className="mt-4 bg-gray-100 p-4 rounded-lg text-center">
                    <h3 className="text-gray-700 font-semibold">Total Expenses</h3>
                    <p className="text-2xl font-bold text-indigo-600">₹{selectedGroup.totalExpense}</p>
                  </div>

                  {/* Start & End Date */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <h4 className="text-gray-700 font-semibold">Start Date</h4>
                      <p className="text-sm">{selectedGroup.startDate}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md text-center">
                      <h4 className="text-gray-700 font-semibold">End Date</h4>
                      <p className="text-sm">{selectedGroup.endDate || "Ongoing"}</p>
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
                    <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
                    {groupTransactions
                      .filter(txn => txn.groupId === selectedGroup.id)
                      .slice(0, 3)
                      .map((txn, index) => (
                        <div key={index} className="flex justify-between border-b py-2">
                          <span className="text-gray-600">{txn.member}</span>
                          <span className="font-bold">₹{txn.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    {groupTransactions.filter(txn => txn.groupId === selectedGroup.id).length === 0 && (
                      <p className="text-gray-500 italic">No transactions yet.</p>
                    )}
                  </div>

                  {/* Who Owes Whom Calculation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Who Owes Whom</h3>
                    {calculateOwes(selectedGroup.id).length > 0 ? (
                      <ul className="text-gray-600">
                        {calculateOwes(selectedGroup.id).map((entry, index) => (
                          <li key={index} className="border-b py-2">
                            {entry.from} owes {entry.to} <span className="font-bold">₹{entry.amount.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">All payments settled!</p>
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
                      onClick={() => router.push(`/split-expenses?groupId=${selectedGroup.id}`)}
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
)};