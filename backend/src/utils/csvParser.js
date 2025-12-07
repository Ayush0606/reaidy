import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { categorizeTransaction, parseDate } from '../utils/categoryUtils.js';

/**
 * Parse CSV file and return transactions
 */
export const parseCSV = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const transactions = [];
    const errors = [];

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true
    });

    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        try {
          // Validate required fields
          if (!record.date || !record.description || !record.amount) {
            errors.push({
              row: transactions.length + 1,
              error: 'Missing required fields (date, description, amount)'
            });
            continue;
          }

          // Parse date
          const date = parseDate(record.date);

          // Parse amount
          const amount = parseFloat(record.amount);
          if (isNaN(amount) || amount < 0) {
            errors.push({
              row: transactions.length + 1,
              error: 'Invalid amount value'
            });
            continue;
          }

          // Get or guess category
          const category = record.category 
            ? record.category.toLowerCase() 
            : categorizeTransaction(record.description);

          transactions.push({
            date,
            description: record.description.trim(),
            amount,
            category,
            source: 'csv'
          });
        } catch (error) {
          errors.push({
            row: transactions.length + 1,
            error: error.message
          });
        }
      }
    });

    parser.on('error', (error) => {
      reject(new Error(`CSV parsing error: ${error.message}`));
    });

    parser.on('end', () => {
      resolve({ transactions, errors });
    });

    // Convert buffer to stream and pipe to parser
    const stream = Readable.from(fileBuffer.toString());
    stream.pipe(parser);
  });
};
