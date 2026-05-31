-- Seed file for Greenwood Academy ERP database
-- Contains default demo credentials and minimal database entries.

-- Cleanup existing data (optional, but ensures clean slate)
TRUNCATE TABLE users, teachers, classes, subjects, students CASCADE;

-- 1. Insert Users
-- Passwords are encrypted using bcrypt:
-- 'admin123' -> $2b$12$LMLXfi96zgMScwsLBXrBDugcasiWEZqQxkSuFz6sn6dkbN7uh.OlS
-- 'teacher123' -> $2b$12$7meBWH3vQ.0PCDwcY9xQCuWECoK.43n2ta2naWdt3I4d5wxEPrrd2
-- 'student123' -> $2b$12$MJiEajv.h5PHw57hnWACBOOAobFzyvbjxsM.TkQEIH0d2Xf/8DdeC
INSERT INTO users (id, mobile, password_hash, role, is_active, created_at, updated_at) VALUES
(1, '7996812234', '$2b$12$TScqpRXeH2u4RB2nrF/GXe1Ul7eXjPIiektu6HAi1wqcw3yVFLvge', 'admin', true, NOW(), NOW()),
(2, '9000000002', '$2b$12$7meBWH3vQ.0PCDwcY9xQCuWECoK.43n2ta2naWdt3I4d5wxEPrrd2', 'teacher', true, NOW(), NOW()),
(3, '9000000003', '$2b$12$MJiEajv.h5PHw57hnWACBOOAobFzyvbjxsM.TkQEIH0d2Xf/8DdeC', 'student', true, NOW(), NOW());

-- Update users sequence
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id)+1 FROM users), 1), false);

-- 2. Insert Teachers
INSERT INTO teachers (id, user_id, name, qualification, monthly_salary, assigned_classes, assigned_subjects, medium, created_at, updated_at) VALUES
(1, 2, 'Jane Doe', 'M.Sc. Mathematics', 55000.00, '[1]', '[1, 2]', 'English', NOW(), NOW());

-- Update teachers sequence
SELECT setval('teachers_id_seq', COALESCE((SELECT MAX(id)+1 FROM teachers), 1), false);

-- 3. Insert Classes
INSERT INTO classes (id, name, section, teacher_id, medium, created_at) VALUES
(1, 'Class 10', 'A', 1, 'English', NOW());

-- Update classes sequence
SELECT setval('classes_id_seq', COALESCE((SELECT MAX(id)+1 FROM classes), 1), false);

-- 4. Insert Subjects
INSERT INTO subjects (id, name, class_id, created_at) VALUES
(1, 'Mathematics', 1, NOW()),
(2, 'Science', 1, NOW());

-- Update subjects sequence
SELECT setval('subjects_id_seq', COALESCE((SELECT MAX(id)+1 FROM subjects), 1), false);

-- 5. Insert Students
INSERT INTO students (id, user_id, name, roll_number, class_id, section, parent_name, parent_mobile, address, medium, created_at, updated_at) VALUES
(1, 3, 'John Smith', '10A01', 1, 'A', 'Robert Smith', '9000000004', '123 Main St, Springfield', 'English', NOW(), NOW());

-- Update students sequence
SELECT setval('students_id_seq', COALESCE((SELECT MAX(id)+1 FROM students), 1), false);
