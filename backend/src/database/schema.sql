CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  statement TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  constraints_text TEXT,
  examples_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE problems
ADD COLUMN IF NOT EXISTS input_format TEXT,
ADD COLUMN IF NOT EXISTS output_format TEXT,
ADD COLUMN IF NOT EXISTS constraints_text TEXT,
ADD COLUMN IF NOT EXISTS examples_text TEXT;

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language VARCHAR(30) NOT NULL CHECK (language IN ('cpp', 'java', 'python', 'javascript')),
  source_code TEXT NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'time_limit')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS passed_test_cases INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_test_cases INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS memory_kb INTEGER,
ADD COLUMN IF NOT EXISTS compiler_output TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS problem_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  tag_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (problem_id, tag_name)
);

CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  input_data TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_sample BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  accepted_submissions INTEGER NOT NULL DEFAULT 0,
  wrong_answer_submissions INTEGER NOT NULL DEFAULT 0,
  time_limit_submissions INTEGER NOT NULL DEFAULT 0,
  latest_status VARCHAR(30) CHECK (latest_status IN ('accepted', 'wrong_answer', 'time_limit')),
  first_attempted_at TIMESTAMPTZ,
  last_submitted_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_problem_tags_problem_id ON problem_tags(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_tags_tag_name ON problem_tags(tag_name);

CREATE INDEX IF NOT EXISTS idx_test_cases_problem_id ON test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem_sort ON test_cases(problem_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_problem_id ON student_progress(problem_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_latest_status ON student_progress(latest_status);
