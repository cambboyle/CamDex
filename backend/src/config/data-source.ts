import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    'DATABASE_URL is not set. Copy backend/.env.example → backend/.env and fill in your Supabase connection string.',
  );
}

// Use SSL whenever the host is not localhost / 127.0.0.1 (i.e. for Supabase)
const isLocal =
  dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
