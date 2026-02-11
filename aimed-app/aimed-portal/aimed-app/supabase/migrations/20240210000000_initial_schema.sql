-- Create profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name text,
  specialization text,
  clinic_name text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create doctor_settings table
CREATE TABLE public.doctor_settings (
  id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL PRIMARY KEY,
  word_template_path text,
  pdf_header_config jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_settings ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policies for doctor_settings
CREATE POLICY "Users can view their own settings."
  ON public.doctor_settings FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own settings."
  ON public.doctor_settings FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own settings."
  ON public.doctor_settings FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  -- Also initialize empty settings
  INSERT INTO public.doctor_settings (id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile and settings on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
