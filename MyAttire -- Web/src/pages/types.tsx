export interface User {
  id?: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'funcionario';
  ativo: boolean;
  setor?: { id: number; nome: string };
}

export interface Task {
  id: number;
  titulo: string;
  descricao: string;
  nome_funcionario: string;
  nome_setor: string;
  data_criacao: string;
  prazo: string;
  status: 'pendente' | 'em_andamento' | 'concluida';
  prioridade: number;
  funcionario: { nome: string };
  setor: { nome: string };
}

export interface Department {
  id: number;
  nome: string;
  ativo: boolean;
  data_criacao?: string;
}