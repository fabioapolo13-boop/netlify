# ⚡ GUIA DE INÍCIO RÁPIDO - 5 MINUTOS

## 🎯 Para Começar AGORA

### Passo 1: Instalar Node.js (se ainda não tiver)
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada)
3. Instale normalmente (next, next, finish)
4. Pronto!

### Passo 2: Extrair os Arquivos
1. Extraia todos os arquivos em uma pasta
2. Exemplo: `C:\meu-nfse` ou `/home/usuario/meu-nfse`

### Passo 3: Abrir o Terminal
**Windows:**
- Aperte `Win + R`
- Digite `cmd` e Enter
- Navegue até a pasta: `cd C:\meu-nfse`

**Mac/Linux:**
- Abra o Terminal
- Navegue até a pasta: `cd /caminho/para/meu-nfse`

### Passo 4: Instalar (apenas 1 vez)
```bash
npm install
```

Aguarde alguns segundos... ☕

### Passo 5: Iniciar
```bash
npm start
```

Verá esta mensagem:
```
🚀 Servidor rodando na porta 3000
📡 API disponível em http://localhost:3000
```

### Passo 6: Abrir no Navegador
```
http://localhost:3000/index.html
```

## ✅ PRONTO! Sistema funcionando!

---

## 🔐 Como Usar (primeiros passos)

### 1. Carregar Certificado
- Seção: "🔐 Configuração de Certificado Digital"
- Escolher arquivo .pfx ou .p12
- Digite a senha
- Clique em "Carregar Certificado"

### 2. Cadastrar Empresa
- Digite o CNPJ
- Clique em "Buscar Dados"
- Revise e salve

### 3. Ver Notas
- Clique em "Ver Notas" na empresa
- Escolha o mês
- Clique em "Buscar Notas"

---

## 🆘 Problemas?

**"npm não é reconhecido"**
→ Node.js não instalado. Volte ao Passo 1.

**"Porta já em uso"**
→ Mude a porta no arquivo server.js linha 10.

**"Certificado inválido"**
→ Verifique a senha do certificado.

---

## 📱 Acesso Remoto

Quer acessar de outro computador/celular?

1. Descubra seu IP local:
   - Windows: `ipconfig`
   - Mac/Linux: `ifconfig`
   - Exemplo: 192.168.1.100

2. Acesse de outro dispositivo:
   ```
   http://192.168.1.100:3000/index.html
   ```

---

## 🚀 Comandos Úteis

**Iniciar o servidor:**
```bash
npm start
```

**Parar o servidor:**
- Pressione `Ctrl + C` no terminal

**Reiniciar após mudanças:**
```bash
Ctrl + C
npm start
```

---

## 💡 Dicas

✅ Mantenha o terminal aberto enquanto usa
✅ Seu certificado expira em 24h (basta carregar de novo)
✅ Dados das empresas ficam salvos no navegador
✅ Use Chrome ou Edge para melhor experiência

---

## 📚 Quer Saber Mais?

Leia o **README_COMPLETO.md** para:
- Configurações avançadas
- Publicar em servidor
- Solução detalhada de problemas
- Segurança em produção

---

**É ISSO! Simples assim! 🎉**

Qualquer dúvida, consulte o README_COMPLETO.md
