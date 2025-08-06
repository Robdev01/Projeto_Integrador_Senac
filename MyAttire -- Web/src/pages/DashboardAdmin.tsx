import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, Filter, CheckCircle2, AlertCircle, Circle, Users, Building2 } from 'lucide-react';
import { mockTasks, mockUsers, mockSetores } from '@/data/mockData';
import FormTarefa from '@/components/FormTarefa';

const DashboardAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [funcionarioFilter, setFuncionarioFilter] = useState('all');
  const [setorFilter, setSetorFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // Verifica se o usuário está autenticado e é admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.role || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority.toString() === priorityFilter;
      const matchesFuncionario = funcionarioFilter === 'all' || task.assigned_to === funcionarioFilter;
      const matchesSetor = setorFilter === 'all' || task.setor_id === setorFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesFuncionario && matchesSetor;
    });
  }, [searchTerm, statusFilter, priorityFilter, funcionarioFilter, setorFilter]);

  const taskCounts = {
    total: mockTasks.length,
    pendente: mockTasks.filter((t) => t.status === 'pendente').length,
    em_andamento: mockTasks.filter((t) => t.status === 'em_andamento').length,
    concluida: mockTasks.filter((t) => t.status === 'concluida').length,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return 'bg-destructive text-destructive-foreground';
      case 2:
        return 'bg-warning text-warning-foreground';
      case 3:
        return 'bg-primary text-primary-foreground';
      case 4:
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case 'em_andamento':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'pendente':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1:
        return 'Crítica';
      case 2:
        return 'Alta';
      case 3:
        return 'Média';
      case 4:
        return 'Baixa';
      default:
        return 'Indefinida';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date() && deadline !== '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 via-warning/10 via-accent/10 to-success/15 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none"></div>
      <Navigation />

      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Dashboard Administrativo</h1>
              <p className="text-muted-foreground">Visão geral de todas as tarefas do sistema</p>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 btn-animated pulse-glow">
                  <Plus className="h-4 w-4" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <FormTarefa onClose={() => setIsCreateModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="card-vibrant border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskCounts.total}</div>
              </CardContent>
            </Card>

            <Card className="card-vibrant border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{taskCounts.pendente}</div>
              </CardContent>
            </Card>

            <Card className="card-vibrant border-l-4 border-l-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{taskCounts.em_andamento}</div>
              </CardContent>
            </Card>

            <Card className="card-vibrant border-l-4 border-l-success">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{taskCounts.concluida}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 card-vibrant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Input
                    placeholder="Buscar tarefas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="1">Crítica</SelectItem>
                    <SelectItem value="2">Alta</SelectItem>
                    <SelectItem value="3">Média</SelectItem>
                    <SelectItem value="4">Baixa</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={funcionarioFilter} onValueChange={setFuncionarioFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os funcionários</SelectItem>
                    {mockUsers.filter((u) => u.role === 'funcionario').map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {mockSetores.map((setor) => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma tarefa encontrada com os filtros aplicados.</p>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className="card-vibrant hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(task.status)}
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge className={getPriorityColor(task.priority)}>
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          {isOverdue(task.deadline) && task.status !== 'concluida' && (
                            <Badge variant="destructive">Atrasada</Badge>
                          )}
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </div>

                      <Button variant="outline" size="sm" className="btn-animated">
                        Editar
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Atribuído a: <strong>{task.assigned_user?.name}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Setor: <strong>{task.setor?.name}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Prazo: {formatDate(task.deadline)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Criada em: {formatDate(task.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="bg-card/80 backdrop-blur-sm border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Desenvolvido por <span className="font-semibold text-foreground">My Attire Technology</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardAdmin;