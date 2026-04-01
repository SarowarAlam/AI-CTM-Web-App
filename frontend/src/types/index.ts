export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'agent' | 'customer';
  created_at: string;
  updated_at: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string | null;
  classification_confidence: number | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}