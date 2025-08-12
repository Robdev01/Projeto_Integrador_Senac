import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Filter, CheckCircle2, AlertCircle, Circle } from "lucide-react";

const API_BASE = "http://127.0.0.1:5050/"; // ex.: http://127.0.0.1:5003/api
const API = (API_BASE || "").replace(/\/$/, ""); // remove barra final

type TStatus = "pendente" | "em_andamento" | "concluida";

type TTask = {
  id: number;
  titulo: string;
  descricao: string;
  funcionario?: string; // no backend estamos salvando NOME do funcionário
  setor?: string;
  prazo?: string;
  data_criacao?: string;
  prioridade?: number | string;
  status: TStatus;
};

const DashboardFuncionario = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tasks, setTasks] = useState<TTask[]>([]);
  const navigate = useNavigate();

  // usuário logado (do localStorage). No login backend retorna { email, nome, role, setor, ativo }
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Redireciona se não autenticado ou não for funcionário (perfil 'comum')
  useEffect(() => {
    if (!user || !user.role || user.role !== "comum") {
      navigate("/login", { replace: true });
    }
  }, [navigate, user]);

  // Carrega tarefas reais
  const loadTasks = async () => {
    const res = await fetch(`${API}/tarefas`, {
      headers: { "Content-Type": "application/json", ...authHeaders() },
    });
    if (!res.ok) throw new Error(await res.text());
    const json: any[] = await res.json();

    // mapeia pro shape do front (mantendo nomes)
    const mapped: TTask[] = (Array.isArray(json) ? json : []).map((t: any) => ({
      id: t.id,
      titulo: t.titulo,
      descricao: t.descricao,
      funcionario: t.funcionario ?? "", // NOME do funcionário atribuído
      setor: t.setor ?? "",
      prazo: t.prazo,
      data_criacao: t.data_criacao,
      prioridade: Number(t.prioridade),
      status: t.status as TStatus,
    }));
    setTasks(mapped);
  };

  useEffect(() => {
    loadTasks().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apenas tarefas do usuário logado (comparando por NOME)
  const userTasks = useMemo(
    () => tasks.filter((t) => (t.funcionario || "").trim() === (user?.nome || "").trim()),
    [tasks, user?.nome]
  );

  // Filtros
  const filteredTasks = useMemo(() => {
    return userTasks.filter((task) => {
      const matchesSearch =
        (task.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.descricao || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === (statusFilter as TStatus);
      const matchesPriority = priorityFilter === "all" || String(task.prioridade) === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [userTasks, searchTerm, statusFilter, priorityFilter]);

  // Contadores
  const taskCounts = {
    total: userTasks.length,
    pendente: userTasks.filter((t) => t.status === "pendente").length,
    em_andamento: userTasks.filter((t) => t.status === "em_andamento").length,
    concluida: userTasks.filter((t) => t.status === "concluida").length,
  };

  // Helpers UI
  const getPriorityColor = (priority?: number | string) => {
    const p = Number(priority);
    switch (p) {
      case 1:
        return "bg-destructive text-destructive-foreground";
      case 2:
        return "bg-warning text-warning-foreground";
      case 3:
        return "bg-primary text-primary-foreground";
      case 4:
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: TStatus) => {
    switch (status) {
      case "concluida":
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
      case "em_andamento":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "pendente":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getPriorityLabel = (priority?: number | string) => {
    const p = Number(priority);
    switch (p) {
      case 1:
        return "Crítica";
      case 2:
        return "Alta";
      case 3:
        return "Média";
      case 4:
        return "Baixa";
      default:
        return "Indefinida";
    }
  };

  const formatDate = (dateString?: string) => {
    return dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "";
  };

  const isOverdue = (deadline?: string, status?: TStatus) => {
    return !!deadline && new Date(deadline) < new Date() && status !== "concluida";
  };

  // Concluir tarefa (PATCH /tarefas/:id { status: 'concluida' }) com update otimista
  const handleCompleteTask = async (taskId: number) => {
    const prev = tasks;
    // otimismo: marca local só a do usuário
    setTasks((cur) =>
      cur.map((t) => (t.id === taskId ? { ...t, status: "concluida" as TStatus } : t))
    );
    try {
      const res = await fetch(`${API}/tarefas/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status: "concluida" }),
      });
      if (!res.ok) throw new Error(await res.text());
      // se quiser, pode dar reload das tasks:
      // await loadTasks();
    } catch (e) {
      console.error(e);
      alert("Não foi possível concluir a tarefa.");
      setTasks(prev); // rollback
    }
  };

  // Evita render durante redirecionamento
  if (!user) return null;

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
                        <CardTitle className="text-lg">{task.titulo}</CardTitle>
                        <Badge className={getPriorityColor(task.prioridade)}>{getPriorityLabel(task.prioridade)}</Badge>
                        {isOverdue(task.prazo, task.status) && (
                          <Badge variant="destructive">Atrasada</Badge>
                        )}
                      </div>
                      <CardDescription>{task.descricao}</CardDescription>
                    </div>

                    {task.status !== "concluida" && (
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
                      <span>Prazo: {formatDate(task.prazo)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Criada em: {formatDate(task.data_criacao)}</span>
                    </div>
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
