/**
 * Script to check the database structure before creating a dump
 * This helps identify the size and complexity of the database
 */

import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Use the environment variables for connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const checkDatabaseStructure = async () => {
  const client = await pool.connect();
  try {
    console.log('Database Structure Analysis');
    console.log('==========================');

    // Get table counts
    const tableQuery = `
      SELECT
        schemaname,
        COUNT(*) as table_count
      FROM
        pg_tables
      WHERE
        schemaname NOT IN ('pg_catalog', 'information_schema')
      GROUP BY
        schemaname
      ORDER BY
        schemaname;
    `;
    const tablesResult = await client.query(tableQuery);
    console.log('\nTable counts by schema:');
    tablesResult.rows.forEach(row => {
      console.log(`- Schema ${row.schemaname}: ${row.table_count} tables`);
    });

    // Get record counts for each table
    const recordCountQuery = `
      SELECT
        table_schema,
        table_name,
        (SELECT reltuples::bigint FROM pg_class WHERE oid = (table_schema || '.' || table_name)::regclass) AS row_count
      FROM
        information_schema.tables
      WHERE
        table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
      ORDER BY
        row_count DESC;
    `;
    const recordCountResult = await client.query(recordCountQuery);
    console.log('\nEstimated record counts by table:');
    recordCountResult.rows.forEach(row => {
      console.log(`- ${row.table_schema}.${row.table_name}: ~${row.row_count} records`);
    });

    // Get database size
    const sizeQuery = `
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as db_size;
    `;
    const sizeResult = await client.query(sizeQuery);
    console.log(`\nTotal database size: ${sizeResult.rows[0].db_size}`);

    // Get a count of constraints
    const constraintQuery = `
      SELECT
        contype,
        COUNT(*) as count
      FROM
        pg_constraint
      GROUP BY
        contype
      ORDER BY
        contype;
    `;
    const constraintResult = await client.query(constraintQuery);
    console.log('\nConstraint counts by type:');
    const constraintMap = {
      'c': 'Check constraints',
      'f': 'Foreign key constraints', 
      'p': 'Primary key constraints',
      'u': 'Unique constraints'
    };
    constraintResult.rows.forEach(row => {
      const constraintType = constraintMap[row.contype] || `Constraint type ${row.contype}`;
      console.log(`- ${constraintType}: ${row.count}`);
    });

    // Get a count of indexes
    const indexQuery = `
      SELECT
        COUNT(*) as index_count
      FROM
        pg_indexes
      WHERE
        schemaname NOT IN ('pg_catalog', 'information_schema');
    `;
    const indexResult = await client.query(indexQuery);
    console.log(`\nTotal indexes: ${indexResult.rows[0].index_count}`);

    // Get a count of functions
    const functionQuery = `
      SELECT
        COUNT(*) as function_count
      FROM
        pg_proc
      WHERE
        pronamespace = 'public'::regnamespace;
    `;
    const functionResult = await client.query(functionQuery);
    console.log(`\nTotal functions: ${functionResult.rows[0].function_count}`);

    // Get a list of sequences
    const sequenceQuery = `
      SELECT
        sequence_schema,
        sequence_name,
        data_type,
        start_value
      FROM
        information_schema.sequences
      WHERE
        sequence_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY
        sequence_schema, sequence_name;
    `;
    const sequenceResult = await client.query(sequenceQuery);
    console.log('\nSequences:');
    sequenceResult.rows.forEach(row => {
      console.log(`- ${row.sequence_schema}.${row.sequence_name} (${row.data_type}): Start value = ${row.start_value}`);
    });
    
    // Get the current values for all sequences
    console.log('\nSequence Current Values:');
    for (const row of sequenceResult.rows) {
      try {
        const sequenceName = `${row.sequence_schema}.${row.sequence_name}`;
        const currentValueQuery = `SELECT last_value FROM ${sequenceName}`;
        const valueResult = await client.query(currentValueQuery);
        console.log(`- ${sequenceName}: Current value = ${valueResult.rows[0].last_value}`);
      } catch (err) {
        console.log(`- ${row.sequence_schema}.${row.sequence_name}: Unable to retrieve current value`);
      }
    }

    console.log('\nDatabase structure analysis complete.');
    console.log('Use the database dump utility to create a full database dump.');

  } catch (error) {
    console.error('Error analyzing database structure:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the check
checkDatabaseStructure();