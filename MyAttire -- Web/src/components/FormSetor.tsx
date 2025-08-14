import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    active: setor?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSetor = async (nome: string) => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5050/setores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar setor.");
      }

      const newSetor = await response.json();

      if (onSave) {
        onSave(newSetor); // Passa para o pai
      }

      onClose();
    } catch (error) {
      console.error("Erro ao criar setor:", error);
      setErrors({ api: "Falha ao criar setor. Verifique o console para detalhes." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!setor) {
      // Criar novo setor
      handleCreateSetor(formData.name);
    } else {
      // Atualizar setor
      const setorData = {
        ...formData,
        id: setor.id,
        created_at: setor.created_at,
      };
      if (onSave) onSave(setorData);
      onClose();
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{setor ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
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
          {errors.api && <p className="text-sm text-destructive">{errors.api}</p>}
        </div>

        {setor && (
          <div className="space-y-2">
            <Label htmlFor="active">Status</Label>
            <Select
              value={formData.active.toString()}
              onValueChange={(value) => setFormData({ ...formData, active: value === 'true' })}
            >
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
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : setor ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default FormSetor;
