import { AlertTriangle } from "lucide-react";

export default function DemoWarning() {
  return (
    <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="text-warning text-xl mt-0.5" size={20} />
      <div>
        <h3 className="font-semibold text-primary-light mb-1">Modo Demonstração</h3>
        <p className="text-secondary-light">Para usar todas as funcionalidades, configure o Supabase clicando em "Connect to Supabase" no canto superior direito.</p>
      </div>
    </div>
  );
}