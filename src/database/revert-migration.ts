import * as crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto as any;
}

import { AppDataSource } from './data-source';

async function run() {
  console.log('Initializing DataSource...');
  await AppDataSource.initialize();
  console.log('Reverting last migration...');
  await AppDataSource.undoLastMigration();
  console.log('Migration reverted successfully.');
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Error reverting migration:', err);
  process.exit(1);
});
