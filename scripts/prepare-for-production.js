#!/usr/bin/env node

/**
 * Helper script to prepare the project for production deployment
 * This script helps switch from SQLite to PostgreSQL schema
 */

const fs = require('fs');
const path = require('path');

const sqliteSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const postgresSchemaPath = path.join(__dirname, '../prisma/schema.postgresql.prisma');
const backupSchemaPath = path.join(__dirname, '../prisma/schema.sqlite.backup.prisma');

console.log('🔄 Preparing for production deployment...\n');

// Check if we're switching to PostgreSQL
const usePostgres = process.argv.includes('--postgres') || process.env.DATABASE_URL?.startsWith('postgresql');
const restoreSqlite = process.argv.includes('--restore-sqlite');

if (restoreSqlite) {
  console.log('📦 Restoring SQLite schema for local development...');
  
  if (fs.existsSync(backupSchemaPath)) {
    const sqliteSchema = fs.readFileSync(backupSchemaPath, 'utf8');
    fs.writeFileSync(sqliteSchemaPath, sqliteSchema);
    console.log('✅ Restored SQLite schema');
    console.log('\n⚠️  Remember to:');
    console.log('   1. Run: npx prisma generate');
    console.log('   2. Set DATABASE_URL="file:./prisma/dev.db" in .env');
  } else {
    console.error('❌ SQLite backup file not found!');
    console.log('   You may need to manually change provider to "sqlite" in schema.prisma');
    process.exit(1);
  }
} else if (usePostgres) {
  console.log('📦 Switching to PostgreSQL schema...');
  
  // Backup current SQLite schema
  if (fs.existsSync(sqliteSchemaPath)) {
    const currentSchema = fs.readFileSync(sqliteSchemaPath, 'utf8');
    if (currentSchema.includes('provider = "sqlite"')) {
      fs.writeFileSync(backupSchemaPath, currentSchema);
      console.log('✅ Backed up SQLite schema to schema.sqlite.backup.prisma');
    }
  }
  
  // Copy PostgreSQL schema
  if (fs.existsSync(postgresSchemaPath)) {
    const postgresSchema = fs.readFileSync(postgresSchemaPath, 'utf8');
    fs.writeFileSync(sqliteSchemaPath, postgresSchema);
    console.log('✅ Updated schema.prisma for PostgreSQL');
    console.log('\n📋 Next steps:');
    console.log('   1. Commit this change: git add prisma/schema.prisma && git commit -m "Switch to PostgreSQL"');
    console.log('   2. Push to GitHub: git push');
    console.log('   3. Set up Vercel Postgres database');
    console.log('   4. Configure environment variables in Vercel');
    console.log('   5. After deployment, run: npx prisma migrate deploy');
    console.log('\n💡 To restore SQLite for local dev: node scripts/prepare-for-production.js --restore-sqlite');
  } else {
    console.error('❌ PostgreSQL schema file not found!');
    process.exit(1);
  }
} else {
  console.log('ℹ️  Usage:');
  console.log('   Switch to PostgreSQL: node scripts/prepare-for-production.js --postgres');
  console.log('   Restore SQLite:      node scripts/prepare-for-production.js --restore-sqlite');
  console.log('\nOr set DATABASE_URL to a PostgreSQL connection string to auto-detect.');
}

console.log('\n✨ Done!');
