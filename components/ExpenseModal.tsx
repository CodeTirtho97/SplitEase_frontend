"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileInvoiceDollar,
  faUsers,
  faUserPlus,
  faMoneyBillWave,
  faPercentage,
  faEquals,
  faList,
  faUtensils,
  faBus,
  faHome,
  faLightbulb,
  faGamepad,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";

interface Member {
  _id: string;
  fullName: string;
}

interface Group {
  _id: string;
  name: string;
  members: Member[];
  completed?: boolean;
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
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [step, setStep] = useState(1); // 1: Basic info, 2: Participants & Split

  const expenseTypes = [
    "Food",
    "Transportation",
    "Accommodation",
    "Utilities",
    "Entertainment",
    "Miscellaneous",
  ];

  const expenseTypeIcons: { [key: string]: any } = {
    Food: faUtensils,
    Transportation: faBus,
    Accommodation: faHome,
    Utilities: faLightbulb,
    Entertainment: faGamepad,
    Miscellaneous: faEllipsisH,
  };

  const currencies = ["INR", "USD", "EUR", "GBP", "JPY"];
  const splitMethods = ["Equal", "Percentage", "Custom"];
  const currencySymbols: { [key: string]: string } = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const splitMethodIcons: { [key: string]: any } = {
    Equal: faEquals,
    Percentage: faPercentage,
    Custom: faList,
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
    setValidationErrors({});
    setStep(1);
  };

