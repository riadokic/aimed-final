-- Create doctor_templates table for the Sovereign Template Model
CREATE TABLE public.doctor_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  raw_html text NOT NULL,
  fields_metadata jsonb NOT NULL DEFAULT '[]'::jsonb,
  template_name text NOT NULL DEFAULT '',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for fast lookup by doctor
CREATE INDEX idx_doctor_templates_doctor_id ON public.doctor_templates(doctor_id);

-- Enable RLS
ALTER TABLE public.doctor_templates ENABLE ROW LEVEL SECURITY;

-- Policies: doctors can only access their own templates
CREATE POLICY "Users can view their own templates."
  ON public.doctor_templates FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert their own templates."
  ON public.doctor_templates FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Users can update their own templates."
  ON public.doctor_templates FOR UPDATE
  USING (auth.uid() = doctor_id);

CREATE POLICY "Users can delete their own templates."
  ON public.doctor_templates FOR DELETE
  USING (auth.uid() = doctor_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctor_templates_updated_at
  BEFORE UPDATE ON public.doctor_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
