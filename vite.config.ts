import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // Aumenta o limite para 1MB
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries - separação mais granular
          if (id.includes('node_modules')) {
            // React e React DOM separados
            if (id.includes('react/') && !id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('react-dom/')) {
              return 'react-dom';
            }
            
            // Bibliotecas de UI grandes
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('recharts')) {
              return 'recharts';
            }
            
            // Bibliotecas de funcionalidade
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            if (id.includes('wouter')) {
              return 'wouter-router';
            }
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            if (id.includes('zod')) {
              return 'zod-validation';
            }
            
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            
            // Outras bibliotecas menores
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
              return 'utils';
            }
            
            // Todas as outras dependências
            return 'vendor';
          }
          
          // Páginas específicas - lazy loading
          if (id.includes('/pages/')) {
            if (id.includes('dashboard')) return 'page-dashboard';
            if (id.includes('admin')) return 'page-admin';
            if (id.includes('clients')) return 'page-clients';
            if (id.includes('attendants')) return 'page-attendants';
            if (id.includes('ranking')) return 'page-ranking';
            if (id.includes('history')) return 'page-history';
            if (id.includes('goals')) return 'page-goals';
            return 'pages';
          }
          
          // Componentes grandes
          if (id.includes('/components/')) {
            if (id.includes('Dashboard')) return 'dashboard-components';
            if (id.includes('ui/')) return 'ui-components';
            if (id.includes('Header') || id.includes('Navigation')) return 'layout-components';
            return 'components';
          }
          
          // Hooks e utilitários
          if (id.includes('/hooks/') || id.includes('/utils/')) {
            return 'utils';
          }
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
