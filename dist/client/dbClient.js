"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: process.env.POSTGRES_USER || 'admin',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'email_signatures',
    password: process.env.POSTGRES_PASSWORD || 'admin',
    port: Number(process.env.POSTGRES_PORT) || 5432,
});
const query = (text, params) => pool.query(text, params);
exports.query = query;
exports.default = pool;
