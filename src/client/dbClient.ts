import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'email_signatures',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
