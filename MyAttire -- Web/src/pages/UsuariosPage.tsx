import { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, UserCheck, UserX, Mail, Building2 } from 'lucide-react';
import { mockUsers, mockSetores } from '@/data/mockData';
import FormUsuario from '@/components/FormUsuario';
import { User } from '@/types';

const UsuariosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.setor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleToggleActive = (userId: string) => {
    // Mock toggle active status
    console.log('Toggling active status for user:', userId);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
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
            <p className="text-muted-foreground">Gerencie usuários e funcionários do sistema</p>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 btn-animated pulse-glow">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FormUsuario onClose={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-vibrant border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-vibrant border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{mockUsers.filter(u => u.active).length}</div>
            </CardContent>
          </Card>
          
          <Card className="card-vibrant border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{mockUsers.filter(u => u.role === 'funcionario').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6 card-vibrant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Busque por nome, email ou setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="card-vibrant">
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
            <CardDescription>
              {filteredUsers.length} usuário(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.setor ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {user.setor.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? 'success' : 'destructive'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="btn-animated"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant={user.active ? "destructive" : "success"}
                          size="sm"
                          onClick={() => handleToggleActive(user.id)}
                          className="btn-animated"
                        >
                          {user.active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
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

        {/* Edit User Modal */}
        <Dialog open={editingUser !== null} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-2xl">
            {editingUser && (
              <FormUsuario 
                user={editingUser} 
                onClose={handleCloseEdit} 
              />
            )}
          </DialogContent>
        </Dialog>
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

export default UsuariosPage;