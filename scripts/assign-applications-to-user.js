#!/usr/bin/env node

/**
 * Script to assign existing applications (with NULL user_id) to the current user
 * Usage: node scripts/assign-applications-to-user.js <userId>
 * 
 * To get your userId:
 * 1. Open your app in the browser
 * 2. Open browser console
 * 3. The user object should have an 'id' property
 * 4. Or check the Network tab when the app loads to see the userId
 */

import { neon } from '@neondatabase/serverless';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local if it exists
const envPath = join(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

const DATABASE_URL = process.env.DATABASE_URL;
const userId = process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please set DATABASE_URL in your .env.local file or environment');
  process.exit(1);
}

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.error('');
  console.error('Usage: node scripts/assign-applications-to-user.js <userId>');
  console.error('');
  console.error('To get your userId:');
  console.error('  1. Open your app in the browser');
  console.error('  2. Open browser console (F12)');
  console.error('  3. Check the user object - it should have an "id" property');
  console.error('  4. Or check the Network tab when the app loads to see the userId');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function assignApplicationsToUser() {
  try {
    // First, check if the user_id column exists by querying information_schema
    console.log(`🔄 Checking if user_id column exists...`);
    try {
      const columnCheck = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'applications' AND column_name = 'user_id'
      `;
      if (columnCheck.length === 0) {
        console.error('❌ Error: The user_id column does not exist in the applications table.');
        console.error('');
        console.error('Please run the migration first:');
        console.error('  yarn migrate:user-id');
        console.error('');
        console.error('Or manually run the SQL migration:');
        console.error('  migrations/add_user_id_column.sql');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error checking for user_id column:', error.message);
      console.error('');
      console.error('Please ensure the migration has been run:');
      console.error('  yarn migrate:user-id');
      process.exit(1);
    }
    
    console.log(`🔄 Checking for applications with NULL user_id...`);
    
    // First, check how many applications would be affected
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM applications 
      WHERE user_id IS NULL
    `;
    
    const count = countResult[0]?.count || 0;
    
    if (count === 0) {
      console.log('✅ No applications found with NULL user_id. All applications are already assigned to users.');
      return;
    }
    
    console.log(`📊 Found ${count} application(s) with NULL user_id`);
    console.log(`🔄 Assigning them to user: ${userId}`);
    
    // Show which applications will be assigned
    const appsToAssign = await sql`
      SELECT id, company, position, created_at 
      FROM applications 
      WHERE user_id IS NULL
      ORDER BY created_at DESC
    `;
    
    console.log('\n📋 Applications to be assigned:');
    appsToAssign.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.company} - ${app.position} (ID: ${app.id}, Created: ${app.created_at})`);
    });
    
    // Ask for confirmation (in a real scenario, you might want to use readline)
    console.log(`\n⚠️  This will assign ${count} application(s) to user ${userId}`);
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Assign the applications
    const result = await sql`
      UPDATE applications 
      SET user_id = ${userId}
      WHERE user_id IS NULL
      RETURNING id, company, position
    `;
    
    console.log(`\n✅ Successfully assigned ${result.length} application(s) to user ${userId}`);
    console.log('\n📋 Assigned applications:');
    result.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.company} - ${app.position} (ID: ${app.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error assigning applications:', error);
    process.exit(1);
  }
}

assignApplicationsToUser();

