import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home, Users, Building2 } from 'lucide-react';
import logo from '@/assets/9-removebg-preview.png';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtém os dados do usuário do localStorage
  const user = JSON.parse(localStorage.getItem('user')) || null;

  const handleLogout = () => {
    // Remove token e dados do usuário do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // Define os itens do menu com base no papel do usuário
  const menuItems = [
    {
      label: 'Dashboard',
      path: user && user.role === 'admin' ? '/admin/dashboard' : '/funcionario/dashboard',
      icon: Home,
    },
    ...(user && user.role === 'admin'
      ? [
          { label: 'Usuários', path: '/admin/usuarios', icon: Users },
          { label: 'Setores', path: '/admin/setores', icon: Building2 },
        ]
      : []),
  ];

  // Se não houver usuário, redireciona para a página de login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <img src={logo} alt="My Attire" className="h-10 w-auto" />
            </div>

            <div className="hidden md:flex space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              <span className="font-medium">{user.nome}</span>
              <span className="text-muted-foreground">({user.role})</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;