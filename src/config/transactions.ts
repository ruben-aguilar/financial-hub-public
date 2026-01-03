// Transactions are loaded from JSON file on demand
// This file is auto-generated - do not edit manually

import { Transaction } from "@/types/transaction";
import transactionsData from "./transactions.json";

// Export transactions directly from JSON
export const TRANSACTIONS: Transaction[] = transactionsData as Transaction[];
