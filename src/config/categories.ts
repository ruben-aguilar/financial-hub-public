import { Category } from "@/types/transaction";

export const CATEGORIES: Category[] = [
  { id: "salary", name: "Salary", icon: "💼", color: "hsl(145 70% 35%)" },
  { id: "rent", name: "Rent", icon: "🏠", color: "hsl(28 80% 55%)" },
  { id: "groceries", name: "Groceries", icon: "🛒", color: "hsl(160 65% 40%)" },
  { id: "dining", name: "Dining", icon: "🍽️", color: "hsl(24 85% 55%)" },
  { id: "transport", name: "Transport", icon: "🚆", color: "hsl(200 70% 45%)" },
  { id: "utilities", name: "Utilities", icon: "💡", color: "hsl(48 85% 50%)" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "hsl(340 70% 55%)" },
  { id: "health", name: "Health", icon: "🩺", color: "hsl(0 70% 55%)" },
  { id: "travel", name: "Travel", icon: "✈️", color: "hsl(210 80% 55%)" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "hsl(280 70% 60%)" },
  { id: "education", name: "Education", icon: "🎓", color: "hsl(260 70% 50%)" },
  { id: "pets", name: "Pets", icon: "🐾", color: "hsl(30 60% 50%)" },
  { id: "subscriptions", name: "Subscriptions", icon: "📺", color: "hsl(220 60% 50%)" },
  { id: "savings", name: "Savings", icon: "🏦", color: "hsl(150 55% 35%)" },
  { id: "other", name: "Other", icon: "📦", color: "hsl(215 20% 55%)" },
  {
    id: "pendiente",
    name: "Pending Review",
    icon: "❓",
    color: "hsl(215 20% 55%)",
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return CATEGORIES.find((cat) => cat.id === id);
};

export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || "hsl(215 20% 55%)";
};
