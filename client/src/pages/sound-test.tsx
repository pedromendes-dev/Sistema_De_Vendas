import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Check } from "lucide-react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import { playCashRegisterSound, playSimpleCashSound, playMoneyCountingSound } from "@/utils/sound-effects";

export default function SoundTest() {
  const [lastPlayed, setLastPlayed] = useState("");

  const playSound = (soundName: string, soundFunction: () => void) => {
    soundFunction();
    setLastPlayed(soundName);
    setTimeout(() => setLastPlayed(""), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-dark to-secondary-dark/50">
      <Header />
      <Navigation />

      <main className="universal-container py-8">
        <h1 className="text-3xl font-bold text-primary-light mb-6">
          🔊 Teste de Sons da Caixa Registradora
        </h1>

        <div className="grid gap-4 max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="text-success" />
                Sons Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Som Principal (usado nas vendas)
                </h3>
                <Button
                  onClick={() => playSound("Caixa Registradora Completa", playCashRegisterSound)}
                  variant={lastPlayed === "Caixa Registradora Completa" ? "default" : "outline"}
                  className="w-full"
                >
                  <Volume2 className="mr-2" size={20} />
                  Caixa Registradora Completa
                  {lastPlayed === "Caixa Registradora Completa" && (
                    <Check className="ml-auto" size={16} />
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Sons Alternativos
                </h3>
                <Button
                  onClick={() => playSound("Som Simples", playSimpleCashSound)}
                  variant={lastPlayed === "Som Simples" ? "default" : "outline"}
                  className="w-full"
                >
                  <Volume2 className="mr-2" size={20} />
                  Som Simples (Ding)
                  {lastPlayed === "Som Simples" && (
                    <Check className="ml-auto" size={16} />
                  )}
                </Button>

                <Button
                  onClick={() => playSound("Contagem de Dinheiro", playMoneyCountingSound)}
                  variant={lastPlayed === "Contagem de Dinheiro" ? "default" : "outline"}
                  className="w-full"
                >
                  <Volume2 className="mr-2" size={20} />
                  Contagem de Dinheiro
                  {lastPlayed === "Contagem de Dinheiro" && (
                    <Check className="ml-auto" size={16} />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-info/10 border-info/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Volume2 className="text-info mt-1" size={20} />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-info">Como funciona:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• O som toca automaticamente ao registrar uma venda</li>
                    <li>• Simula uma caixa registradora real com sino e gaveta</li>
                    <li>• Pode ser desabilitado nas configurações</li>
                    <li>• Usa Web Audio API (não precisa de arquivos externos)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <VolumeX className="text-warning mt-1" size={20} />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-warning">Não está ouvindo?</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Verifique se o volume do dispositivo está ligado</li>
                    <li>• Alguns navegadores bloqueiam sons automáticos</li>
                    <li>• Clique em qualquer botão primeiro para permitir áudio</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}