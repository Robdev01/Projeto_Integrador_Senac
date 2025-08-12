import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task } from '@/types';

type Usuario = { id: number; nome: string; perfil?: string; ativo?: boolean | number; setor?: { name?: string } };
type Setor = { nome: string; data_criacao?: string; active?: boolean };

interface FormTarefaProps {
  task?: Task;
  usuarios?: Usuario[];   // agora opcionais
  setores?: Setor[];      // agora opcionais
  onClose: () => void;
  onCreated?: () => void;
  onSave?: (task: Partial<Task>) => void;
}

// Config da API (ex.: VITE_API_URL="http://127.0.0.1:5003/api")
const API_BASE = 'http://127.0.0.1:5050/';

const FormTarefa = ({ task, usuarios = [], setores = [], onClose, onCreated, onSave }: FormTarefaProps) => {
  // form state
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    setor_nome: (task as any)?.setor?.name || (task as any)?.setor_nome || '',
    funcionario_nome: (task as any)?.assigned_user?.nome || (task as any)?.funcionario_nome || '',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
    priority: (task?.priority as 1 | 2 | 3 | 4) ?? 3,
    status: (task?.status as 'pendente' | 'em_andamento' | 'concluida') ?? 'pendente',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // listas locais (vêm via props OU via API)
  const [usuariosApi, setUsuariosApi] = useState<Usuario[]>([]);
  const [setoresApi, setSetoresApi] = useState<Setor[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSetores, setLoadingSetores] = useState(false);

  const allUsuarios = useMemo(() => (usuarios.length ? usuarios : usuariosApi), [usuarios, usuariosApi]);
  const allSetores = useMemo(() => (setores.length ? setores : setoresApi), [setores, setoresApi]);

  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // busca das rotas da sua API se não vierem do pai
  useEffect(() => {
    const mustFetchUsers = !usuarios || usuarios.length === 0;
    const mustFetchSetores = !setores || setores.length === 0;

    const loadUsuarios = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch(`${API_BASE}/usuarios`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUsuariosApi(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Falha ao carregar usuários', e);
        setUsuariosApi([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const loadSetores = async () => {
      setLoadingSetores(true);
      try {
        const res = await fetch(`${API_BASE}/setores`, { headers: { 'Content-Type': 'application/json', ...authHeaders() } });
        if (res.status === 404) { setSetoresApi([]); setLoadingSetores(false); return; }
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSetoresApi(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Falha ao carregar setores', e);
        setSetoresApi([]);
      } finally {
        setLoadingSetores(false);
      }
    };

    if (mustFetchUsers) loadUsuarios();
    if (mustFetchSetores) loadSetores();
  }, [usuarios, setores]);

  // filtros simples
  const funcionariosComuns = allUsuarios.filter(u => (u.perfil));
  const setoresAtivos = allSetores.filter(s => (s as any).active !== false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.setor_nome) newErrors.setor_nome = 'Setor é obrigatório';
    if (!formData.funcionario_nome) newErrors.funcionario_nome = 'Funcionário é obrigatório';
    if (!formData.deadline) newErrors.deadline = 'Prazo é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      titulo: formData.title,
      descricao: formData.description,
      funcionario: formData.funcionario_nome, // NOME
      setor: formData.setor_nome,             // NOME
      prazo: formData.deadline,
      prioridade: formData.priority,
      status: formData.status,
    };

    try {
      const isEdit = Boolean(task?.id);
      const url = isEdit ? `${API_BASE}/tarefas/${task!.id}` : `${API_BASE}/tarefas`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();

      // opcional: callback local
      if (onSave) {
        const taskData: Partial<Task> = {
          id: result?.tarefa?.id ?? result?.id ?? task?.id ?? Date.now().toString(),
          title: payload.titulo,
          description: payload.descricao,
          deadline: payload.prazo,
          priority: payload.prioridade as 1 | 2 | 3 | 4,
          status: payload.status,
          assigned_user: { nome: formData.funcionario_nome } as any,
          setor: { name: formData.setor_nome } as any,
          created_at: (task as any)?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSave(taskData);
      }

      onCreated?.(); // peça ao Dashboard para recarregar lista
      onClose();
    } catch (error) {
      console.error('Erro ao enviar a tarefa:', error);
      setErrors({ submit: 'Erro ao salvar a tarefa. Tente novamente.' });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Digite o título da tarefa"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva os detalhes da tarefa"
            rows={4}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Setor *</Label>
            <Select
              value={formData.setor_nome}
              onValueChange={(value) => setFormData({ ...formData, setor_nome: value })}
              disabled={loadingSetores}
            >
              <SelectTrigger className={errors.setor_nome ? 'border-destructive' : ''}>
                <SelectValue placeholder={loadingSetores ? 'Carregando setores...' : 'Selecione o setor'} />
              </SelectTrigger>
              <SelectContent>
                {setoresAtivos.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {loadingSetores ? 'Carregando...' : 'Nenhum setor encontrado'}
                  </div>
                ) : (
                  setoresAtivos.map((setor) => (
                    <SelectItem key={setor.nome} value={setor.nome}>
                      {setor.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.setor_nome && <p className="text-sm text-destructive">{errors.setor_nome}</p>}
          </div>

          <div className="space-y-2">
            <Label>Funcionário *</Label>
            <Select
              value={formData.funcionario_nome}
              onValueChange={(value) => setFormData({ ...formData, funcionario_nome: value })}
              disabled={loadingUsers}
            >
              <SelectTrigger className={errors.funcionario_nome ? 'border-destructive' : ''}>
                <SelectValue placeholder={loadingUsers ? 'Carregando funcionários...' : 'Selecione o funcionário'} />
              </SelectTrigger>

              {/* 👇 altura maior + scroll */}
              <SelectContent className="max-h-80 overflow-y-auto">
                {funcionariosComuns.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {loadingUsers ? 'Carregando...' : 'Nenhum funcionário encontrado'}
                  </div>
                ) : (
                  funcionariosComuns.map((f) => (
                    <SelectItem key={f.id} value={f.nome}>
                      {f.nome} {f.setor?.name ? `(${f.setor.name})` : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.funcionario_nome && <p className="text-sm text-destructive">{errors.funcionario_nome}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className={errors.deadline ? 'border-destructive' : ''}
            />
            {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
          </div>

          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select
              value={String(formData.priority)}
              onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value, 10) as 1 | 2 | 3 | 4 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Crítica</SelectItem>
                <SelectItem value="2">2 - Alta</SelectItem>
                <SelectItem value="3">3 - Média</SelectItem>
                <SelectItem value="4">4 - Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{task ? 'Atualizar' : 'Criar'} Tarefa</Button>
        </div>
      </form>
    </>
  );
};

export default FormTarefa;
