import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Shield, Users, BarChart3 } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", { username, password });

    if (!username || !password) {
      console.error("Username or password is empty");
      return;
    }

    const success = await login(username, password);
    console.log("Login result:", success);

    if (success) {
      console.log("Login successful, should redirect now");
    } else {
      console.log("Login failed, staying on login page");
    }
  };

  const testUsers = [
    { username: 'admin', password: 'admin123', role: 'Administrador', icon: Shield },
    { username: 'comercial', password: 'comercial123', role: 'Comercial', icon: Users },
    { username: 'suprimentos', password: 'suprimentos123', role: 'Suprimentos', icon: Building2 },
    { username: 'diretoria', password: 'diretoria123', role: 'Diretoria', icon: BarChart3 },
  ];

  const handleTestLogin = (testUsername: string, testPassword: string) => {
    setUsername(testUsername);
    setPassword(testPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">GMX - Custos de Obras</CardTitle>
            <CardDescription className="text-center">
              Sistema de gestão de custos de construção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Erro de Login:</strong> {error}
                  <br />
                  <small className="text-xs mt-1 block">
                    Verifique se o backend está rodando em localhost:8000
                  </small>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Test Users */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Usuários de Teste</CardTitle>
            <CardDescription>
              Clique em um dos perfis abaixo para fazer login automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {testUsers.map((user) => {
              const IconComponent = user.icon;
              return (
                <Button
                  key={user.username}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleTestLogin(user.username, user.password)}
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">{user.role}</div>
                      <div className="text-sm text-gray-500">
                        {user.username} / {user.password}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Funcionalidades por Perfil:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Admin:</strong> Acesso completo ao sistema</li>
                <li><strong>Comercial:</strong> Gestão de contratos e orçamentos</li>
                <li><strong>Suprimentos:</strong> Compras, fornecedores e cotações</li>
                <li><strong>Diretoria:</strong> Dashboards executivos e relatórios</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;