import React from "react";
import UnifiedLoadingScreen from "./UnifiedLoadingScreen";

interface ExpenseLoadingScreenProps {
  logoSrc?: string;
}

const ExpenseLoadingScreen: React.FC<ExpenseLoadingScreenProps> = ({
  logoSrc = "/logo.png",
}) => {
  return (
    <UnifiedLoadingScreen
      message="Loading Your Expenses"
      logoSrc={logoSrc}
      section="expenses"
      showTips={true}
    />
  );
};

export default ExpenseLoadingScreen;
