import { Task, Setor, User } from '@/types';

export const mockSetores: Setor[] = [
  {
    id: '1',
    name: 'Desenvolvimento',
    description: 'Setor responsável pelo desenvolvimento de software',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Marketing',
    description: 'Setor responsável pelo marketing e vendas',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Recursos Humanos',
    description: 'Setor responsável pela gestão de pessoas',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@empresa.com',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'funcionario',
    setor_id: '1',
    setor: mockSetores[0],
    active: true,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'funcionario',
    setor_id: '2',
    setor: mockSetores[1],
    active: true,
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: 'funcionario',
    setor_id: '3',
    setor: mockSetores[2],
    active: false,
    created_at: '2024-01-04T00:00:00Z'
  }
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar sistema de login',
    description: 'Desenvolver tela de login com autenticação JWT',
    status: 'em_andamento',
    priority: 1,
    deadline: '2024-02-15T23:59:59Z',
    assigned_to: '2',
    assigned_user: mockUsers[1],
    setor_id: '1',
    setor: mockSetores[0],
    created_by: '1',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z'
  },
  {
    id: '2',
    title: 'Criar campanha de marketing',
    description: 'Desenvolver campanha para o novo produto',
    status: 'pendente',
    priority: 2,
    deadline: '2024-02-20T23:59:59Z',
    assigned_to: '3',
    assigned_user: mockUsers[2],
    setor_id: '2',
    setor: mockSetores[1],
    created_by: '1',
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z'
  },
  {
    id: '3',
    title: 'Atualizar políticas de RH',
    description: 'Revisar e atualizar políticas internas da empresa',
    status: 'concluida',
    priority: 3,
    deadline: '2024-01-30T23:59:59Z',
    assigned_to: '4',
    assigned_user: mockUsers[3],
    setor_id: '3',
    setor: mockSetores[2],
    created_by: '1',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  },
  {
    id: '4',
    title: 'Correção de bugs críticos',
    description: 'Resolver bugs reportados pelos usuários',
    status: 'pendente',
    priority: 1,
    deadline: '2024-02-05T23:59:59Z',
    assigned_to: '2',
    assigned_user: mockUsers[1],
    setor_id: '1',
    setor: mockSetores[0],
    created_by: '1',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }
];