import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Clock, Filter, CheckCircle2, AlertCircle, Circle, Users, Building2, Trash2 } from 'lucide-react';
import FormTarefa from '@/components/FormTarefa';

const API_BASE = 'http://127.0.0.1:5050/'; // ex.: http://127.0.0.1:5003/api
const API = (API_BASE || '').replace(/\/$/, ''); // remove barra final

const DashboardAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [funcionarioFilter, setFuncionarioFilter] = useState('all');
  const [setorFilter, setSetorFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // dados reais
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [setores, setSetores] = useState<any[]>([]);

  // edição
  const [editingTask, setEditingTask] = useState<any | null>(null);

  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Verifica se o usuário está autenticado e é admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !user.role || user.role !== 'admin') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const mapTaskFromApi = (t: any) => ({
    id: t.id,
    title: t.titulo,
    description: t.descricao,
    assigned_user: t.funcionario ? { nome: t.funcionario } : null,
    setor: t.setor ? { name: t.setor, id: t.setor } : null,
    deadline: t.prazo,
    created_at: t.data_criacao,
    priority: Number(t.prioridade),
    status: t.status as 'pendente' | 'em_andamento' | 'concluida',
  });

  // carregar usuários, setores e tarefas
  const loadUsers = async () => {
    const res = await fetch(`${API}/usuarios`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setUsers(json);
  };

  const loadSetores = async () => {
    const res = await fetch(`${API}/setores`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (res.status === 404) { setSetores([]); return; }
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setSetores(json);
  };

  const loadTasks = async () => {
    const res = await fetch(`${API}/tarefas`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    setTasks(Array.isArray(json) ? json.map(mapTaskFromApi) : []);
  };

  const loadAll = async () => {
    await Promise.all([loadUsers(), loadSetores(), loadTasks()]);
  };

  useEffect(() => {
    loadAll().catch(console.error);
  }, []);

  // GET /tarefas/:id para abrir edição com dados atuais
  const fetchTaskById = async (id: number) => {
    const res = await fetch(`${API}/tarefas/${id}`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
    if (!res.ok) throw new Error(await res.text());
    const t = await res.json();
    return mapTaskFromApi(t);
  };

  // PATCH /tarefas/:id { status }
  const updateTaskStatus = async (id: number, status: 'pendente' | 'em_andamento' | 'concluida') => {
    const res = await fetch(`${API}/tarefas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return json;
  };

  // Marcar como concluída (optimistic UI + rollback)
  const markTaskDone = async (task: any) => {
    if (task.status === 'concluida') return; // já está concluída
    const prev = tasks;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'concluida' } : t));
    try {
      await updateTaskStatus(task.id, 'concluida');
    } catch (e) {
      console.error(e);
      alert('Não foi possível concluir a tarefa.');
      setTasks(prev); // rollback
    }
  };

  // DELETE /tarefas/:id
  const deleteTask = async (id: number) => {
    const go = confirm('Tem certeza que deseja excluir esta tarefa?');
    if (!go) return;
    const res = await fetch(`${API}/tarefas/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Erro ao excluir: ${msg}`);
      return;
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleEditClick = async (taskId: number) => {
    try {
      const latest = await fetchTaskById(taskId);
      setEditingTask(latest);
    } catch (e) {
      console.error(e);
      alert('Não foi possível carregar a tarefa para edição.');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || String(task.priority) === priorityFilter;
      const matchesFuncionario =
        funcionarioFilter === 'all' ||
        (task.assigned_user?.nome && String(task.assigned_user.nome) === String(funcionarioFilter));
      const matchesSetor =
        setorFilter === 'all' || (task.setor?.name && String(task.setor.name) === String(setorFilter));

      return matchesSearch && matchesStatus && matchesPriority && matchesFuncionario && matchesSetor;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, funcionarioFilter, setorFilter]);

  const taskCounts = {
    total: tasks.length,
    pendente: tasks.filter((t) => t.status === 'pendente').length,
    em_andamento: tasks.filter((t) => t.status === 'em_andamento').length,
    concluida: tasks.filter((t) => t.status === 'concluida').length,
  };

  const getPriorityColor = (priority: number) => {
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

  const getStatusIcon = (status: string) => {
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

  const getPriorityLabel = (priority: number) => {
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

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '';
  };

  const isOverdue = (deadline?: string) => {
    return !!deadline && new Date(deadline) < new Date();
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

            {/* único Dialog controlando criar/editar */}
            <Dialog
              open={isCreateModalOpen || !!editingTask}
              onOpenChange={(open) => {
                if (!open) {
                  setIsCreateModalOpen(false);
                  setEditingTask(null);
                }
              }}
            >
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 btn-animated pulse-glow">
                  <Plus className="h-4 w-4" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <FormTarefa
                  usuarios={users.filter((u: any) => u.perfil === 'comum')}
                  setores={setores}
                  onClose={() => setIsCreateModalOpen(false)}
                  onCreated={() => {
                    setIsCreateModalOpen(false);
                    loadAll().catch(console.error);
                  }}
                />
              </DialogContent>
            </Dialog>

              <DialogContent className="max-w-2xl">
                {/* Criar */}
                {isCreateModalOpen && !editingTask && (
                  <FormTarefa
                    usuarios={users.filter((u: any) => u.perfil === 'comum')}
                    setores={setores}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreated={() => {
                      setIsCreateModalOpen(false);
                      loadTasks().catch(console.error);
                    }}
                  />
                )}

                {/* Editar */}
                {editingTask && (
                  <FormTarefa
                    task={editingTask}
                    usuarios={users.filter((u: any) => u.perfil === 'comum')}
                    setores={setores}
                    onClose={() => setEditingTask(null)}
                    onCreated={() => {
                      setEditingTask(null);
                      loadTasks().catch(console.error);
                    }}
                  />
                )}
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
                  <SelectContent className="max-h-96 overflow-y-auto">
                    <SelectItem value="all">Todos os funcionários</SelectItem>
                    {users
                      .filter((u: any) => u.perfil === 'comum')
                      .map((user: any) => (
                        <SelectItem key={user.id} value={String(user.nome)}>
                          {user.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Select value={setorFilter} onValueChange={setSetorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Setor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-96 overflow-y-auto">
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {setores.map((s: any) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.nome}
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
                          {/* bolinha clicável -> conclui tarefa */}
                          <button
                            onClick={() => markTaskDone(task)}
                            disabled={task.status === 'concluida'}
                            title={task.status === 'concluida' ? 'Tarefa concluída' : 'Marcar como concluída'}
                            className={`rounded-full p-1 transition-transform ${
                              task.status !== 'concluida'
                                ? 'cursor-pointer hover:scale-110'
                                : 'opacity-60 cursor-default'
                            }`}
                          >
                            {getStatusIcon(task.status)}
                          </button>

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

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-animated"
                          onClick={() => handleEditClick(task.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="btn-animated"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Atribuído a: <strong>{task.assigned_user?.nome}</strong>
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
            Desenvolvido por <span className="font-semibold text-foreground">IGET</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardAdmin;
