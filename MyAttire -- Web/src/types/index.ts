
export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'comum';
  setor: string;
  ativo: number;
  criado_em: string;
}

export interface Setor {
  data_criacao(data_criacao: any): import("react").ReactNode;
  nome: string;
  id: string;
  name: string;
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

export interface FormSetorProps {

  setor?: Setor;

  onClose: () => void;

  onCreate?: (name: string) => Promise<void>;

}
