-- seed.sql
BEGIN;

-- 1) Clean current data (exclude approvals & approval_data as requested)
TRUNCATE TABLE
  application,
  workflow_data,
  workflow,
  document,
  location,
  permit_officer,
  location_manager,
  user_group,
  "group",
  "user",
  permit_type,
  company
RESTART IDENTITY CASCADE;

-- 2) Companies (add 3 placeholder values)
INSERT INTO company (name) VALUES
  ('Company-1'),
  ('Company-2'),
  ('Company-3');

-- 3) Permit Types (add 3 placeholder + real types)
INSERT INTO permit_type (company_id, name) VALUES
  (1, 'permit-type-1'),
  (1, 'permit-type-2'),
  (1, 'permit-type-3'),
  (1, 'Hot Work'),
  (1, 'Confined Space'),
  (1, 'Lifting Operations'),
  (1, 'Work at Height'),
  (1, 'General Work');

-- 4) Users (3 placeholder + real users)
INSERT INTO "user" (company_id, name, email, user_type, password_hash) VALUES
  (1, 'user-1', 'user1@example.com', 1, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (1, 'user-2', 'user2@example.com', 1, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (2, 'user-3', 'user3@example.com', 1, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu');

-- 5) Groups (add placeholders + real)
INSERT INTO "group" (company_id, name) VALUES
  (1, 'group-1'),
  (1, 'group-2'),
  (2, 'group-3'),
  (1, 'Contractor'),
  (1, 'Supervisor'),
  (1, 'Area Owner'),
  (1, 'HSE Ambassador'),
  (1, 'Site Manager');

-- 6) User ↔ Group links (example)
INSERT INTO user_group (user_id, group_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3);

-- 7) Locations (3 placeholder)
INSERT INTO location (company_id, name) VALUES
  (1, 'location-1'),
  (2, 'location-2'),
  (3, 'location-3');

-- 8) Documents (3 placeholder)
INSERT INTO document (company_id, name, path, time) VALUES
  (1, 'document-1', '/path/to/doc1.pdf', NOW()),
  (2, 'document-2', '/path/to/doc2.pdf', NOW()),
  (3, 'document-3', '/path/to/doc3.pdf', NOW());

-- 9) Workflows (example tied to permit_type)
INSERT INTO workflow (company_id, permit_type_id, name) VALUES
  (1, 1, 'Hot Work Flow'),
  (1, 2, 'Confined Space Flow'),
  (2, 4, 'Work at Height Flow');

-- 10) Workflow Data
INSERT INTO workflow_data (company_id, workflow_id, name, start_time, end_time) VALUES
  (1, 1, 'Hot Work Session', NOW(), NOW() + INTERVAL '4 hours'),
  (1, 2, 'Confined Space Session', NOW(), NOW() + INTERVAL '2 hours'),
  (2, 3, 'Height Work Session', NOW(), NOW() + INTERVAL '3 hours');

-- 11) Applications (example entries)
INSERT INTO application
  (permit_type_id, workflow_data_id, location_id, applicant_id, name, document_id, status, created_by, updated_by, created_time, updated_time)
VALUES
  (1, 1, 1, 1, 'Hot Work Application', 1, 'DRAFT', 1, 1, NOW(), NULL),
  (2, 2, 2, 2, 'Confined Space Application', 2, 'SUBMITTED', 2, 2, NOW(), NOW()),
  (4, 3, 3, 3, 'Work at Height Application', 3, 'DRAFT', 3, 3, NOW(), NULL);

-- 12) Permit Officer assignments (example)
INSERT INTO permit_officer (permit_type_id, user_id) VALUES
  (1, 1),
  (2, 2),
  (4, 3);

-- 13) Location Manager assignments (example)
INSERT INTO location_manager (location_id, user_id) VALUES
  (1, 1),
  (2, 2),
  (3, 3);

COMMIT;