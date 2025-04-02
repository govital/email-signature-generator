-- Create the templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    template_id VARCHAR(255) UNIQUE NOT NULL,
    template_html TEXT NOT NULL,
    template_text TEXT NOT NULL
);

-- Create the requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(255) UNIQUE NOT NULL,
    template_id VARCHAR(255) NOT NULL,
    users_count INTEGER NOT NULL,
    users_list JSONB NOT NULL,
    webhook_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'queued',
    created_at TIMESTAMP DEFAULT NOW()
);


-- Insert templates
INSERT INTO templates (template_id, template_html, template_text)
VALUES
-- Template 123
('123',
 '<p><strong>{{ fullName }}</strong> - {{ position }}</p><p>Email: <a href="mailto:{{ email }}">{{ email }}</a></p>',
 '{{ fullName }} - {{ position }}\nEmail: {{ email }}'),

-- Template 456
('456',
 '<h2>{{ fullName }}</h2>
 <p><strong>Position:</strong> {{ position | default("Not specified") }}</p>
 <p><strong>Email:</strong> <a href="mailto:{{ email }}">{{ email }}</a></p>
 {% if mobilePhone %}
 <p><strong>Phone:</strong> {{ mobilePhone }}</p>
 {% endif %}
 {% if logo %}
 <p><img src="{{ logo }}" alt="Company Logo" width="150"></p>
 {% endif %}',
 '=== Contact Information ===
 Name: {{ fullName }}
 Email: {{ email }}
 {% if mobilePhone %}Phone: {{ mobilePhone }}{% endif %}')
ON CONFLICT (template_id) DO NOTHING;

