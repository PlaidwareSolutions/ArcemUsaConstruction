/**
 * Script to reset all sequences in the database to the current maximum ID value + 1
 * This is useful after importing data or when sequences get out of sync
 */

import postgres from 'postgres';

// Use a direct postgres connection for the raw operations
const directDb = postgres(process.env.DATABASE_URL || "", { max: 1 });

/**
 * Reset sequence values for all tables with ID columns
 * This ensures that auto-incrementing ID values start at the correct value
 */
async function resetAllSequences(): Promise<void> {
  console.log('Resetting sequence values for all tables...');
  
  try {
    // Get all tables that have an 'id' column with a sequence
    const sequencesQuery = `
      SELECT 
        t.relname as table_name,
        a.attname as column_name,
        s.relname as sequence_name
      FROM pg_class t
      JOIN pg_attribute a ON a.attrelid = t.oid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      JOIN pg_depend d ON d.refobjid = t.oid AND d.refobjsubid = a.attnum
      JOIN pg_class s ON s.oid = d.objid AND s.relkind = 'S'
      WHERE n.nspname = 'public'
      AND t.relkind = 'r'
      AND a.attname = 'id'
    `;
    
    const sequences = await directDb.unsafe(sequencesQuery);
    
    console.log(`Found ${sequences.length} sequences to reset.`);
    
    for (const seq of sequences) {
      const { table_name, sequence_name } = seq;
      
      try {
        // Get the current max ID
        const maxIdResult = await directDb`SELECT COALESCE(MAX(id), 0) as max_id FROM ${directDb(table_name)}`;
        const maxId = maxIdResult[0]?.max_id || 0;
        
        // Update the sequence to the max ID value + 1
        const updateQuery = `
          SELECT setval(
            pg_get_serial_sequence('${table_name}', 'id'),
            ${maxId + 1},
            false
          )
        `;
        
        await directDb.unsafe(updateQuery);
        console.log(`✅ Reset sequence for table ${table_name} to ${maxId + 1}`);
      } catch (error) {
        console.error(`❌ Error resetting sequence for table ${table_name}:`, error);
      }
    }
    
    console.log('✅ All sequences reset successfully');
  } catch (error) {
    console.error('❌ Error fetching sequences:', error);
  } finally {
    // Close the direct database connection
    await directDb.end();
  }
}

// Run the reset
resetAllSequences().catch(error => {
  console.error('Sequence reset failed:', error);
  directDb.end().then(() => process.exit(1));
});