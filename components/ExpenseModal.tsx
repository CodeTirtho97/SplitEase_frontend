"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface Member {
  _id: string;
  fullName: string;
}

interface Group {
  _id: string;
  name: string;
  members: Member[];
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  handleSaveExpense: (data: any) => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  groups,
  handleSaveExpense,
}) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [payee, setPayee] = useState("");
  const [groupLocked, setGroupLocked] = useState(false);
  const [payeeLocked, setPayeeLocked] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseType, setExpenseType] = useState("Miscellaneous");
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState("Equal");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [splitValues, setSplitValues] = useState<
    { userId: string; value: number | string }[]
  >([]);
  const [groupMembers, setGroupMembers] = useState<Member[]>([]);

  const expenseTypes = [
    "Food",
    "Transportation",
    "Accommodation",
    "Utilities",
    "Entertainment",
    "Miscellaneous",
  ];
  const currencies = ["INR", "USD", "EUR", "GBP", "JPY"];
  const splitMethods = ["Equal", "Percentage", "Custom"];
  const currencySymbols: { [key: string]: string } = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  useEffect(() => {
    if (!selectedGroup) {
      setGroupMembers([]);
      resetForm();
      return;
    }

    const selectedGroupDetails = groups.find(
      (group) => group._id === selectedGroup
    );
    if (selectedGroupDetails) {
      setGroupMembers(selectedGroupDetails.members);
      resetForm();
    }
  }, [selectedGroup]);

  const resetForm = () => {
    setPayee("");
    setPayeeLocked(false);
    setExpenseDescription("");
    setExpenseType("Miscellaneous");
    setCurrency("INR");
    setAmount("");
    setSplitMethod("Equal");
    setSelectedParticipants([]);
    setSplitValues([]);
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(e.target.value);
  };

  const handlePayeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPayeeId = e.target.value;
    if (!groupMembers.some((member) => member._id === newPayeeId)) {
      console.warn(
        `Invalid payee ID: ${newPayeeId} not found in group members`
      );
      return;
    }
    setPayee(newPayeeId);
    setPayeeLocked(true);
    setGroupLocked(true);
    setSelectedParticipants([newPayeeId]);
    setSplitValues([
      { userId: newPayeeId, value: splitMethod === "Equal" ? 100 : 0 },
    ]);
  };

  const handleParticipantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId || selectedParticipants.includes(userId)) return;

    if (!groupMembers.some((member) => member._id === userId)) {
      console.warn(
        `Invalid participant ID: ${userId} not found in group members`
      );
      return;
    }

    setSelectedParticipants((prev) => [...prev, userId]);
    setSplitValues((prev) => [
      ...prev,
      { userId, value: splitMethod === "Equal" ? 100 / (prev.length + 1) : 0 },
    ]);
    if (splitMethod === "Equal") {
      const equalValue = 100 / (selectedParticipants.length + 1);
      setSplitValues((prev) =>
        prev.map((item) => ({ ...item, value: equalValue }))
      );
    }
    e.target.value = "";
  };

  const removeParticipant = (userId: string) => {
    if (userId === payee) return;
    setSelectedParticipants((prev) => prev.filter((id) => id !== userId));
    setSplitValues((prev) => prev.filter((item) => item.userId !== userId));
    if (splitMethod === "Equal" && selectedParticipants.length > 1) {
      const equalValue = 100 / (selectedParticipants.length - 1);
      setSplitValues((prev) =>
        prev.map((item) => ({ ...item, value: equalValue }))
      );
    }
  };

  const handleSplitMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value;
    setSplitMethod(method);

    if (method === "Equal") {
      const equalValue = 100 / selectedParticipants.length;
      setSplitValues(
        selectedParticipants.map((userId) => ({ userId, value: equalValue }))
      );
    } else if (method === "Percentage") {
      setSplitValues(
        selectedParticipants.map((userId) => ({ userId, value: 0 }))
      );
    } else if (method === "Custom") {
      setSplitValues(
        selectedParticipants.map((userId) => ({ userId, value: 0 }))
      );
    }
  };

  const handleSplitValueChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSplitValues((prev) =>
      prev.map((item) =>
        item.userId === userId ? { ...item, value: numValue } : item
      )
    );
  };

  const handleSubmit = () => {
    if (
      !selectedGroup ||
      !payee ||
      !expenseDescription.trim() ||
      !amount ||
      selectedParticipants.length < 2
    ) {
      alert(
        "Please fill all required fields and include at least two participants!"
      );
      return;
    }

    const totalAmount = parseFloat(amount);
    const numericSplitValues = splitValues.map((sv) => ({
      userId: sv.userId,
      value: typeof sv.value === "string" ? 0 : sv.value, // Ensure no strings remain
    }));

    if (splitMethod === "Percentage") {
      const totalPercentage = numericSplitValues.reduce(
        (sum, item) => sum + item.value,
        0
      );
      if (totalPercentage !== 100) {
        alert(
          "Total percentage must equal 100%! Current total: " +
            totalPercentage +
            "%"
        );
        return;
      }
    } else if (splitMethod === "Custom") {
      const totalSplitAmount = numericSplitValues.reduce(
        (sum, item) => sum + item.value,
        0
      );
      if (totalSplitAmount !== totalAmount) {
        alert(
          "Total split amounts must match the expense amount! Current total: " +
            totalSplitAmount +
            ", Expected: " +
            totalAmount
        );
        return;
      }
    }

    const expenseData = {
      groupId: selectedGroup,
      payeeId: payee,
      description: expenseDescription,
      type: expenseType,
      currency,
      amount: totalAmount,
      splitMethod,
      participants:
        splitMethod === "Equal"
          ? selectedParticipants.map((userId) => ({
              userId,
              amount: totalAmount / selectedParticipants.length,
            }))
          : splitMethod === "Percentage"
          ? selectedParticipants.map((userId) => ({
              userId,
              percentage:
                numericSplitValues.find((sv) => sv.userId === userId)?.value ||
                0,
            }))
          : selectedParticipants.map((userId) => ({
              userId,
              amount:
                numericSplitValues.find((sv) => sv.userId === userId)?.value ||
                0,
            })),
    };

    console.log(
      "Expense data before save:",
      JSON.stringify(expenseData, null, 2)
    ); // Debug payload
    handleSaveExpense(expenseData);
    resetForm();
    setGroupLocked(false);
    setSelectedGroup("");
    onClose();
  };

  const getExpenseAvatar = (expenseType: string): string => {
    const avatarMapping: { [key: string]: string } = {
      Food: "/food_expense.png",
      Transportation: "/transportation_expense.png",
      Accommodation: "/hotels_expense.png",
      Utilities: "/utilities_expense.png",
      Entertainment: "/entertainment_expense.png",
      Miscellaneous: "/miscellaneous_expense.png",
    };
    return avatarMapping[expenseType] || "/miscellaneous_expense.png";
  };

  const availableMembers = groupMembers.filter(
    (member) =>
      !selectedParticipants.includes(member._id) && member._id !== payee
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[700px]">
        <div className="flex justify-center mb-4">
          <img
            src={getExpenseAvatar(expenseType)}
            alt={expenseType}
            className="w-16 h-16 rounded-full shadow-md"
          />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">Add Expense</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Group
            </label>
            <select
              value={selectedGroup}
              onChange={handleGroupChange}
              disabled={groupLocked}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select Group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700">
              Payee Name
            </label>
            <select
              value={payee}
              onChange={handlePayeeChange}
              disabled={!selectedGroup || payeeLocked}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Select Payee</option>
              {groupMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700">
              Expense Description
            </label>
            <input
              type="text"
              placeholder="Enter description (max 30 chars)"
              value={expenseDescription}
              onChange={(e) =>
                setExpenseDescription(e.target.value.slice(0, 30))
              }
              maxLength={30}
              disabled={!payeeLocked}
              className="w-full border p-2 rounded mb-3"
            />
            <label className="block text-sm font-medium text-gray-700">
              Expense Type
            </label>
            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              disabled={!payeeLocked}
              className="w-full border p-2 rounded mb-3"
            >
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700">
              Select Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!payeeLocked}
              className="w-full border p-2 rounded mb-3"
            >
              {currencies.map((curr) => (
                <option key={curr} value={curr}>
                  {curr} ({currencySymbols[curr]})
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-500">
                {currencySymbols[currency]}
              </span>
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!payeeLocked}
                className="w-full border p-2 pl-8 rounded mb-3"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Split Method
            </label>
            <select
              value={splitMethod}
              onChange={handleSplitMethodChange}
              disabled={!payeeLocked}
              className="w-full border p-2 rounded mb-3"
            >
              {splitMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <label className="block text-sm font-medium text-gray-700">
              Select Participants
            </label>
            <select
              onChange={handleParticipantSelect}
              disabled={!payeeLocked}
              className="w-full border p-2 rounded mb-3"
            >
              <option value="">Add Participant</option>
              {availableMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedParticipants.map((id) => {
                const user = groupMembers.find((m) => m._id === id);
                return (
                  <span
                    key={id}
                    className="bg-gray-200 px-3 py-1 rounded flex items-center"
                  >
                    {user?.fullName || "Unknown"}
                    {id !== payee && (
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ml-2 cursor-pointer"
                        onClick={() => removeParticipant(id)}
                      />
                    )}
                  </span>
                );
              })}
            </div>
            {selectedParticipants.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Split Details
                </h3>
                {splitValues.map(({ userId, value }) => {
                  const participant = groupMembers.find(
                    (m) => m._id === userId
                  );
                  return (
                    <div key={userId} className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-700 w-1/3">
                        {participant?.fullName || "Unknown"}
                      </span>
                      {splitMethod === "Equal" ? (
                        <input
                          type="number"
                          value={(100 / selectedParticipants.length).toFixed(2)}
                          disabled
                          className="w-2/3 border p-2 rounded bg-gray-100 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="number"
                          value={typeof value === "number" ? value : ""}
                          placeholder={
                            splitMethod === "Percentage"
                              ? "Percentage"
                              : "Amount"
                          }
                          onChange={(e) =>
                            handleSplitValueChange(userId, e.target.value)
                          }
                          className="w-2/3 border p-2 rounded"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-6 gap-4">
          <button
            onClick={handleSubmit}
            disabled={!payeeLocked}
            className="w-1/2 bg-green-500 text-white py-2 rounded disabled:bg-gray-400"
          >
            Create Expense
          </button>
          <button
            onClick={() => {
              resetForm();
              setGroupLocked(false);
              setSelectedGroup("");
              onClose();
            }}
            className="w-1/2 bg-red-500 text-white py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
