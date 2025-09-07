import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield, Database } from 'lucide-react';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';

export default function FirebaseAdminPage() {
  const { user, logout, loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary-light">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <p className="text-secondary-light">Você precisa fazer login para acessar esta área</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/admin'} 
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-light mb-2">
            Área Administrativa
          </h1>
          <p className="text-secondary-light">
            Bem-vindo, {user.email}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="text-blue-500" size={24} />
                Usuário Logado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-light mb-2">Email:</p>
              <p className="font-mono text-sm bg-accent/20 p-2 rounded">
                {user.email}
              </p>
              <p className="text-sm text-secondary-light mt-2">
                UID: {user.uid}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600/20 to-green-700/10 border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-green-500" size={24} />
                Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-light mb-2">Status:</p>
              <p className="text-green-500 font-semibold">Autenticado</p>
              <p className="text-sm text-secondary-light mt-2">
                Verificado: {user.emailVerified ? 'Sim' : 'Não'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="text-purple-500" size={24} />
                Firebase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary-light mb-2">Conectado ao:</p>
              <p className="text-purple-500 font-semibold">Firebase Auth</p>
              <p className="text-sm text-secondary-light mt-2">
                Projeto: sistemav-8c4ad
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={logout}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

