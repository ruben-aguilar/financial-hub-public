import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { createHash } from 'crypto';
import { applyRulesToTransactions } from './categorization-rules';

interface CSVRow {
  valorDate: string; // F.Valor column (column 1)
  fecha: string;    // Fecha column (column 2)
  concepto: string;  // Concepto column (column 3)
  movimiento: string; // Movimiento column (column 4)
  importe: string;  // Importe column (column 5)
  disponible: string; // Disponible column (column 7) - account balance after transaction
}

export interface ParsedTransaction {
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
 * Generate a hash-based ID from date, fecha, description, movimiento, amount, and disponible
 */
function generateId(
  valorDate: string, 
  fecha: string, 
  description: string, 
  movimiento: string, 
  amount: number,
  disponible: string
): string {
  // Include all distinguishing fields to ensure uniqueness
  // Disponible (account balance) is unique for each transaction and helps distinguish duplicates
  const combined = `${valorDate}|${fecha}|${description}|${movimiento}|${Math.abs(amount)}|${disponible}`;
  const hash = createHash('sha256').update(combined).digest('hex');
  return `tx_${hash.substring(0, 12)}`;
}

/**
 * Convert date from DD/MM/YYYY to YYYY-MM-DD
 */
function convertDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('/');
  if (!day || !month || !year) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parse amount from Spanish format (comma decimal separator)
 * e.g., "-2,2" -> -2.2, "1231,65" -> 1231.65
 */
function parseAmount(amountStr: string): number {
  // Replace comma with dot for decimal separator
  const normalized = amountStr.replace(',', '.');
  const amount = parseFloat(normalized);
  if (isNaN(amount)) {
    throw new Error(`Invalid amount format: ${amountStr}`);
  }
  return amount;
}

/**
 * Parse CSV file and extract transaction data
 */
function parseCSV(filePath: string): CSVRow[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Skip first 5 lines (header/metadata)
  const dataLines = lines.slice(5);
  
  const transactions: CSVRow[] = [];
  
  for (const line of dataLines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Split by semicolon
    const columns = line.split(';');
    
    // Check if we have enough columns
    if (columns.length < 6) continue;
    
    // Extract relevant columns:
    // Column 1: F.Valor (date)
    // Column 2: Fecha (another date)
    // Column 3: Concepto (description)
    // Column 4: Movimiento (movement type/details)
    // Column 5: Importe (amount)
    // Column 7: Disponible (account balance after transaction)
    const valorDate = columns[1]?.trim();
    const fecha = columns[2]?.trim() || ''; // May be empty
    const concepto = columns[3]?.trim();
    const movimiento = columns[4]?.trim() || ''; // May be empty
    const importe = columns[5]?.trim();
    const disponible = columns[7]?.trim() || ''; // May be empty
    
    // Skip if essential data is missing
    if (!valorDate || !concepto || !importe) continue;
    
    // Skip if importe is empty (some rows might have empty amounts)
    if (importe === '') continue;
    
    transactions.push({
      valorDate,
      fecha,
      concepto,
      movimiento,
      importe,
      disponible,
    });
  }
  
  return transactions;
}

/**
 * Transform CSV rows into Transaction objects
 */
function transformToTransactions(csvRows: CSVRow[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  
  for (const row of csvRows) {
    try {
      // Convert date
      const date = convertDate(row.valorDate);
      
      // Convert fecha (may be empty, use valorDate as fallback)
      const fecha = row.fecha ? convertDate(row.fecha) : date;
      
      // Parse amount
      const amount = parseAmount(row.importe);
      
      // Determine type based on amount sign
      const type: 'income' | 'expense' = amount < 0 ? 'expense' : 'income';
      
      // Use absolute value for amount field
      const absoluteAmount = Math.abs(amount);
      
      // Generate ID using all distinguishing fields including disponible (account balance)
      const id = generateId(date, fecha, row.concepto, row.movimiento, absoluteAmount, row.disponible);
      
      transactions.push({
        id,
        date,
        description: row.concepto,
        amount: absoluteAmount,
        category: 'pendiente', // Will be categorized by rules
        account: 'checking', // Generic account
        type,
      });
    } catch (error) {
      // Log error but continue processing other rows
      console.error(`Error processing row: ${row.concepto}`, error);
    }
  }
  
  return transactions;
}

/**
 * Parse existing transactions from JSON file
 */
function parseExistingTransactions(filePath: string): ParsedTransaction[] {
  if (!existsSync(filePath)) {
    return [];
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
    console.warn(`Warning: Could not parse existing transactions file: ${error}`);
    return [];
  }
}

/**
 * Merge new transactions with existing ones, avoiding duplicates
 */
function mergeTransactions(
  existing: ParsedTransaction[],
  newTransactions: ParsedTransaction[]
): ParsedTransaction[] {
  const existingIds = new Set(existing.map(t => t.id));
  const merged = [...existing];
  
  let addedCount = 0;
  for (const transaction of newTransactions) {
    if (!existingIds.has(transaction.id)) {
      merged.push(transaction);
      existingIds.add(transaction.id);
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    console.log(`Added ${addedCount} new transactions`);
  } else {
    console.log('No new transactions to add');
  }
  
  // Sort by date (newest first) to match CSV order
  merged.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateB !== dateA) {
      return dateB - dateA; // Newest first
    }
    // If same date, maintain original order (newer transactions first)
    return 0;
  });
  
