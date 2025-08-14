import { useState, useEffect } from "react";
import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Edit, Calendar } from "lucide-react";
import FormSetor from "@/components/FormSetor";
import { Setor } from "@/types";

const SetoresPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch setores from API on component mount
  useEffect(() => {
    const fetchSetores = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:5050/setores");
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        console.log("API Response:", data); // Debug log to inspect response
        // Here we're assuming that your API returns an array with 'nome' and 'data_criacao'
        const formattedSetores = Array.isArray(data) ? data : [];
        setSetores(formattedSetores);
      } catch (err) {
        console.error("Erro ao carregar setores:", err);
        setError("Falha ao carregar os setores. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchSetores();
  }, []);

  // Filter setores based on search term with safeguards
  const filteredSetores = setores.filter((setor) => {
    const name = setor.nome || ""; // Default to empty string if name is undefined
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle edit setor
  const handleEditSetor = (setor: Setor) => {
    setEditingSetor(setor);
  };

  // Handle close edit modal
  const handleCloseEdit = () => {
    setEditingSetor(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/15 via-warning/10 via-accent/10 to-success/15 flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 pointer-events-none"></div>
      <Navigation />

      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 gradient-text">Gerenciamento de Setores</h1>
              <p className="text-muted-foreground">Gerencie os setores da empresa</p>
            </div>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 btn-animated pulse-glow">
                  <Plus className="h-4 w-4" />
                  Novo Setor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <FormSetor
                  onClose={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-vibrant border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Setores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{setores.length}</div>
              </CardContent>
            </Card>

            <Card className="card-vibrant border-l-4 border-l-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Setores Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{setores.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6 card-vibrant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Setores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Busque por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Setores Table */}
          <Card className="card-vibrant">
            <CardHeader>
              <CardTitle>Lista de Setores</CardTitle>
              <CardDescription>{filteredSetores.length} setor(es) encontrado(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando setores...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSetores.map((setor) => (
                      <TableRow key={setor.nome}>
                        <TableCell className="font-medium">{setor.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(String(setor.data_criacao))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSetor(setor)}
                              className="btn-animated"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SetoresPage;
