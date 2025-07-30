import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Filter, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { mockTasks } from '@/data/mockData';
import { Task } from '@/types';

const DashboardFuncionario = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter tasks assigned to current user
  const userTasks = mockTasks.filter(task => task.assigned_to === user?.id);

  const filteredTasks = useMemo(() => {
    return userTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority.toString() === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [userTasks, searchTerm, statusFilter, priorityFilter]);

  const taskCounts = {
    total: userTasks.length,
    pendente: userTasks.filter(t => t.status === 'pendente').length,
    em_andamento: userTasks.filter(t => t.status === 'em_andamento').length,
    concluida: userTasks.filter(t => t.status === 'concluida').length,
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-destructive text-destructive-foreground';
      case 2: return 'bg-warning text-warning-foreground';
      case 3: return 'bg-primary text-primary-foreground';
      case 4: return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case 'em_andamento': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'pendente': return <Circle className="h-4 w-4 text-muted-foreground" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Crítica';
      case 2: return 'Alta';
      case 3: return 'Média';
      case 4: return 'Baixa';
      default: return 'Indefinida';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && deadline !== '';
  };

  const handleCompleteTask = (taskId: string) => {
    // In a real app, this would make an API call
    console.log('Completing task:', taskId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Tarefas</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas atribuídas</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskCounts.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{taskCounts.pendente}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{taskCounts.em_andamento}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{taskCounts.concluida}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Card key={task.id} className="hover:shadow-md transition-shadow">
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
                    
                    {task.status !== 'concluida' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Prazo: {formatDate(task.deadline)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Criada em: {formatDate(task.created_at)}</span>
                    </div>
                    {task.setor && (
                      <Badge variant="outline">{task.setor.name}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFuncionario;