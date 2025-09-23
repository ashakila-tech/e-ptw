-- seed.sql
BEGIN;

-- 1) Clean current data (exclude approvals & approval_data as requested)
TRUNCATE TABLE
  application,
  workflow_data,
  workflow,
  document,
  location,
  user_group,
  "group",
  "user",
  permit_type,
  company
RESTART IDENTITY CASCADE;

-- 2) Companies
INSERT INTO company (name) VALUES
  ('Acme Energy'),
  ('Beta Chemicals');

-- 3) Permit Types (company_id -> 1: Acme, 2: Beta)
INSERT INTO permit_type (company_id, name) VALUES
  (1, 'Hot Work'),
  (1, 'Confined Space'),
  (2, 'Electrical Isolation');

-- 4) Users (company_id + bcrypt password hash)
-- Replace __HASH__ with the bcrypt hash you generated (for password: secret123)
INSERT INTO "user" (company_id, name, email, user_type, password_hash) VALUES
  (1, 'Admin One',   'admin1@acme.com',  9, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (1, 'Alice Worker','alice@acme.com',   1, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (1, 'Bob Safety',  'bob@acme.com',     2, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (2, 'Beta Admin',  'admin@beta.com',   9, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu'),
  (2, 'Carl Tech',   'carl@beta.com',    1, '$2b$12$UFO2DRWKddl0Vq1eDgOcmOUvn1xie23U7V/g.4fBtP/v0qAykF5Uu');

-- 5) Groups
INSERT INTO "group" (company_id, name) VALUES
  (1, 'Safety'),
  (1, 'Operations'),
  (2, 'Maintenance');

-- 6) User ↔ Group links
-- Alice -> Safety, Bob -> Operations, Carl -> Maintenance
INSERT INTO user_group (user_id, group_id) VALUES
  (2, 1),
  (3, 2),
  (5, 3);

-- 7) Locations
INSERT INTO location (company_id, name) VALUES
  (1, 'Plant A'),
  (1, 'Boiler Room'),
  (2, 'Switchgear Building');

-- 8) Documents
INSERT INTO document (company_id, name, path, time) VALUES
  (1, 'Hot Work JSA',      '/app/uploads/hotwork-jsa.pdf',      NOW()),
  (1, 'Confined Space SOP','/app/uploads/confined-sop.pdf',     NOW()),
  (2, 'LOTO Procedure',    '/app/uploads/loto-procedure.pdf',   NOW());

-- 9) Workflows (each tied to a permit_type)
-- (company 1) Hot Work flow, (company 1) Confined Space flow, (company 2) Electrical Isolation flow
INSERT INTO workflow (company_id, permit_type_id, name) VALUES
  (1, 1, 'Hot Work Standard Flow'),
  (1, 2, 'Confined Space Entry Flow'),
  (2, 3, 'Electrical Isolation Flow');

-- 10) Workflow Data (per workflow)
INSERT INTO workflow_data (company_id, workflow_id, name, start_time, end_time) VALUES
  (1, 1, 'HW-Shift-1', NOW(), NOW() + INTERVAL '4 hours'),
  (1, 2, 'CS-Inspection', NOW(), NOW() + INTERVAL '2 hours'),
  (2, 3, 'EI-Weekly', NOW(), NOW() + INTERVAL '3 hours');

-- 11) Applications (no approvals yet)
-- Fields: permit_type_id, workflow_data_id (nullable), location_id, applicant_id, name, document_id (nullable), status, created_by, updated_by
-- Company 1 examples
INSERT INTO application
  (permit_type_id, workflow_data_id, location_id, applicant_id, name, document_id, status, created_by, updated_by, created_time, updated_time)
VALUES
  (1, 1, 1, 2, 'Hot Work – Pump Skid Welding', 1, 'DRAFT',    2, 2, NOW(), NULL),
  (2, 2, 2, 3, 'Confined Space – Vessel Entry', 2, 'SUBMITTED',3, 3, NOW(), NOW());

-- Company 2 example
INSERT INTO application
  (permit_type_id, workflow_data_id, location_id, applicant_id, name, document_id, status, created_by, updated_by, created_time, updated_time)
VALUES
  (3, 3, 3, 5, 'Isolation – MCC Maintenance', 3, 'DRAFT', 5, 5, NOW(), NULL);

COMMIT;