  return merged;
}

/**
 * Generate JSON file for transactions
 */
function generateJSON(transactions: ParsedTransaction[]): string {
  // Convert to plain objects, preserving override fields
  const jsonData = transactions.map(t => {
    const obj: any = {
      id: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      account: t.account,
      type: t.type,
    };
    
    // Only include categoryOverride if it's defined and not empty
    if (t.categoryOverride && t.categoryOverride.trim()) {
      obj.categoryOverride = t.categoryOverride;
    }
    
    // Only include descriptionOverride if it's defined and not empty
    if (t.descriptionOverride && t.descriptionOverride.trim()) {
      obj.descriptionOverride = t.descriptionOverride;
    }
    
    return obj;
  });
  
  return JSON.stringify(jsonData, null, 2);
}

/**
 * Get all CSV files in the movements directory
 */
function getCSVFiles(movementsDir: string): string[] {
  try {
    const files = readdirSync(movementsDir);
    return files
      .filter(file => extname(file).toLowerCase() === '.csv')
      .map(file => join(movementsDir, file))
      .sort(); // Sort for consistent processing order
  } catch (error) {
    console.error(`Error reading movements directory: ${error}`);
    return [];
  }
}

/**
 * Main function
 */
function main() {
  const movementsDir = join(process.cwd(), 'src', 'movements');
  const jsonOutputPath = join(process.cwd(), 'src', 'config', 'transactions.json');
  const tsOutputPath = join(process.cwd(), 'src', 'config', 'transactions.ts');
  
  // Read existing transactions from JSON
  const existingTransactions = parseExistingTransactions(jsonOutputPath);
  console.log(`Found ${existingTransactions.length} existing transactions`);
  
  // Get all CSV files
  const csvFiles = getCSVFiles(movementsDir);
  console.log(`Found ${csvFiles.length} CSV file(s) in movements folder:`);
  csvFiles.forEach(file => console.log(`  - ${file}`));
  
  if (csvFiles.length === 0) {
    console.error('No CSV files found in movements folder');
    return;
  }
  
  // Parse all CSV files and collect all transactions
  const allCSVTransactions: ParsedTransaction[] = [];
  const seenIds = new Set<string>();
  
  for (const csvPath of csvFiles) {
    console.log(`\nParsing: ${csvPath}`);
    
    // Parse CSV
    const csvRows = parseCSV(csvPath);
    console.log(`  Found ${csvRows.length} rows in CSV`);
    
    // Transform to Transaction objects
    const transactions = transformToTransactions(csvRows);
    console.log(`  Successfully parsed ${transactions.length} transactions`);
    
    // Add transactions, avoiding duplicates within CSVs
    let addedFromFile = 0;
    for (const transaction of transactions) {
      if (!seenIds.has(transaction.id)) {
        allCSVTransactions.push(transaction);
        seenIds.add(transaction.id);
        addedFromFile++;
      }
    }
    
    if (addedFromFile < transactions.length) {
      console.log(`  Added ${addedFromFile} new transactions (${transactions.length - addedFromFile} duplicates skipped)`);
    } else {
      console.log(`  Added ${addedFromFile} transactions`);
    }
  }
  
  console.log(`\nTotal unique transactions from all CSVs: ${allCSVTransactions.length}`);
  
  // Apply categorization rules to new transactions
  console.log('\nApplying categorization rules to new transactions...');
  const categorizedNewTransactions = applyRulesToTransactions(allCSVTransactions, false);
  
  // Merge with existing transactions
  const allTransactions = mergeTransactions(existingTransactions, categorizedNewTransactions);
  console.log(`Total transactions after merge: ${allTransactions.length}`);
  
  // Apply categorization rules to all transactions (preserving categoryOverride only)
  console.log('\nApplying categorization rules to all transactions...');
  const categorizedTransactions = applyRulesToTransactions(allTransactions, false);
  
  // Count categorized transactions
  const categorizedCount = categorizedTransactions.filter(
    t => t.category !== 'other' && t.category !== 'pendiente'
  ).length;
  const pendienteCount = categorizedTransactions.filter(t => t.category === 'pendiente').length;
  console.log(`  Categorized: ${categorizedCount}, Pending: ${pendienteCount}`);
  
  // Generate JSON
  const jsonContent = generateJSON(categorizedTransactions);
  
  // Write JSON file
  writeFileSync(jsonOutputPath, jsonContent, 'utf-8');
  console.log('\nUpdated transactions.json file:', jsonOutputPath);
  
  // Verify unique IDs
  const ids = new Set(categorizedTransactions.map(t => t.id));
  if (ids.size !== categorizedTransactions.length) {
    console.warn(`Warning: Found ${categorizedTransactions.length - ids.size} duplicate IDs`);
  } else {
    console.log('✓ All transaction IDs are unique');
  }
}

// Run if executed directly
main();

export { parseCSV, transformToTransactions, generateId, convertDate, parseAmount, CSVRow };

