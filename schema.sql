-- InsForge PostgreSQL Database Schema for Operator Guardian AI

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'supervisor',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workers Table
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  shift TEXT NOT NULL,
  profile_image_url TEXT,
  face_embedding JSONB,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Monitoring Sessions Table
CREATE TABLE IF NOT EXISTS public.monitoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  camera_source TEXT DEFAULT 'Webcam',
  status TEXT DEFAULT 'active',
  avg_fatigue_score NUMERIC DEFAULT 0,
  max_fatigue_score NUMERIC DEFAULT 0
);

-- 4. Fatigue Records Table
CREATE TABLE IF NOT EXISTS public.fatigue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  fatigue_score NUMERIC NOT NULL,
  fatigue_level TEXT NOT NULL,
  eye_status TEXT,
  posture_status TEXT,
  yawn_detected BOOLEAN DEFAULT FALSE,
  recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  screenshot_url TEXT,
  details JSONB,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Behaviour Events Table
CREATE TABLE IF NOT EXISTS public.behaviour_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  behaviour_state TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  active_work_seconds INTEGER DEFAULT 0,
  idle_seconds INTEGER DEFAULT 0,
  continuous_work_seconds INTEGER DEFAULT 0,
  break_seconds INTEGER DEFAULT 0,
  movement_frequency NUMERIC DEFAULT 0,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Heat Events Table
CREATE TABLE IF NOT EXISTS public.heat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.monitoring_sessions(id) ON DELETE CASCADE,
  heat_status TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  ambient_temp_c NUMERIC DEFAULT 31.0,
  humidity NUMERIC DEFAULT 60.0,
  estimated_core_temp_f NUMERIC DEFAULT 98.6,
  wbgt_index NUMERIC DEFAULT 26.5,
  hydration_reminder TEXT,
  recommended_rest_mins INTEGER DEFAULT 0,
  source TEXT DEFAULT 'Estimation Engine (Multi-Signal)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) & Access Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatigue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behaviour_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heat_events ENABLE ROW LEVEL SECURITY;

-- Allow public / authenticated access for read and write
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public profiles insert" ON public.profiles;
CREATE POLICY "Public profiles insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public profiles update" ON public.profiles;
CREATE POLICY "Public profiles update" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public workers read" ON public.workers;
CREATE POLICY "Public workers read" ON public.workers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public workers insert" ON public.workers;
CREATE POLICY "Public workers insert" ON public.workers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public workers update" ON public.workers;
CREATE POLICY "Public workers update" ON public.workers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public monitoring read" ON public.monitoring_sessions;
CREATE POLICY "Public monitoring read" ON public.monitoring_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public monitoring insert" ON public.monitoring_sessions;
CREATE POLICY "Public monitoring insert" ON public.monitoring_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public fatigue read" ON public.fatigue_records;
CREATE POLICY "Public fatigue read" ON public.fatigue_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public fatigue insert" ON public.fatigue_records;
CREATE POLICY "Public fatigue insert" ON public.fatigue_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public alerts read" ON public.alerts;
CREATE POLICY "Public alerts read" ON public.alerts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public alerts insert" ON public.alerts;
CREATE POLICY "Public alerts insert" ON public.alerts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public behaviour read" ON public.behaviour_events;
CREATE POLICY "Public behaviour read" ON public.behaviour_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public behaviour insert" ON public.behaviour_events;
CREATE POLICY "Public behaviour insert" ON public.behaviour_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public heat events read" ON public.heat_events;
CREATE POLICY "Public heat events read" ON public.heat_events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public heat events insert" ON public.heat_events;
CREATE POLICY "Public heat events insert" ON public.heat_events FOR INSERT WITH CHECK (true);

