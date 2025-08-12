import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verifique se o token existe no localStorage

  // Se não estiver autenticado, redirecione para a página de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, renderize a página protegida
  return children;
};

export default PrivateRoute;
