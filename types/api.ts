export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number;
  page: number;
  limit: number;
}

export interface Transaction {
  transactionId: string;
  date: string;
  expenseName: string;
  groupName: string;
  owedFrom: string;
  amount: number;
  currency: string;
  action?: "Pay Now";
  mode?: "UPI" | "PayPal" | "Stripe";
  status?: "Pending" | "Success" | "Failed";
  paidTo?: string;
  paymentDate?: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  totalOwed: number;
  totalOwing: number;
  currency: string;
}

export interface GroupMember {
  _id: string;
  fullName: string;
  email?: string;
  profilePic?: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  currency?: string;
  completed?: boolean;
  members: GroupMember[];
  createdBy: GroupMember;
  createdAt?: string;
  updatedAt?: string;
}
