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
 * Get effective description (descriptionOverride || description)
 */
function getEffectiveDescription(transaction: Transaction): string {
  return transaction.descriptionOverride || transaction.description;
}

/**
 * Main function
 */
function main() {
  const transactionsPath = join(process.cwd(), 'src', 'config', 'transactions.json');
  const listPending = process.argv.includes('--list') || process.argv.includes('-l');
  
  console.log('Loading transactions...\n');
  
  const transactions = parseTransactions(transactionsPath);
  const total = transactions.length;
  
  // Filter transactions that are pending AND have no categoryOverride
  const pendingTransactions = transactions.filter(t => 
    t.category === 'pendiente' && (!t.categoryOverride || !t.categoryOverride.trim())
  );
  
  // Count transactions with categoryOverride (these are manually overridden)
  const overrideCount = transactions.filter(t => 
    t.categoryOverride && t.categoryOverride.trim()
  ).length;
  
  // Sort by date (newest first) and limit to 20 most recent
  const sortedPending = pendingTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 20);
  
  const pendingCount = pendingTransactions.length;
  const categorizedCount = total - pendingCount - overrideCount;
  const pendingPercentage = total > 0 ? (pendingCount / total) * 100 : 0;
  
  // Display statistics
  console.log('📊 Transaction Categorization Status');
  console.log('═'.repeat(50));
  console.log(`Total transactions:     ${total.toLocaleString()}`);
  console.log(`Categorized:           ${categorizedCount.toLocaleString()} (${(100 - pendingPercentage).toFixed(1)}%)`);
  console.log(`Pending (no override):  ${pendingCount.toLocaleString()} (${pendingPercentage.toFixed(1)}%)`);
  if (overrideCount > 0) {
    console.log(`Manual overrides:       ${overrideCount.toLocaleString()}`);
  }
  console.log('═'.repeat(50));
  
  // Optionally list pending transactions (20 most recent)
  if (listPending && pendingCount > 0) {
    console.log(`\n📋 Most Recent Pending Transactions (showing ${sortedPending.length} of ${pendingCount}):`);
    console.log('─'.repeat(100));
    sortedPending.forEach((t, index) => {
      const effectiveDescription = getEffectiveDescription(t);
      const amountStr = t.type === 'income' ? `+${t.amount.toFixed(2)}` : `-${t.amount.toFixed(2)}`;
      console.log(`${(index + 1).toString().padStart(4)}. [${t.date}] [${t.id}] ${amountStr.padStart(10)} €  ${effectiveDescription}`);
    });
    console.log('─'.repeat(100));
    if (pendingCount > 20) {
      console.log(`\n💡 Showing 20 most recent. Total pending: ${pendingCount}`);
    }
  } else if (listPending && pendingCount === 0) {
    console.log('\n✅ No pending transactions!');
  } else if (pendingCount > 0) {
    console.log(`\n💡 Tip: Run with --list or -l to see the 20 most recent pending transactions`);
  }
}

// Run if executed directly
main();

