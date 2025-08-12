import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Setor {
  id: number;
  nome: string;
}

const RegisterPage = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("comum");
  const [setor, setSetor] = useState(""); // Default to empty string, will be updated when user selects a setor
  const [ativo, setAtivo] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [setores, setSetores] = useState<Setor[]>([]);
  const [isLoadingSetores, setIsLoadingSetores] = useState(true);
  const navigate = useNavigate();

  // Fetch setores from API with error handling
  useEffect(() => {
    const fetchSetores = async () => {
      setIsLoadingSetores(true);
      try {
        const response = await fetch("http://127.0.0.1:5050/setores");
        console.log("Setores response status:", response.status);
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const data = await response.json();
        console.log("Setores data:", data);
        setSetores(data);
      } catch (error) {
        console.error("Erro ao buscar setores:", error);
        setError("Não foi possível carregar os setores. O cadastro pode continuar sem setores.");
        setSetores([]);
      } finally {
        setIsLoadingSetores(false);
      }
    };
    fetchSetores();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !senha) {
      setError("Por favor, preencha nome, email e senha.");
      return;
    }

    const userData = {
      nome,
      email,
      senha,
      perfil,
      setor: setor || null, // Use `null` if no setor is selected
      ativo: ativo ? 1 : 0, // Send as 1 (active) or 0 (inactive)
    };

    try {
      const response = await fetch("http://127.0.0.1:5050/usuarios/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário.");
      }

      setSuccess("Usuário cadastrado com sucesso!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/15 via-warning/10 via-accent/10 to-success/15 p-4 relative overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/90 backdrop-blur-md card-vibrant animate-float relative z-10">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold gradient-text">Cadastro de Novo Usuário</CardTitle>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perfil">Perfil</Label>
              <select
                id="perfil"
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="comum">Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor">Setor</Label>
              <Select onValueChange={setSetor} value={setor} disabled={isLoadingSetores}>
                <SelectTrigger id="setor" className="w-full">
                  <SelectValue placeholder={isLoadingSetores ? "Carregando setores..." : "Selecione o setor"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {setores.map((s) => (
                    <SelectItem key={s.id} value={s.nome}> {/* Setor nome em vez de id */}
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ativo">Ativo</Label>
              <select
                id="ativo"
                value={ativo.toString()}
                onChange={(e) => setAtivo(e.target.value === "true")}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <Button type="submit" className="w-full btn-animated pulse-glow">
              Cadastrar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="outline" className="btn-animated" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
