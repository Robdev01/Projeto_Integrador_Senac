import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, CheckCircle2, Circle, Edit, UserCheck, UserX, Building2, Clock } from 'lucide-react';
import { User } from '@/types';

const UsuariosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [perfilFilter, setPerfilFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [setorFilter, setSetorFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [setores, setSetores] = useState<{ nome: string }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nome: '',
    email: '',
    perfil: 'comum',
    setor: '',  // Atualizado para ser o nome do setor
    ativo: 1,
    criado_em: new Date().toISOString(),
  });
  const navigate = useNavigate();

  // Fetch users and sectors from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5050/usuarios');
        if (!response.ok) throw new Error('Erro ao carregar os usuários');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    const fetchSetores = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5050/setores');
        if (!response.ok) throw new Error('Erro ao carregar os setores');
        const data = await response.json();
        setSetores(data);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      }
    };

    fetchUsers();
    fetchSetores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5050/usuarios/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar usuário');
      }

      const data = await response.json();
      console.log('Usuário criado com sucesso:', data);
      setIsCreateModalOpen(false); // Fecha o modal
      setUsers([...users, data]);  // Atualiza a lista de usuários
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPerfil = perfilFilter === 'all' || user.perfil === perfilFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'ativo' ? user.ativo === 1 : user.ativo === 0);
      const matchesSetor = setorFilter === 'all' || user.setor === setorFilter;

      return matchesSearch && matchesPerfil && matchesStatus && matchesSetor;
    });
  }, [users, searchTerm, perfilFilter, statusFilter, setorFilter]);

  // Stats cards
  const userCounts = {
    total: users.length,
    ativos: users.filter((u) => u.ativo === 1).length,
    inativos: users.filter((u) => u.ativo === 0).length,
    funcionarios: users.filter((u) => u.perfil === 'comum').length,
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  const getStatusIcon = (ativo: boolean) => {
    return ativo ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Circle className="h-4 w-4 text-muted-foreground" />;
  };

  const handleToggleActive = (userId: number) => {
    console.log('Toggling active status for user:', userId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 via-warning/10 via-accent/10 to-success/15 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none"></div>
      <Navigation />

      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">Visão geral de todos os usuários do sistema</p>
            </div>

            {/* Botão de Novo Usuário */}
            <Button
              className="flex items-center gap-2 btn-animated pulse-glow"
              onClick={() => navigate('/register-user')} // Redireciona para a página de registro de usuário
            >
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>

          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-vibrant border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCounts.total}</div>
              </CardContent>
            </Card>
            {/* Outros cards estatísticos */}
          </div>

          {/* Filtros */}
          <Card className="mb-6 card-vibrant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Filtros de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={perfilFilter} onValueChange={setPerfilFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os perfis</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="comum">Comum</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem value={setor.nome} key={setor.nome}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum usuário encontrado com os filtros aplicados.</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="card-vibrant hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(!!user.ativo)}
                          <CardTitle className="text-lg">{user.nome}</CardTitle>
                          <Badge className={user.perfil === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}>
                            {user.perfil === 'admin' ? 'Administrador' : 'Comum'}
                          </Badge>
                        </div>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-animated"
                          onClick={() => navigate(`/edit-user/${user.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={user.ativo === 1 ? 'destructive' : 'success'}
                          size="sm"
                          className="btn-animated"
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.ativo === 1 ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>
                          Setor: <strong>{user.setor || 'Não atribuído'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Status: <strong>{user.ativo === 1 ? 'Ativo' : 'Inativo'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Criado em: {formatDate(user.criado_em)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsuariosPage;
