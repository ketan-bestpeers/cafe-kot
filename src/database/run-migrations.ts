import * as crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto as any;
}

import { AppDataSource } from './data-source';

async function run() {
  console.log('Initializing DataSource...');
  await AppDataSource.initialize();
  console.log('Running migrations...');
  const executed = await AppDataSource.runMigrations();
  if (executed.length === 0) {
    console.log('No pending migrations to run.');
  } else {
    console.log(
      'Migrations executed successfully:',
      executed.map((m) => m.name),
    );
  }
  await AppDataSource.destroy();
}

run().catch((err) => {
  console.error('Error running migrations:', err);
  process.exit(1);
});
