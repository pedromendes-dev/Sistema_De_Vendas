import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import DemoWarning from "@/components/DemoWarning";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo credentials
    if (credentials.username === "admin" && credentials.password === "senha123") {
      setIsAuthenticated(true);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo à área do gestor.",
      });
    } else {
      toast({
        title: "Credenciais inválidas",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <Header />
        <Navigation />

        <main className="max-w-md mx-auto px-4 py-16">
          <DemoWarning />

          <Card className="bg-card border-border">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-danger rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-primary-light" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-primary-light mb-2">Área Restrita</h2>
                <p className="text-secondary-light">Acesso exclusivo para gestores</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-secondary-light">Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    placeholder="Digite o usuário"
                    className="bg-input border-border text-primary-light placeholder:text-muted-light"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-secondary-light">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      placeholder="Digite a senha"
                      className="bg-input border-border text-primary-light placeholder:text-muted-light pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-light hover:text-secondary-light"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-success text-primary-light hover:bg-success-dark"
                >
                  <Lock size={18} className="mr-2" />
                  Acessar Painel
                </Button>
              </form>

              <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-sm text-warning font-medium mb-1">Dados para demonstração:</p>
                <p className="text-sm text-secondary-light">Usuário: <code className="text-warning">admin</code></p>
                <p className="text-sm text-secondary-light">Senha: <code className="text-warning">senha123</code></p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <Header />
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <DemoWarning />

        {/* Admin Dashboard Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-danger" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-primary-light">Área do Gestor</h2>
              <p className="text-secondary-light">Painel administrativo do sistema</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsAuthenticated(false)}
            variant="outline" 
            className="border-border text-secondary-light hover:text-primary-light"
          >
            Sair
          </Button>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border hover:border-success/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-success" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Controle de Acesso</h3>
              <p className="text-secondary-light text-sm">Gerencie usuários e permissões do sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-info/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-info" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Relatórios Avançados</h3>
              <p className="text-secondary-light text-sm">Visualize relatórios detalhados de vendas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-warning/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-warning" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Configurações</h3>
              <p className="text-secondary-light text-sm">Configure metas e parâmetros do sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-danger/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-danger/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-danger" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Backup de Dados</h3>
              <p className="text-secondary-light text-sm">Realize backup e restore dos dados</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-success/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-success" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Integrações</h3>
              <p className="text-secondary-light text-sm">Configure integrações com outros sistemas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-info/50 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="text-info" size={24} />
              </div>
              <h3 className="text-lg font-bold text-primary-light mb-2">Auditoria</h3>
              <p className="text-secondary-light text-sm">Visualize logs e atividades do sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 bg-card border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-primary-light mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-success text-primary-light hover:bg-success-dark">
                Exportar Relatório Mensal
              </Button>
              <Button className="bg-info text-primary-light hover:bg-blue-600">
                Resetar Dados Demo
              </Button>
              <Button className="bg-warning text-primary-light hover:bg-yellow-600">
                Configurar Metas
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}