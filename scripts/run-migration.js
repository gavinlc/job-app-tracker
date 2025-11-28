#!/usr/bin/env node

/**
 * Run database migration script
 * Usage: node scripts/run-migration.js
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env.local file or environment');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_is_starred_column.sql');
    
    const migrationPath = join(__dirname, '..', 'migrations', 'add_is_starred_column.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Split by semicolons and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement) {
        console.log(`  Executing: ${statement.substring(0, 60)}...`);
        await sql(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('   The is_starred column has been added to the applications table.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

