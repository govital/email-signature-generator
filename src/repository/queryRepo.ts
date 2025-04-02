import { query } from '../client/dbClient';
import {SaveQueryParams} from "../type/saveQueryParams";

export const queryRepo = {

    saveQuery: async ({job_id, template_id, users_count, users_list, webhook_url, status = 'queued'}: SaveQueryParams) => {
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
            query(insertQuery, values);
        } catch (err) {
            console.error('Error saving job to requests table:', err);
            throw new Error('Database insert failed: ' + (err as Error).message);
        }
    },

    updateStatus: async (job_id: string, status: string) => {
        const updateQuery = `
        UPDATE requests
        SET status = $1
        WHERE job_id = $2;
    `;

        try {
            await query(updateQuery, [status, job_id]);
        } catch (err) {
            console.error(`Error updating status for job ${job_id}:`, err);
            throw new Error('Failed to update job status: ' + (err as Error).message);
        }
    }

};
