-- ============================================================
-- AIMED Redesign Migration
-- Extends profiles, creates patients & reports, drops doctor_templates
-- ============================================================

-- 1. Drop doctor_templates (replaced by report_categories on profiles)
DROP TABLE IF EXISTS public.doctor_templates CASCADE;

-- 2. Extend profiles with branding, clinic info, report categories, GDPR
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS branding_logo_url text,
  ADD COLUMN IF NOT EXISTS branding_stamp_url text,
  ADD COLUMN IF NOT EXISTS branding_signature_url text,
  ADD COLUMN IF NOT EXISTS report_categories jsonb DEFAULT '["ANAMNEZA","STATUS","DIJAGNOZA","TERAPIJA","PREPORUKE"]'::jsonb,
  ADD COLUMN IF NOT EXISTS clinic_info jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gdpr_accepted_at timestamptz;

-- 3. Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  jmbg text,
  date_of_birth date,
  phone text,
  email text,
  address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON public.patients(doctor_id);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own patients"
  ON public.patients FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert their own patients"
  ON public.patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their own patients"
  ON public.patients FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their own patients"
  ON public.patients FOR DELETE USING (auth.uid() = doctor_id);

-- 4. Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  report_date date DEFAULT CURRENT_DATE,
  type text DEFAULT 'General',
  recording_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON public.reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_doctor_id ON public.reports(doctor_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view their own reports"
  ON public.reports FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert their own reports"
  ON public.reports FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update their own reports"
  ON public.reports FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete their own reports"
  ON public.reports FOR DELETE USING (auth.uid() = doctor_id);

-- 5. Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Hard delete user function (GDPR right to erasure)
CREATE OR REPLACE FUNCTION public.hard_delete_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.reports WHERE doctor_id = user_id;
  DELETE FROM public.patients WHERE doctor_id = user_id;
  DELETE FROM public.doctor_settings WHERE id = user_id;
  DELETE FROM public.profiles WHERE id = user_id;
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- 7. Branding storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding', 'branding', true, 2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Doctors can upload own branding"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Doctors can view own branding"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'branding' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Doctors can update own branding"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Doctors can delete own branding"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view branding images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'branding');