  const validateStep1 = () => {
    const errors: { [key: string]: string } = {};

    if (!selectedGroup) errors.group = "Please select a group";
    if (!payee) errors.payee = "Please select a payee";
    if (!expenseDescription.trim())
      errors.description = "Please enter a description";
    if (!amount || parseFloat(amount) <= 0)
      errors.amount = "Please enter a valid amount";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: { [key: string]: string } = {};

    if (selectedParticipants.length < 2) {
      errors.participants = "Please select at least two participants";
      setValidationErrors(errors);
      return false;
    }

    const totalAmount = parseFloat(amount);
    const numericSplitValues = splitValues.map((sv) => ({
      userId: sv.userId,
      value: typeof sv.value === "string" ? 0 : sv.value,
    }));

    if (splitMethod === "Percentage") {
      const totalPercentage = numericSplitValues.reduce(
        (sum, item) => sum + item.value,
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.splitValues = `Total percentage must equal 100%! Current total: ${totalPercentage.toFixed(
          2
        )}%`;
        setValidationErrors(errors);
        return false;
      }
    } else if (splitMethod === "Custom") {
      const totalSplitAmount = numericSplitValues.reduce(
        (sum, item) => sum + item.value,
        0
      );
      if (Math.abs(totalSplitAmount - totalAmount) > 0.01) {
        errors.splitValues = `Total split amounts must match the expense amount! Current total: ${totalSplitAmount.toFixed(
          2
        )}, Expected: ${totalAmount.toFixed(2)}`;
        setValidationErrors(errors);
        return false;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
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

    // Clear validation errors when participants are added
    if (validationErrors.participants) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.participants;
        return newErrors;
      });
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

    // Clear validation errors when split method changes
    if (validationErrors.splitValues) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.splitValues;
        return newErrors;
      });
    }
  };

  const handleSplitValueChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSplitValues((prev) =>
      prev.map((item) =>
        item.userId === userId ? { ...item, value: numValue } : item
      )
    );

    // Clear validation errors when split values change
    if (validationErrors.splitValues) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.splitValues;
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;

    const totalAmount = parseFloat(amount);
    const numericSplitValues = splitValues.map((sv) => ({
      userId: sv.userId,
      value:
        typeof sv.value === "string" ? parseFloat(sv.value) || 0 : sv.value,
    }));

    // Format data exactly matching the expected structure from handleSaveExpense
    const expenseData = {
      groupId: selectedGroup,
      payeeId: payee,
      description: expenseDescription,
      type: expenseType,
      currency,
      amount: totalAmount,
      splitMethod,
      participants: selectedParticipants.map((userId) => {
        // Find the split value for this user
        const userSplitValue = numericSplitValues.find(
          (sv) => sv.userId === userId
        );

        if (splitMethod === "Equal") {
          return {
            userId,
            amount: totalAmount / selectedParticipants.length,
          };
        } else if (splitMethod === "Percentage") {
          return {
            userId,
            percentage: userSplitValue?.value || 0,
          };
        } else {
          // Custom
          return {
            userId,
            amount: userSplitValue?.value || 0,
          };
        }
      }),
    };

    // Add debugging logs
    console.log("Sending expense data:", JSON.stringify(expenseData, null, 2));

    handleSaveExpense(expenseData);
    resetForm();
    setGroupLocked(false);
    setSelectedGroup("");
    onClose();
  };

  const getExpenseTypeIcon = (type: string) => {
    return expenseTypeIcons[type] || faEllipsisH;
  };

  const availableMembers = groupMembers.filter(
    (member) =>
      !selectedParticipants.includes(member._id) && member._id !== payee
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl p-5 relative">
          <button
            onClick={() => {
              resetForm();
              setGroupLocked(false);
              setSelectedGroup("");
              onClose();
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>

          <div className="flex items-center">
            <div className="bg-white p-3 rounded-full mr-4 shadow-md">
              <FontAwesomeIcon
                icon={getExpenseTypeIcon(expenseType)}
                className="text-2xl text-purple-500"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
          </div>

          {/* Stepper */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  step === 1
                    ? "bg-white bg-opacity-30"
                    : "bg-white bg-opacity-10"
                }`}
              >
                1
              </div>
              <div
                className={`h-1 w-16 ${
                  step === 2 ? "bg-white" : "bg-white bg-opacity-30"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step === 2
                    ? "bg-white bg-opacity-30 text-white"
                    : "bg-white bg-opacity-10 text-white"
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Basic Information */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Group <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FontAwesomeIcon icon={faUsers} />
                    </span>
                    <select
                      value={selectedGroup}
                      onChange={handleGroupChange}
                      disabled={groupLocked}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        validationErrors.group
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        groupLocked ? "bg-gray-100" : "bg-white"
                      }`}
                    >
                      <option value="">Select Group</option>
                      {groups
                        .filter((group) => !group.completed) // Only show active (non-completed) groups
                        .map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {validationErrors.group && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.group}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payee Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FontAwesomeIcon icon={faUserPlus} />
                    </span>
                    <select
                      value={payee}
                      onChange={handlePayeeChange}
                      disabled={!selectedGroup || payeeLocked}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        validationErrors.payee
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        !selectedGroup || payeeLocked
                          ? "bg-gray-100"
                          : "bg-white"
                      }`}
                    >
                      <option value="">Select Payee</option>
                      {groupMembers.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.payee && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.payee}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <FontAwesomeIcon icon={faFileInvoiceDollar} />
                    </span>
                    <input
                      type="text"
                      placeholder="Enter description (max 30 chars)"
                      value={expenseDescription}
                      onChange={(e) =>
                        setExpenseDescription(e.target.value.slice(0, 30))
                      }
                      maxLength={30}
                      disabled={!payeeLocked}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        validationErrors.description
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                        !payeeLocked ? "bg-gray-100" : "bg-white"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {expenseDescription.length}/30
                    </span>
                  </div>
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        disabled={!payeeLocked}
                        className={`w-full px-4 py-3 border ${
                          !payeeLocked ? "bg-gray-100" : "bg-white"
                        } border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors`}
                      >
                        {currencies.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr} ({currencySymbols[curr]})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        {currencySymbols[currency]}
                      </span>
                      <input
                        type="number"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={!payeeLocked}
                        className={`w-full pl-8 pr-4 py-3 border ${
                          validationErrors.amount
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                          !payeeLocked ? "bg-gray-100" : "bg-white"
                        }`}
                      />
                    </div>
                  </div>
                  {validationErrors.amount && (
                    <p className="mt-1 text-sm text-red-500">
                      {validationErrors.amount}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {expenseTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        disabled={!payeeLocked}
                        onClick={() => setExpenseType(type)}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center border ${
                          expenseType === type
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 hover:bg-gray-50"
                        } ${
                          !payeeLocked
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } transition-all`}
                      >
                        <FontAwesomeIcon
                          icon={getExpenseTypeIcon(type)}
                          className="text-lg mb-1"
                        />
                        <span className="text-xs">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Participants & Split */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Split Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {splitMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            handleSplitMethodChange({
                              target: { value: method },
                            } as React.ChangeEvent<HTMLSelectElement>)
                          }
                          className={`p-3 rounded-lg flex flex-col items-center justify-center border ${
                            splitMethod === method
                              ? "border-purple-500 bg-purple-50 text-purple-700"
                              : "border-gray-200 hover:bg-gray-50"
                          } transition-all`}
                        >
                          <FontAwesomeIcon
                            icon={splitMethodIcons[method]}
                            className="text-lg mb-1"
                          />
                          <span className="text-xs">{method}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Participants{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <FontAwesomeIcon icon={faUserPlus} />
                      </span>
                      <select
                        onChange={handleParticipantSelect}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          validationErrors.participants
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500`}
                      >
                        <option value="">Add Participant</option>
                        {availableMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.participants && (
                      <p className="mt-1 text-sm text-red-500">
                        {validationErrors.participants}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3 p-3 min-h-[100px] border border-gray-200 rounded-lg bg-gray-50">
                      {selectedParticipants.length === 0 ? (
                        <div className="w-full text-center text-gray-400 flex items-center justify-center h-full">
                          <span>No participants selected</span>
                        </div>
                      ) : (
                        selectedParticipants.map((id) => {
                          const user = groupMembers.find((m) => m._id === id);
                          return (
                            <span
                              key={id}
                              className={`px-3 py-2 rounded-full flex items-center ${
                                id === payee
                                  ? "bg-purple-100 text-purple-800 border border-purple-300"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {user?.fullName || "Unknown"}
                              {id === payee && (
                                <span className="ml-1 text-xs">(Payee)</span>
                              )}
                              {id !== payee && (
                                <button
                                  type="button"
                                  onClick={() => removeParticipant(id)}
                                  className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                                >
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  {selectedParticipants.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 pb-2 border-b">
                        Split Details
                      </h3>
                      {validationErrors.splitValues && (
                        <p className="mb-2 text-sm text-red-500 p-2 bg-red-50 rounded-lg">
                          {validationErrors.splitValues}
                        </p>
                      )}
                      <div className="max-h-[250px] overflow-y-auto pr-2">
                        {splitValues.map(({ userId, value }) => {
                          const participant = groupMembers.find(
                            (m) => m._id === userId
                          );
                          return (
                            <div
                              key={userId}
                              className="flex items-center gap-3 mb-3 p-2 border-b border-gray-100"
                            >
                              <span
                                className={`text-sm font-medium ${
                                  userId === payee
                                    ? "text-purple-700"
                                    : "text-gray-700"
                                } flex-1`}
                              >
                                {participant?.fullName || "Unknown"}
                                {userId === payee && (
                                  <span className="ml-1 text-xs">(Payee)</span>
                                )}
                              </span>
                              <div className="flex-1">
                                {splitMethod === "Equal" ? (
                                  <div className="flex items-center">
                                    <span className="text-gray-500 mr-2">
                                      {(
                                        100 / selectedParticipants.length
                                      ).toFixed(1)}
                                      %
                                    </span>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className="bg-purple-500 h-2.5 rounded-full"
                                        style={{
                                          width: `${
                                            100 / selectedParticipants.length
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                      {splitMethod === "Percentage"
                                        ? "%"
                                        : currencySymbols[currency]}
                                    </span>
                                    <input
                                      type="number"
                                      value={
                                        typeof value === "number" ? value : ""
                                      }
                                      placeholder={
                                        splitMethod === "Percentage"
                                          ? "Percentage"
                                          : "Amount"
                                      }
                                      onChange={(e) =>
                                        handleSplitValueChange(
                                          userId,
                                          e.target.value
                                        )
                                      }
                                      className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              {selectedParticipants.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Summary
                  </h3>
                  <div className="flex flex-wrap gap-y-2">
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Group:</span>
                      <span className="font-medium">
                        {groups.find((g) => g._id === selectedGroup)?.name ||
                          ""}
                      </span>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Payee:</span>
                      <span className="font-medium">
                        {groupMembers.find((m) => m._id === payee)?.fullName ||
                          ""}
                      </span>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Amount:</span>
                      <span className="font-medium">
                        {currencySymbols[currency]}
                        {parseFloat(amount).toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Type:</span>
                      <span className="font-medium">{expenseType}</span>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Split Method:</span>
                      <span className="font-medium">{splitMethod}</span>
                    </div>
                    <div className="w-full sm:w-1/2 md:w-1/3 flex items-center">
                      <span className="text-gray-500 mr-2">Participants:</span>
                      <span className="font-medium">
                        {selectedParticipants.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-200 flex justify-between">
          {step === 1 ? (
            <button
              onClick={() => {
                resetForm();
                setGroupLocked(false);
                setSelectedGroup("");
                onClose();
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={prevStep}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={nextStep}
              disabled={!payeeLocked}
              className={`px-6 py-2.5 ${
                !payeeLocked
                  ? "bg-purple-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white font-medium rounded-lg transition-colors`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-2" />
              Create Expense
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ExpenseModal;
