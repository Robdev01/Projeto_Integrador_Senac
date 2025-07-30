export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'funcionario';
  setor_id?: string;
  setor?: Setor;
  active: boolean;
  created_at: string;
}

export interface Setor {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  priority: 1 | 2 | 3 | 4;
  deadline: string;
  assigned_to: string;
  assigned_user?: User;
  setor_id: string;
  setor?: Setor;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}