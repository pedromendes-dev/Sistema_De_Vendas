import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Rocket, 
  Building2, 
  Users, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Info,
  Settings,
  Sparkles
} from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: () => void;
}

export default function QuickStartGuide() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'company',
      title: 'Configurar Empresa',
      description: 'Defina o nome da sua empresa e personalizações básicas',
      completed: false
    },
    {
      id: 'first-attendant',
      title: 'Primeiro Atendente',
      description: 'Cadastre seu primeiro vendedor no sistema',
      completed: false
    },
    {
      id: 'first-sale',
      title: 'Primeira Venda',
      description: 'Registre uma venda para testar o sistema',
      completed: false
    },
    {
      id: 'goals',
      title: 'Configurar Metas',
      description: 'Defina metas de vendas para motivar sua equipe',
      completed: false
    },
    {
      id: 'admin',
      title: 'Usuários Admin',
      description: 'Adicione outros administradores ao sistema',
      completed: false
    }
  ]);

  const completeStep = (stepId: string) => {
    setSetupSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const setupCompany = () => {
    if (!companyName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome da sua empresa para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Save company config
    const config = {
      company: {
        name: companyName,
        setupDate: new Date().toISOString(),
        currency: 'BRL',
        theme: 'default'
      }
    };
    localStorage.setItem('system_config', JSON.stringify(config));
    
    completeStep('company');
    toast({
      title: "Empresa configurada!",
      description: `${companyName} foi configurada com sucesso.`,
    });
  };

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / setupSteps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success to-info px-4 py-2 rounded-full text-white font-medium mb-4">
          <Rocket className="h-5 w-5" />
          Início Rápido
        </div>
        <h2 className="text-3xl font-bold text-primary-light mb-2">
          Configure seu sistema em 5 passos
        </h2>
        <p className="text-secondary-light text-lg">
          Deixe seu sistema de vendas funcionando em poucos minutos
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary-light">Progresso</span>
            <span className="text-sm text-secondary-light">{completedSteps}/{setupSteps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-gradient-to-r from-success to-info h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-secondary-light mt-2">
            {progressPercentage === 100 ? 'Configuração completa!' : `${progressPercentage.toFixed(0)}% concluído`}
          </p>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <div className="grid gap-4">
        {setupSteps.map((step, index) => (
          <Card 
            key={step.id} 
            className={`transition-all duration-300 ${
              step.completed 
                ? 'bg-success/5 border-success/30' 
                : 'bg-card border-border hover:border-primary/20'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-success text-white' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-bold">{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-light mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-secondary-light">
                    {step.description}
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {step.completed ? (
                    <Badge variant="default" className="bg-success text-white">
                      Concluído
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Configurar
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Company Setup Form */}
      {!setupSteps.find(s => s.id === 'company')?.completed && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Building2 className="h-5 w-5" />
              Comece aqui: Configure sua empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company-name" className="text-blue-700 dark:text-blue-300">
                Nome da Empresa
              </Label>
              <Input
                id="company-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Vendas & Cia Ltda"
                className="border-blue-300 dark:border-blue-700"
              />
            </div>
            <Button 
              onClick={setupCompany}
              className="w-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Configurar Empresa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border hover:border-success/30 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-success mx-auto mb-2" />
            <h3 className="font-medium text-primary-light mb-1">Gerenciar Atendentes</h3>
            <p className="text-xs text-secondary-light">Adicione sua equipe de vendas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-info/30 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-info mx-auto mb-2" />
            <h3 className="font-medium text-primary-light mb-1">Definir Metas</h3>
            <p className="text-xs text-secondary-light">Configure objetivos de vendas</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-warning/30 transition-colors cursor-pointer">
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 text-warning mx-auto mb-2" />
            <h3 className="font-medium text-primary-light mb-1">Configurações</h3>
            <p className="text-xs text-secondary-light">Personalize o sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {progressPercentage === 100 && (
        <Card className="bg-gradient-to-r from-success/10 to-info/10 border-success/30">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-success mb-2">
              Parabéns! Sistema configurado
            </h3>
            <p className="text-secondary-light">
              Seu sistema de vendas está pronto para uso. Comece registrando suas primeiras vendas!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-info/5 border-info/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-primary-light mb-1">Precisa de ajuda?</h4>
              <p className="text-sm text-secondary-light">
                Este sistema foi desenvolvido para ser intuitivo. Cada seção tem suas próprias
                instruções e você pode sempre acessar as configurações avançadas no painel administrativo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}