"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/authContext";
import { ProfileProvider } from "@/context/profileContext";
import { GroupProvider } from "@/context/groupContext";
import { TransactionProvider } from "@/context/transactionContext";
import { SocketProvider } from "@/context/socketContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <GroupProvider>
          <TransactionProvider>
            <SocketProvider>{children}</SocketProvider>
          </TransactionProvider>
        </GroupProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
