import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Transaction {
  id: string;
  date: string;
  description: string;
  descriptionOverride?: string;
  amount: number;
  category: string;
  categoryOverride?: string;
  account: string;
  type: 'income' | 'expense';
}

/**
 * Get valid category IDs from categories config
 */
function getValidCategoryIds(): string[] {
  try {
    // Read the categories file
    const categoriesPath = join(process.cwd(), 'src', 'config', 'categories.ts');
    if (!existsSync(categoriesPath)) {
      console.error('Categories file not found:', categoriesPath);
      process.exit(1);
    }

    const content = readFileSync(categoriesPath, 'utf-8');
    
    // Extract category IDs using regex
    // Look for patterns like: id: "category-id" or id: 'category-id'
    const idMatches = content.matchAll(/id:\s*["']([^"']+)["']/g);
    const categoryIds: string[] = [];
    
    for (const match of idMatches) {
      categoryIds.push(match[1]);
    }
    
    // Also include special categories that might be used
    categoryIds.push('pendiente', 'other');
    
    // Remove duplicates and sort
    return [...new Set(categoryIds)].sort();
  } catch (error) {
    console.error(`Error reading categories file: ${error}`);
    process.exit(1);
  }
}

/**
 * Parse transactions from JSON file
 */
function parseTransactions(filePath: string): Transaction[] {
  if (!existsSync(filePath)) {
    console.error('Transactions file not found:', filePath);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(content) as any[];
    
    return jsonData.map(item => ({
      id: item.id,
      date: item.date,
      description: item.description,
      descriptionOverride: item.descriptionOverride,
      amount: item.amount,
      category: item.category,
      categoryOverride: item.categoryOverride,
      account: item.account,
      type: item.type as 'income' | 'expense',
    }));
  } catch (error) {
    console.error(`Error parsing transactions file: ${error}`);
    process.exit(1);
  }
}

/**
 * Get effective category (categoryOverride || category)
 */
function getEffectiveCategory(transaction: Transaction): string {
  return transaction.categoryOverride || transaction.category;
}

/**
 * Main function
 */
function main() {
  const transactionsPath = join(process.cwd(), 'src', 'config', 'transactions.json');
  const listInvalid = process.argv.includes('--list') || process.argv.includes('-l');
  
  console.log('Loading categories and transactions...\n');
  
  const validCategoryIds = getValidCategoryIds();
  const transactions = parseTransactions(transactionsPath);
  
  // Find transactions with invalid categories
  const invalidTransactions: Array<{
    transaction: Transaction;
    invalidCategory: string;
    field: 'category' | 'categoryOverride';
  }> = [];
  
  transactions.forEach(t => {
    // Check main category
    if (!validCategoryIds.includes(t.category)) {
      invalidTransactions.push({
        transaction: t,
        invalidCategory: t.category,
        field: 'category',
      });
    }
    
    // Check categoryOverride if it exists
    if (t.categoryOverride && t.categoryOverride.trim() && !validCategoryIds.includes(t.categoryOverride)) {
      invalidTransactions.push({
        transaction: t,
        invalidCategory: t.categoryOverride,
        field: 'categoryOverride',
      });
    }
  });
  
  const invalidCount = invalidTransactions.length;
  
  // Display statistics
  console.log('🔍 Invalid Category Check');
  console.log('═'.repeat(60));
  console.log(`Total transactions:        ${transactions.length.toLocaleString()}`);
  console.log(`Valid category IDs:       ${validCategoryIds.length}`);
  console.log(`Transactions with invalid categories: ${invalidCount.toLocaleString()}`);
  console.log('═'.repeat(60));
  
  if (invalidCount > 0) {
    // Group by invalid category
    const byCategory = new Map<string, number>();
    invalidTransactions.forEach(item => {
      const count = byCategory.get(item.invalidCategory) || 0;
      byCategory.set(item.invalidCategory, count + 1);
    });
    
    console.log('\n📊 Invalid Categories Found:');
    console.log('─'.repeat(60));
    Array.from(byCategory.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .forEach(([category, count]) => {
        console.log(`  ${category.padEnd(30)} ${count.toString().padStart(5)} transaction(s)`);
      });
    console.log('─'.repeat(60));
    
    // Optionally list invalid transactions
    if (listInvalid) {
      console.log(`\n📋 Transactions with Invalid Categories (showing all ${invalidCount}):`);
      console.log('─'.repeat(100));
      invalidTransactions.forEach((item, index) => {
        const t = item.transaction;
        const effectiveDescription = t.descriptionOverride || t.description;
        const amountStr = t.type === 'income' ? `+${t.amount.toFixed(2)}` : `-${t.amount.toFixed(2)}`;
        console.log(
          `${(index + 1).toString().padStart(4)}. [${t.date}] [${t.id}] ${amountStr.padStart(10)} €  ` +
          `Field: ${item.field.padEnd(15)} Invalid: "${item.invalidCategory}"  ${effectiveDescription}`
        );
      });
      console.log('─'.repeat(100));
    } else {
      console.log(`\n💡 Tip: Run with --list or -l to see all transactions with invalid categories`);
    }
  } else {
    console.log('\n✅ All transactions have valid categories!');
  }
}

// Run if executed directly
main();

