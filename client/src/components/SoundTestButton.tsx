import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { playCashRegisterSound, playSimpleCashSound, playMoneyCountingSound } from "@/utils/sound-effects";

export default function SoundTestButton() {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => playCashRegisterSound()}
        className="flex items-center gap-2"
      >
        <Volume2 size={16} />
        Som Completo
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => playSimpleCashSound()}
        className="flex items-center gap-2"
      >
        <Volume2 size={16} />
        Som Simples
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => playMoneyCountingSound()}
        className="flex items-center gap-2"
      >
        <Volume2 size={16} />
        Som Contagem
      </Button>
    </div>
  );
}