import React from "react";
import UnifiedLoadingScreen from "./UnifiedLoadingScreen";

export default function EnhancedLoadingScreen() {
  return (
    <UnifiedLoadingScreen
      message="Loading Your Dashboard"
      section="dashboard"
      showTips={true}
    />
  );
}
