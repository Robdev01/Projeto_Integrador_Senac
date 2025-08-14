import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import logo from '@/assets/9-removebg-preview.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5050/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.usuario) {
        const { token, usuario } = data;

        // Armazenando o token e os dados do usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem(
          'user',
          JSON.stringify({
            email: usuario.email,
            nome: usuario.nome,
            role: usuario.role, // Mapeia "perfil" para "role"
            ativo: usuario.ativo,
          })
        );

        console.log('Usuário autenticado com sucesso!', usuario);  // Verifique os dados do usuário

        // Definindo as rotas de redirecionamento com base no perfil do usuário
        const rotaPorPermissao: Record<string, string> = {
          admin: '/admin/dashboard',
          comum: '/funcionario/dashboard',
        };

        // Usando a rota correta com base no perfil do usuário
        const destino = rotaPorPermissao[usuario.role] || '/';
        navigate(destino);

      } else {
        setError(data.error || 'Resposta inválida do servidor');
      }

    } catch (error) {
      setError('Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/15 via-warning/10 via-accent/10 to-success/15 p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse"></div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/90 backdrop-blur-md card-vibrant  relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="My Attire" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Sistema de Gestão</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full btn-animated pulse-glow" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
