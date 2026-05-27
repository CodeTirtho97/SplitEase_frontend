"use client";

import { ReactNode } from "react";

interface SessionManagerProps {
  children: ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  return <>{children}</>;
};

export default SessionManager;
