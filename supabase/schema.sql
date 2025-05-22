-- Create tables for the job application tracking system

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  link TEXT,
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Follow-ups table
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follow_up_date DATE NOT NULL,
  type TEXT NOT NULL, -- 'First', 'Second', 'Final'
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User targets table
CREATE TABLE user_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Timeline logs table
CREATE TABLE timeline_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_follow_up_days INTEGER NOT NULL DEFAULT 7,
  second_follow_up_days INTEGER NOT NULL DEFAULT 12,
  final_follow_up_days INTEGER NOT NULL DEFAULT 15,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  daily_reminder BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Row Level Security Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications"
  ON applications FOR DELETE
  USING (auth.uid() = user_id);

-- Follow-ups policies
CREATE POLICY "Users can view their own follow-ups"
  ON follow_ups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own follow-ups"
  ON follow_ups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow-ups"
  ON follow_ups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow-ups"
  ON follow_ups FOR DELETE
  USING (auth.uid() = user_id);

-- User targets policies
CREATE POLICY "Users can view their own targets"
  ON user_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own targets"
  ON user_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own targets"
  ON user_targets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own targets"
  ON user_targets FOR DELETE
  USING (auth.uid() = user_id);

-- Timeline logs policies
CREATE POLICY "Users can view their own timeline logs"
  ON timeline_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timeline logs"
  ON timeline_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);
