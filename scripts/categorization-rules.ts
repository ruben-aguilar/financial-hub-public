// Import ParsedTransaction type
export interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  descriptionOverride?: string;
  amount: number;
  category: string;
  categoryOverride?: string;
  account: string;
  type: "income" | "expense";
}

/**
 * Categorization rules for transactions
 * Rules are evaluated in order - first match wins
 */
export interface CategorizationRule {
  name: string;
  category: string;
  match: (transaction: ParsedTransaction) => boolean;
}

/**
 * Check if description contains any of the given keywords (case-insensitive)
 */
function containsAny(description: string, keywords: string[]): boolean {
  const lowerDescription = description.toLowerCase();
  return keywords.some((keyword) =>
    lowerDescription.includes(keyword.toLowerCase())
  );
}

/**
 * Get all categorization rules in evaluation order
 */
export function getCategorizationRules(): CategorizationRule[] {
  return [
    {
      name: "Salary",
      category: "salary",
      match: (t) =>
        t.type === "income" &&
        containsAny(t.description, [
          "payroll",
          "salary",
          "paycheck",
          "direct deposit",
        ]),
    },
    {
      name: "Rent",
      category: "rent",
      match: (t) => containsAny(t.description, ["rent", "lease"]),
    },
    {
      name: "Groceries",
      category: "groceries",
      match: (t) =>
        containsAny(t.description, [
          "grocery",
          "market",
          "supermart",
          "fresh mart",
        ]),
    },
    {
      name: "Dining",
      category: "dining",
      match: (t) =>
        containsAny(t.description, [
          "cafe",
          "restaurant",
          "bistro",
          "diner",
          "takeout",
        ]),
    },
    {
      name: "Transport",
      category: "transport",
      match: (t) =>
        containsAny(t.description, [
          "transit",
          "metro",
          "bus",
          "rail",
          "uber",
          "lyft",
          "fuel",
          "gas",
        ]),
    },
    {
      name: "Utilities",
      category: "utilities",
      match: (t) =>
        containsAny(t.description, ["electric", "water", "utility", "internet", "phone"]),
    },
    {
      name: "Subscriptions",
      category: "subscriptions",
      match: (t) =>
        containsAny(t.description, [
          "subscription",
          "streaming",
          "music",
          "cloud",
          "software",
        ]),
    },
    {
      name: "Shopping",
      category: "shopping",
      match: (t) =>
        containsAny(t.description, ["store", "online order", "retail", "shop"]),
    },
    {
      name: "Entertainment",
      category: "entertainment",
      match: (t) =>
        containsAny(t.description, ["cinema", "movie", "concert", "theater", "game"]),
    },
    {
      name: "Health",
      category: "health",
      match: (t) =>
        containsAny(t.description, ["pharmacy", "clinic", "hospital", "dentist"]),
    },
    {
      name: "Travel",
      category: "travel",
      match: (t) =>
        containsAny(t.description, ["airlines", "hotel", "airbnb", "booking"]),
    },
    {
      name: "Education",
      category: "education",
      match: (t) =>
        containsAny(t.description, ["course", "tuition", "academy", "workshop"]),
    },
    {
      name: "Pets",
      category: "pets",
      match: (t) => containsAny(t.description, ["pet", "vet", "pet food"]),
    },
    {
      name: "Savings",
      category: "savings",
      match: (t) =>
        containsAny(t.description, ["transfer to savings", "savings transfer"]),
    },
  ];
}

/**
 * Apply categorization rules to a transaction
 * Returns the category ID, or 'pendiente' if no rule matches
 */
export function categorizeTransaction(transaction: ParsedTransaction): string {
  const rules = getCategorizationRules();

  for (const rule of rules) {
    if (rule.match(transaction)) {
      return rule.category;
    }
  }

  // Fallback to pendiente if no rule matches
  return "pendiente";
}

/**
 * Apply categorization rules to an array of transactions
 * Always applies rules, but preserves categoryOverride if set
 */
export function applyRulesToTransactions(
  transactions: ParsedTransaction[],
  preserveManualCategories: boolean = true
): ParsedTransaction[] {
  return transactions.map((transaction) => {
    // Always skip transactions that have categoryOverride set (preserve manual overrides)
    if (transaction.categoryOverride && transaction.categoryOverride.trim()) {
      return transaction;
    }

    // If preserveManualCategories is true, skip transactions that have been manually categorized
    // (i.e., not 'other' or 'pendiente')
    // This parameter is kept for backward compatibility but typically should be false
    if (preserveManualCategories && transaction.category !== "pendiente") {
      return transaction;
    }

    // Always apply categorization rules
    const newCategory = categorizeTransaction(transaction);
    return {
      ...transaction,
      category: newCategory,
    };
  });
}
