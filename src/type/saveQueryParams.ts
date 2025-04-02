export type SaveQueryParams = {
    job_id: string;
    template_id: string;
    users_count: number;
    users_list: any[]; // You can type this better if you have a user type
    webhook_url?: string;
    status?: string;
};