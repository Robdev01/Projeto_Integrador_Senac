import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, CalendarIcon } from 'lucide-react';
import { mockUsers, mockSetores } from '@/data/mockData';
import { Task } from '@/types';

interface FormTarefaProps {
  task?: Task;
  onClose: () => void;
  onSave?: (task: Partial<Task>) => void;
}

const FormTarefa = ({ task, onClose, onSave }: FormTarefaProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    setor_id: task?.setor_id || '',
    assigned_to: task?.assigned_to || '',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
    priority: task?.priority || 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    if (!formData.setor_id) {
      newErrors.setor_id = 'Setor é obrigatório';
    }
    if (!formData.assigned_to) {
      newErrors.assigned_to = 'Funcionário é obrigatório';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Prazo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Map formData to the API's expected payload structure
    const payload = {
      titulo: formData.title,
      descricao: formData.description,
      id_funcionario: parseInt(formData.assigned_to),
      id_setor: parseInt(formData.setor_id),
      prazo: formData.deadline,
      prioridade: formData.priority,
      status: task?.status || 'pendente',
    };

    try {
      const response = await fetch('http://127.0.0.1:5003/api/tarefas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar tarefa: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Tarefa criada com sucesso:', result);

      // Map the payload back to the Task type for onSave callback
      if (onSave) {
        const taskData: Partial<Task> = {
          id: result.id || Date.now().toString(), // Use API response ID if available
          title: payload.titulo,
          description: payload.descricao,
          assigned_to: payload.id_funcionario.toString(),
          setor_id: payload.id_setor.toString(),
          deadline: payload.prazo,
          priority: payload.prioridade,
          status: payload.status,
          created_by: '1', // Current user (admin)
          created_at: task?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        onSave(taskData);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao enviar a tarefa:', error);
      setErrors({ submit: 'Erro ao salvar a tarefa. Tente novamente.' });
    }
  };

  const funcionarios = mockUsers.filter(user => user.role === 'funcionario' && user.active);

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {task ? 'Editar Tarefa' : 'Nova Tarefa'}
        </DialogTitle>
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
            <Label htmlFor="setor">Setor *</Label>
            <Select value={formData.setor_id} onValueChange={(value) => setFormData({ ...formData, setor_id: value })}>
              <SelectTrigger className={errors.setor_id ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {mockSetores.filter(setor => setor.active).map(setor => (
                  <SelectItem key={setor.id} value={setor.id}>
                    {setor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.setor_id && <p className="text-sm text-destructive">{errors.setor_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário *</Label>
            <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
              <SelectTrigger className={errors.assigned_to ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map(funcionario => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.name} {funcionario.setor && `(${funcionario.setor.name})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assigned_to && <p className="text-sm text-destructive">{errors.assigned_to}</p>}
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
            <Label htmlFor="priority">Prioridade</Label>
            <Select value={formData.priority.toString()} onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) as 1 | 2 | 3 | 4 })}>
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
          <Button type="submit">
            {task ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormTarefa;