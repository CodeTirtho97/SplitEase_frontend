"use client";
import React, { useEffect } from "react";
import { useGroups } from "@/context/groupContext";

const GroupList: React.FC = () => {
  const { groups, refreshGroups, loading } = useGroups();

  useEffect(() => {
    refreshGroups();
  }, [refreshGroups]);

  if (loading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Groups</h2>
      {groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <ul>
          {groups.map((group) => (
            <li key={group._id} className="mb-2">
              <strong>{group.name}</strong> - {group.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;
