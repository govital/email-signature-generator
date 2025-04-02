"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryRepo = void 0;
const dbClient_1 = require("../client/dbClient");
exports.queryRepo = {
    saveQuery: (_a) => __awaiter(void 0, [_a], void 0, function* ({ job_id, template_id, users_count, users_list, webhook_url, status = 'queued' }) {
        const insertQuery = `
        INSERT INTO requests (
            job_id,
            template_id,
            users_count,
            users_list,
            webhook_url,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;
        const values = [
            job_id,
            template_id,
            users_count,
            JSON.stringify(users_list), // Convert array to JSON string
            webhook_url || null,
            status
        ];
        try {
            (0, dbClient_1.query)(insertQuery, values);
        }
        catch (err) {
            console.error('Error saving job to requests table:', err);
            throw new Error('Database insert failed: ' + err.message);
        }
    }),
    updateStatus: (job_id, status) => __awaiter(void 0, void 0, void 0, function* () {
        const updateQuery = `
        UPDATE requests
        SET status = $1
        WHERE job_id = $2;
    `;
        try {
            yield (0, dbClient_1.query)(updateQuery, [status, job_id]);
        }
        catch (err) {
            console.error(`Error updating status for job ${job_id}:`, err);
            throw new Error('Failed to update job status: ' + err.message);
        }
    })
};
