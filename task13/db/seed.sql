
INSERT INTO users (name, email)
VALUES
  ('Zoya', 'zoya@example.com'),
  ('Anna', 'anna@example.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (title, description)
VALUES
  ('Backend', 'Server-side development'),
  ('Database', 'Database-related tasks'),
  ('Frontend', 'User interface development')
ON CONFLICT (title) DO NOTHING;

INSERT INTO tasks (title, description, status, user_id)
SELECT 'Learn Express', 'Practice Express.js', 'pending', u.id
FROM users u
WHERE u.email = 'zoya@example.com'
AND NOT EXISTS (
  SELECT 1 FROM tasks t
  WHERE t.title = 'Learn Express' AND t.user_id = u.id
);

INSERT INTO tasks (title, description, status, user_id)
SELECT 'Build API', 'Create REST API endpoints', 'in_progress', u.id
FROM users u
WHERE u.email = 'zoya@example.com'
AND NOT EXISTS (
  SELECT 1 FROM tasks t
  WHERE t.title = 'Build API' AND t.user_id = u.id
);

INSERT INTO tasks (title, description, status, user_id)
SELECT 'Learn SQL', 'Practice PostgreSQL queries', 'pending', u.id
FROM users u
WHERE u.email = 'anna@example.com'
AND NOT EXISTS (
  SELECT 1 FROM tasks t
  WHERE t.title = 'Learn SQL' AND t.user_id = u.id
);

INSERT INTO tasks (title, description, status, user_id)
SELECT 'Build React UI', 'Create a task manager interface', 'completed', u.id
FROM users u
WHERE u.email = 'anna@example.com'
AND NOT EXISTS (
  SELECT 1 FROM tasks t
  WHERE t.title = 'Build React UI' AND t.user_id = u.id
);

INSERT INTO task_categories (task_id, category_id)
SELECT t.id, c.id
FROM tasks t
JOIN users u ON u.id = t.user_id
JOIN categories c ON c.title = 'Backend'
WHERE t.title IN ('Learn Express', 'Build API')
AND u.email = 'zoya@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO task_categories (task_id, category_id)
SELECT t.id, c.id
FROM tasks t
JOIN users u ON u.id = t.user_id
JOIN categories c ON c.title = 'Database'
WHERE t.title IN ('Build API', 'Learn SQL')
AND u.email IN ('zoya@example.com', 'anna@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO task_categories (task_id, category_id)
SELECT t.id, c.id
FROM tasks t
JOIN users u ON u.id = t.user_id
JOIN categories c ON c.title = 'Frontend'
WHERE t.title = 'Build React UI'
AND u.email = 'anna@example.com'
ON CONFLICT DO NOTHING;
