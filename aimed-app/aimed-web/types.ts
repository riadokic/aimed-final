// Import React to fix "Cannot find namespace 'React'" error when defining React.ReactNode
import React from 'react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  size?: 'small' | 'large' | 'tall' | 'wide';
}

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface Testimonial {
  author: string;
  role: string;
  organization: string;
  content: string;
  image: string;
}

export interface UserSettings {
  doctorName: string;
  clinicName: string;
  stampUrl: string;
}

export interface MedicalReport {
  anamneza: string;
  status: string;
  dijagnoza: string;
  terapija: string;
}

export type AppView = 'landing' | 'login' | 'portal';
export type PortalTab = 'dashboard' | 'dictation' | 'settings';
