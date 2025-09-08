# 🔧 Solução para Problema de Conectividade

## ❌ **Problema Identificado**
O erro `TypeError: fetch failed` indica que há um bloqueio de rede impedindo a conexão com o Supabase.

## 🛠️ **Soluções Possíveis**

### **Solução 1: Verificar Firewall/Antivírus**
1. **Temporariamente desabilite** o antivírus
2. **Verifique o Windows Firewall**:
   - Abra "Windows Defender Firewall"
   - Clique em "Permitir um aplicativo ou recurso"
   - Verifique se o Node.js está permitido
3. **Teste novamente**:
   ```bash
   node diagnose-supabase.js
   ```

### **Solução 2: Usar Proxy/Configuração de Rede**
Se você está em uma rede corporativa:
1. **Configure proxy** se necessário
2. **Teste em rede diferente** (hotspot do celular)
3. **Verifique configurações de proxy** do sistema

### **Solução 3: Testar no Navegador**
1. **Abra o navegador** e acesse:
   ```
   https://wgxnylsmfvzyhzubzjb.supabase.co/rest/v1/
   ```
2. **Se funcionar no navegador**, o problema é específico do Node.js
3. **Se não funcionar**, é problema de rede geral

### **Solução 4: Usar Conexão Direta PostgreSQL**
Como alternativa, podemos usar conexão direta ao PostgreSQL:

1. **No painel do Supabase**:
   - Vá em Settings > Database
   - Copie a "Connection string"
   - Substitua `[YOUR-PASSWORD]` pela senha real

2. **Execute a migração direta**:
   ```bash
   npm run migrate:supabase-db
   ```

## 🎯 **Recomendação**

**Tente primeiro a Solução 1** (desabilitar antivírus temporariamente) e teste:

```bash
node diagnose-supabase.js
```

Se funcionar, o problema é o antivírus. Se não funcionar, tente as outras soluções.

## 📞 **Se Nada Funcionar**

Podemos:
1. **Migrar manualmente** via painel do Supabase
2. **Usar uma ferramenta externa** como pgAdmin
3. **Configurar em outro ambiente** (outro computador/rede)

---

**🚀 Qual solução você quer tentar primeiro?**
