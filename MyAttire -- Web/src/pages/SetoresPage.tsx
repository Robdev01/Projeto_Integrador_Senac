import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { mockSetores } from '@/data/mockData';
import FormSetor from '@/components/FormSetor';
import { Setor } from '@/types';

const SetoresPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);

  const filteredSetores = mockSetores.filter(setor =>
    setor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (setor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleToggleActive = (setorId: string) => {
    // Mock toggle active status
    console.log('Toggling active status for setor:', setorId);
  };

  const handleEditSetor = (setor: Setor) => {
    setEditingSetor(setor);
  };

  const handleCloseEdit = () => {
    setEditingSetor(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Setores</h1>
            <p className="text-muted-foreground">Gerencie os setores da empresa</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Setor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <FormSetor onClose={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Setores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockSetores.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Setores Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{mockSetores.filter(s => s.active).length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Setores Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{mockSetores.filter(s => !s.active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Setores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Busque por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Setores Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Setores</CardTitle>
            <CardDescription>
              {filteredSetores.length} setor(es) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSetores.map((setor) => (
                  <TableRow key={setor.id}>
                    <TableCell className="font-medium">{setor.name}</TableCell>
                    <TableCell>
                      {setor.description ? (
                        <span className="text-sm">{setor.description}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={setor.active ? 'success' : 'destructive'}>
                        {setor.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(setor.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSetor(setor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant={setor.active ? "destructive" : "success"}
                          size="sm"
                          onClick={() => handleToggleActive(setor.id)}
                        >
                          {setor.active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Setor Modal */}
        <Dialog open={editingSetor !== null} onOpenChange={() => setEditingSetor(null)}>
          <DialogContent className="max-w-lg">
            {editingSetor && (
              <FormSetor 
                setor={editingSetor} 
                onClose={handleCloseEdit} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SetoresPage;