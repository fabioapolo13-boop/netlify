# 🔧 Guia Técnico de Integração - API Emissor Nacional NFS-e

## 📚 Documentação da API

Baseado no manual fornecido, estas são as principais APIs disponíveis:

### 1. API Parâmetros Municipais

**Base URL:** `https://adn.nfse.gov.br/api/v1`

#### Endpoints:

```
GET /parametros_municipais/{codigoMunicipio}/convenio
GET /parametros_municipais/{codigoMunicipio}/{codigoServico}
GET /parametros_municipais/{codigoMunicipio}/{CPF_CNPJ}
```

### 2. API NFS-e

#### Gerar NFS-e:
```
POST /nfse
Content-Type: application/json

Body: DPS em formato XML
```

#### Consultar NFS-e:
```
GET /nfse/{chaveAcesso}
```

### 3. API DPS

#### Recuperar chave de acesso:
```
GET /dps/{id}
```

Formato do ID: 
- Código IBGE Município (7 dígitos)
- Tipo de Inscrição (1 dígito)
- Inscrição Federal (14 dígitos - CPF com 000 à esquerda)
- Série DPS (5 dígitos)
- Número DPS (15 dígitos)

#### Verificar se NFS-e foi gerada:
```
HEAD /dps/{id}
```

### 4. API Eventos

#### Registrar evento:
```
POST /nfse/{chaveAcesso}/eventos
```

#### Consultar eventos:
```
GET /nfse/{chaveAcesso}/eventos
GET /nfse/{chaveAcesso}/eventos/{tipoEvento}
GET /nfse/{chaveAcesso}/eventos/{tipoEvento}/{numSeqEvento}
```

## 🔐 Autenticação

A API requer **certificado digital** (A1 ou A3) para autenticação.

### Implementação com JavaScript (Node.js backend necessário):

```javascript
const https = require('https');
const fs = require('fs');

// Carregar certificado
const cert = fs.readFileSync('caminho/para/certificado.pfx');

const options = {
  hostname: 'adn.nfse.gov.br',
  port: 443,
  path: '/api/v1/nfse',
  method: 'GET',
  pfx: cert,
  passphrase: 'senha_do_certificado'
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});

req.end();
```

## 📝 Exemplo: Consultar Notas de um CNPJ

### Passo 1: Obter parâmetros do município

```javascript
async function obterParametrosMunicipio(codigoMunicipio) {
  const response = await fetch(
    `https://adn.nfse.gov.br/api/v1/parametros_municipais/${codigoMunicipio}/convenio`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Certificado digital deve ser configurado aqui
    }
  );
  
  return await response.json();
}
```

### Passo 2: Construir identificador DPS

```javascript
function construirIdDPS(cnpj, municipio, serie, numero) {
  const codigoMunicipio = municipio.padStart(7, '0');
  const tipoInscricao = '2'; // 1=CPF, 2=CNPJ
  const inscricaoFederal = cnpj.padStart(14, '0');
  const serieDPS = serie.padStart(5, '0');
  const numeroDPS = numero.padStart(15, '0');
  
  return `${codigoMunicipio}${tipoInscricao}${inscricaoFederal}${serieDPS}${numeroDPS}`;
}
```

### Passo 3: Consultar NFS-e pela DPS

```javascript
async function consultarNFSePorDPS(idDPS) {
  const response = await fetch(
    `https://adn.nfse.gov.br/api/v1/dps/${idDPS}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (response.ok) {
    const data = await response.json();
    return data.chaveAcesso;
  }
  
  throw new Error('DPS não encontrada');
}
```

### Passo 4: Consultar detalhes da NFS-e

```javascript
async function consultarNFSe(chaveAcesso) {
  const response = await fetch(
    `https://adn.nfse.gov.br/api/v1/nfse/${chaveAcesso}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
}
```

## 🔄 Fluxo Completo de Integração

```javascript
async function buscarNotasFiscais(cnpj, mes, ano) {
  try {
    // 1. Obter código do município do prestador
    const codigoMunicipio = await obterMunicipioPorCNPJ(cnpj);
    
    // 2. Verificar parâmetros do município
    const parametros = await obterParametrosMunicipio(codigoMunicipio);
    
    // 3. Listar DPS do período (você precisa ter esse controle)
    const listaDPS = obterDPSCadastradas(cnpj, mes, ano);
    
    // 4. Para cada DPS, consultar a NFS-e
    const notas = [];
    for (const dps of listaDPS) {
      const idDPS = construirIdDPS(
        cnpj, 
        codigoMunicipio, 
        dps.serie, 
        dps.numero
      );
      
      try {
        const chaveAcesso = await consultarNFSePorDPS(idDPS);
        const nfse = await consultarNFSe(chaveAcesso);
        notas.push(nfse);
      } catch (error) {
        console.log(`DPS ${idDPS} não gerou NFS-e ainda`);
      }
    }
    
    return notas;
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    throw error;
  }
}
```

## ⚠️ Limitações e Considerações

### 1. **Certificado Digital**
   - OBRIGATÓRIO para todas as operações
   - Não funciona diretamente no frontend (navegador)
   - Necessário criar um backend (Node.js, PHP, Python, etc.)

### 2. **CORS**
   - APIs governamentais geralmente não permitem chamadas diretas do navegador
   - Solução: criar API intermediária no seu servidor

### 3. **Controle de DPS**
   - A API não lista todas as notas de um CNPJ automaticamente
   - Você precisa ter controle das DPS emitidas
   - Alternativa: consultar pelo banco de dados do sistema emissor

## 🏗️ Arquitetura Recomendada

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Frontend   │────────▶│   Backend    │────────▶│ API Emissor     │
│  (Browser)  │         │  (Seu Server)│         │    Nacional     │
└─────────────┘         └──────────────┘         └─────────────────┘
                              │
                              │ Certificado
                              │ Digital A1/A3
                              ▼
                        ┌──────────────┐
                        │  Certificado │
                        │    .pfx      │
                        └──────────────┘
```

## 🔧 Exemplo de Backend (Node.js + Express)

```javascript
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

// Configurar certificado
const cert = fs.readFileSync('./certificado.pfx');
const certPassword = process.env.CERT_PASSWORD;

// Endpoint para consultar notas
app.get('/api/notas/:cnpj/:mes/:ano', async (req, res) => {
  const { cnpj, mes, ano } = req.params;
  
  try {
    // Fazer chamada à API do Emissor Nacional com certificado
    const notas = await consultarAPIEmissorNacional(cnpj, mes, ano);
    res.json(notas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});
```

## 📊 Estrutura de Dados - NFS-e

```json
{
  "chaveAcesso": "33240200000000000001234567890123456",
  "numero": "000001",
  "dataEmissao": "2024-01-15T10:30:00",
  "situacao": "Normal",
  "valorServicos": 1000.00,
  "valorDeducoes": 50.00,
  "valorLiquido": 950.00,
  "prestador": {
    "cnpj": "12345678000199",
    "razaoSocial": "Empresa Prestadora LTDA"
  },
  "tomador": {
    "cnpj": "98765432000188",
    "razaoSocial": "Cliente XYZ LTDA"
  },
  "discriminacao": "Serviços de consultoria"
}
```

## 🚀 Próximos Passos

1. **Obter certificado digital** junto a uma AC (Autoridade Certificadora)
2. **Solicitar acesso** ao ambiente do Emissor Nacional
3. **Desenvolver backend** para intermediar as chamadas
4. **Testar em homologação** antes de usar em produção
5. **Implementar tratamento de erros** robusto
6. **Configurar logs** para auditoria

## 📞 Recursos Adicionais

- **Ambiente de Testes:** https://adn.producaorestrita.nfse.gov.br
- **Swagger/Docs:** https://adn.producaorestrita.nfse.gov.br/contribuintes/docs/
- **Portal NFS-e:** https://www.gov.br/nfse

## ⚡ Dica Pro

Para projetos menores ou MVPs, considere usar um **sistema emissor de NFS-e** existente que já tenha API própria, como:
- NFe.io
- Focus NFe
- TecnoSpeed

Estes serviços já lidam com certificados e complexidades da API governamental.

---

**Boa sorte com a integração!** 🎯
