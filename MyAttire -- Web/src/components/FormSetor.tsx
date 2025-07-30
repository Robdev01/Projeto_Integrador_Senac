import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Setor } from '@/types';

interface FormSetorProps {
  setor?: Setor;
  onClose: () => void;
  onSave?: (setor: Partial<Setor>) => void;
}

const FormSetor = ({ setor, onClose, onSave }: FormSetorProps) => {
  const [formData, setFormData] = useState({
    name: setor?.name || '',
    description: setor?.description || '',
    active: setor?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const setorData = {
      ...formData,
      id: setor?.id || Date.now().toString(),
      created_at: setor?.created_at || new Date().toISOString(),
    };

    if (onSave) {
      onSave(setorData);
    } else {
      // Mock save action
      console.log('Saving setor:', setorData);
    }
    
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {setor ? 'Editar Setor' : 'Novo Setor'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Setor *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Digite o nome do setor"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva as responsabilidades do setor"
            rows={3}
          />
        </div>

        {setor && (
          <div className="space-y-2">
            <Label htmlFor="active">Status</Label>
            <Select value={formData.active.toString()} onValueChange={(value) => setFormData({ ...formData, active: value === 'true' })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {setor ? 'Atualizar' : 'Criar'} Setor
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormSetor;