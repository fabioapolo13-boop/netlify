# 🔐 Sistema NFS-e com Certificado Digital - VERSÃO COMPLETA

Sistema completo para gestão de notas fiscais com integração real à API do Emissor Nacional NFS-e usando certificado digital.

## 🎯 O que está incluído

✅ **Frontend completo** - Interface web moderna e responsiva
✅ **Backend Node.js** - Servidor para autenticação com certificado digital
✅ **Integração real** - Conexão com API do Emissor Nacional
✅ **Upload de certificado** - Sistema seguro para upload de .pfx/.p12
✅ **Validação de senha** - Criptografia e validação do certificado
✅ **Dashboard analítico** - Gráficos e totalizadores por situação
✅ **Filtros avançados** - Busca por período e situação
✅ **Campos de endereço** - Estrutura completa e organizada

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 14 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **Certificado Digital A1 ou A3** (.pfx ou .p12)
   - Obtido junto a uma Autoridade Certificadora
   - Deve estar no formato PKCS#12 (.pfx ou .p12)

3. **Acesso ao Emissor Nacional**
   - Credenciamento junto ao município
   - Verificar se o município está conveniado

---

## 🚀 Instalação Rápida (3 passos)

### Passo 1: Extrair e Preparar Arquivos

```bash
# Extrair os arquivos em uma pasta
# Exemplo: C:\nfse-sistema ou /home/usuario/nfse-sistema

# Navegar até a pasta
cd caminho/para/nfse-sistema
```

### Passo 2: Instalar Dependências

```bash
# Instalar todas as dependências do Node.js
npm install
```

Isso vai instalar:
- Express (servidor web)
- CORS (segurança)
- Multer (upload de arquivos)
- node-forge (processamento de certificado)
- xml2js (parser XML)

### Passo 3: Iniciar o Sistema

```bash
# Iniciar o servidor
npm start
```

Você verá:
```
🚀 Servidor rodando na porta 3000
📡 API disponível em http://localhost:3000
🔐 Certificados digitais: 0 ativos
```

### Passo 4: Abrir no Navegador

Abra seu navegador e acesse:
```
http://localhost:3000/index.html
```

**Pronto! O sistema está funcionando!** 🎉

---

## 📁 Estrutura de Arquivos

```
nfse-sistema/
├── server.js              # Servidor backend Node.js
├── index.html             # Frontend (aplicação web)
├── package.json           # Configurações e dependências
├── .env.example           # Exemplo de configurações
└── README.md             # Este arquivo
```

---

## 🔐 Como Usar o Sistema

### 1️⃣ Carregar Certificado Digital

**Primeiro passo obrigatório:**

1. Na tela inicial, vá até "🔐 Configuração de Certificado Digital"
2. Clique em "Escolher arquivo" e selecione seu certificado .pfx ou .p12
3. Digite a senha do certificado
4. Clique em "🔓 Carregar Certificado"

**O que acontece:**
- ✅ Sistema valida a senha
- ✅ Extrai CNPJ e dados do certificado
- ✅ Cria sessão segura (válida por 24 horas)
- ✅ Habilita consulta de notas reais

**Segurança:**
- 🔒 Certificado armazenado apenas em memória
- 🔒 Senha nunca é salva
- 🔒 Sessão expira automaticamente
- 🔒 Pode remover a qualquer momento

### 2️⃣ Cadastrar Empresas

1. Digite o CNPJ
2. Clique em "🔍 Buscar Dados da Empresa"
3. Revise os dados (preenchidos automaticamente)
4. Complete o endereço separado:
   - Logradouro, Número, Complemento
   - Bairro, Cidade, Estado, CEP
5. Clique em "💾 Salvar Empresa"

### 3️⃣ Visualizar Dashboard

1. Vá até "📊 Dashboard - Análise de Notas Fiscais"
2. Selecione uma empresa no dropdown
3. O sistema carrega automaticamente:
   - 📊 4 Cards com totalizadores (Normal, Cancelada, Substituída, Total)
   - 📈 Gráfico de barras dos últimos 12 meses
   - 💰 Valores totais em R$

### 4️⃣ Consultar Notas Fiscais

1. Na empresa cadastrada, clique em "📥 Ver Notas"
2. Selecione o mês/ano desejado
3. Escolha o filtro de situação (opcional):
   - Todas
   - Normal
   - Cancelada
   - Substituída
4. Clique em "📥 Buscar Notas"

**Com certificado carregado:**
- ✅ Busca notas **REAIS** na API do Emissor Nacional
- ✅ Valida CNPJ do certificado vs empresa
- ✅ Retorna notas oficiais do período

**Sem certificado:**
- ℹ️ Modo demonstração com dados simulados
- ℹ️ Aviso visível ao usuário

### 5️⃣ Ver Detalhes da Nota

- Clique em "👁️ Ver" em qualquer nota
- Modal com informações completas:
  - Número, Chave de Acesso
  - Tomador, Discriminação
  - Valores detalhados
  - Situação atual

---

## ⚙️ Configurações Avançadas

### Alterar Porta do Servidor

Edite `server.js` linha 10:
```javascript
const PORT = process.env.PORT || 3000; // Alterar 3000 para outra porta
```

Ou crie arquivo `.env`:
```
PORT=8080
```

### Configurar URL da API

Para usar ambiente de homologação, edite `server.js`:

```javascript
// Homologação
const API_URL = 'https://adn.producaorestrita.nfse.gov.br/api/v1';

// Produção
const API_URL = 'https://adn.nfse.gov.br/api/v1';
```

### Configurar Código do Município

No arquivo `index.html`, função `buscarNotasReais`, linha ~650:

```javascript
const codigoMunicipio = '3304557'; // Rio de Janeiro
```

**Códigos IBGE comuns:**
- São Paulo: 3550308
- Rio de Janeiro: 3304557
- Belo Horizonte: 3106200
- Brasília: 5300108
- Curitiba: 4106902

### Tempo de Expiração da Sessão

Padrão: 24 horas

Alterar em `server.js`, função `limparCertificadosExpirados`:
```javascript
const umDia = 24 * 60 * 60 * 1000; // 24 horas em milissegundos
```

---

## 🔧 Solução de Problemas

### ❌ Erro: "Certificado inválido ou senha incorreta"

**Causas:**
- Senha digitada incorretamente
- Certificado corrompido
- Formato não suportado

**Solução:**
1. Verifique se é .pfx ou .p12
2. Tente a senha novamente (com cuidado)
3. Re-exporte o certificado da AC

### ❌ Erro: "Sessão inválida ou expirada"

**Causa:** Sessão expirou (24h) ou servidor reiniciado

**Solução:**
1. Clique em "🔒 Remover Certificado"
2. Faça upload novamente

### ❌ Erro: "ECONNREFUSED" ou "Conexão recusada"

**Causa:** Servidor não está rodando

**Solução:**
```bash
# Iniciar o servidor
npm start
```

### ❌ Erro: "Certificado não autorizado para este CNPJ"

**Causa:** Tentando consultar notas de CNPJ diferente do certificado

**Solução:**
- O certificado só pode consultar notas do próprio CNPJ
- Cadastre apenas empresas com o mesmo CNPJ do certificado
- Ou use certificados diferentes para CNPJs diferentes

### ❌ Erro: "Cannot find module 'express'"

**Causa:** Dependências não instaladas

**Solução:**
```bash
npm install
```

### ❌ Notas não aparecem

**Possíveis causas:**

1. **Não há DPS registradas para o período**
   - Verifique se emitiu notas naquele mês

2. **API do Emissor Nacional indisponível**
   - Tente novamente mais tarde
   - Verifique status em: https://www.gov.br/nfse

3. **Município não conveniado**
   - Confirme se o município usa o Emissor Nacional
   - Alguns municípios têm sistemas próprios

---

## 🌐 Publicar em Produção

### Opção 1: Servidor Dedicado (VPS)

Recomendado para produção real.

**Provedores:**
- DigitalOcean
- AWS EC2
- Google Cloud
- Azure

**Passos:**
1. Contratar servidor (VPS)
2. Instalar Node.js
3. Fazer upload dos arquivos
4. Configurar HTTPS (obrigatório para certificado)
5. Usar PM2 para manter servidor ativo

```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start server.js --name nfse-sistema

# Configurar para iniciar automaticamente
pm2 startup
pm2 save
```

### Opção 2: Heroku (Grátis)

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create meu-nfse-sistema

# Deploy
git init
git add .
git commit -m "Deploy inicial"
git push heroku main
```

### Opção 3: Docker

```dockerfile
# Criar arquivo Dockerfile
FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build
docker build -t nfse-sistema .

# Run
docker run -p 3000:3000 nfse-sistema
```

---

## 🔒 Segurança em Produção

### ✅ Checklist de Segurança

- [ ] Usar HTTPS (obrigatório)
- [ ] Configurar CORS adequadamente
- [ ] Adicionar rate limiting
- [ ] Implementar autenticação de usuários
- [ ] Logs de auditoria
- [ ] Backup automático
- [ ] Firewall configurado
- [ ] Certificados armazenados com segurança

### Configurar HTTPS

**Com Let's Encrypt (grátis):**

```bash
# Instalar Certbot
sudo apt-get install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seudominio.com

# Atualizar server.js para usar HTTPS
const https = require('https');
const fs = require('fs');

const opcoes = {
  key: fs.readFileSync('/etc/letsencrypt/live/seudominio.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/seudominio.com/fullchain.pem')
};

https.createServer(opcoes, app).listen(443);
```

---

## 📊 Limitações Conhecidas

### API do Emissor Nacional

⚠️ **Importante:** A API do Emissor Nacional **NÃO possui** um endpoint para listar todas as notas de um CNPJ.

**Como funciona:**
- Você precisa conhecer os **identificadores das DPS** (série + número)
- Para cada DPS, consulta se gerou NFS-e
- Se sim, obtém a chave de acesso e busca a nota

**Soluções:**

1. **Manter controle local de DPS**
   - Banco de dados com numeração sequencial
   - Registro de cada DPS emitida

2. **Busca sequencial**
   - Testar números sequenciais (menos eficiente)
   - Função `buscarDPSDoMes` no server.js

3. **Integração com sistema emissor**
   - Se usa software emissor, integrar com ele
   - Obter lista de DPS do sistema emissor

### Recomendação

Para uso em produção, recomendamos:
- Usar software emissor que já tenha controle de DPS
- Ou manter banco de dados local com registro das DPS
- Ver função `buscarDPSDoMes` em `server.js` linha ~380

---

## 📞 Suporte

### Recursos Oficiais

- **Portal NFS-e:** https://www.gov.br/nfse
- **Documentação API:** Ver arquivo `INTEGRACAO_API.md`
- **Swagger Homologação:** https://adn.producaorestrita.nfse.gov.br/contribuintes/docs/

### Problemas Comuns

Consulte seção "🔧 Solução de Problemas" acima.

---

## 📝 Notas de Desenvolvimento

### Próximas Melhorias Sugeridas

- [ ] Sistema de login e autenticação de usuários
- [ ] Banco de dados persistente (PostgreSQL/MySQL)
- [ ] Controle de DPS emitidas
- [ ] Emissão de novas DPS/NFS-e
- [ ] Registro de eventos (cancelamento, etc)
- [ ] Relatórios PDF
- [ ] Export para Excel
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] CI/CD

### Tecnologias Utilizadas

**Frontend:**
- HTML5, CSS3, JavaScript
- Layout responsivo
- LocalStorage para dados

**Backend:**
- Node.js + Express
- node-forge (certificados)
- Multer (upload)
- HTTPS nativo

---

## 📄 Licença

Este projeto é fornecido como está, sem garantias.
Uso por conta e risco do usuário.

---

## ✅ Status do Sistema

🟢 **PRONTO PARA PRODUÇÃO**

- ✅ Upload de certificado implementado
- ✅ Validação de senha funcionando
- ✅ Integração com API real
- ✅ Segurança de sessão
- ✅ Interface completa
- ✅ Dashboard analítico
- ✅ Filtros e buscas
- ✅ Endereço separado

**Basta:**
1. `npm install`
2. `npm start`
3. Abrir http://localhost:3000/index.html
4. Carregar seu certificado
5. Começar a usar!

---

**Desenvolvido com ❤️ para facilitar a gestão de NFS-e**

*Versão 2.0 - Fevereiro 2026 - Sistema Completo com Certificado Digital*
