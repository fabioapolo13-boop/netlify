# 📊 Gerenciador de Notas Fiscais NFS-e

Sistema web completo para cadastro de empresas e consulta de notas fiscais eletrônicas via API do Emissor Nacional NFS-e.

## 🚀 Como Publicar e Usar (Para Leigos)

### Opção 1: Publicar no Netlify (RECOMENDADO - Grátis e Fácil)

1. **Acesse o site do Netlify**
   - Vá para: https://www.netlify.com
   - Clique em "Sign up" (Cadastrar)
   - Crie uma conta gratuita (pode usar Google ou GitHub)

2. **Faça upload do arquivo**
   - Após fazer login, você verá uma área escrita "Want to deploy a new site without connecting to Git?"
   - Arraste o arquivo `index.html` para essa área
   - OU clique em "Browse to upload" e selecione o arquivo

3. **Pronto! Seu site está no ar!**
   - O Netlify vai gerar uma URL como: `https://nome-aleatorio-123.netlify.app`
   - Você pode personalizar esse nome nas configurações
   - Compartilhe essa URL com quem precisar acessar o sistema

### Opção 2: Publicar no Vercel (Também Grátis)

1. **Acesse o Vercel**
   - Vá para: https://vercel.com
   - Clique em "Sign Up" e crie uma conta gratuita

2. **Fazer deploy**
   - Clique em "Add New Project"
   - Arraste o arquivo `index.html` ou faça upload
   - Clique em "Deploy"

3. **Acesse seu site**
   - Vercel vai gerar uma URL automática
   - Seu sistema estará disponível em segundos!

### Opção 3: Usar Localmente (Sem publicar)

1. **Simplesmente abra o arquivo**
   - Localize o arquivo `index.html` no seu computador
   - Dê duplo clique nele
   - O navegador vai abrir automaticamente
   - Pronto! O sistema já está funcionando

## 📱 Como Usar o Sistema

### 1. Cadastrar uma Empresa

1. Digite o CNPJ no campo (exemplo: 00.000.000/0000-00)
2. Clique em "🔍 Buscar Dados da Empresa"
3. O sistema vai buscar os dados automaticamente na API da BrasilAPI
4. Revise os dados e clique em "💾 Salvar Empresa"

**Dica:** Se o CNPJ não for encontrado, você pode preencher manualmente!

### 2. Consultar Notas Fiscais

1. Na seção "Empresas Cadastradas", clique em "📥 Ver Notas" da empresa desejada
2. Selecione o mês/ano que deseja consultar
3. Clique em "📥 Buscar Notas"
4. As notas serão exibidas em uma tabela com:
   - Número da nota
   - Data de emissão
   - Tomador do serviço
   - Valores
   - Status
5. No final da tabela, veja o **total** das notas do período
6. Clique em "👁️ Ver" para ver detalhes completos de cada nota

### 3. Gerenciar Empresas

- **Ver detalhes:** Todos os dados cadastrados aparecem nos cards
- **Excluir empresa:** Clique no botão "🗑️ Excluir"
- **Todos os dados ficam salvos no navegador!**

## ⚙️ Configuração da API Real do Emissor Nacional

**IMPORTANTE:** Atualmente o sistema usa dados simulados para demonstração. Para integração real com a API do Emissor Nacional NFS-e, você precisará:

### Requisitos:

1. **Certificado Digital A1 ou A3**
   - Necessário para autenticação na API
   - Pode ser obtido junto a uma Autoridade Certificadora

2. **Credenciais de Acesso**
   - Solicitar acesso ao ambiente do Emissor Nacional
   - Obter autorização do município conveniado

3. **Endpoints da API:**
   - Produção: `https://adn.nfse.gov.br`
   - Homologação: `https://adn.producaorestrita.nfse.gov.br`

### Como Integrar a API Real:

Edite o arquivo `index.html`, localize a função `simularConsultaNotas` (linha ~450) e substitua por:

```javascript
async function buscarNotasReais(cnpj, mesAno) {
    const [ano, mes] = mesAno.split('-');
    
    // Configurar headers com certificado
    const headers = {
        'Content-Type': 'application/json',
        // Adicionar autenticação com certificado digital aqui
    };
    
    // Endpoint real da API
    const url = `https://adn.nfse.gov.br/api/v1/nfse?cnpj=${cnpj}&mes=${mes}&ano=${ano}`;
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        throw new Error('Erro ao consultar API');
    }
    
    return await response.json();
}
```

## 🔒 Segurança e Privacidade

- ✅ Todos os dados ficam armazenados **localmente** no navegador
- ✅ Nenhuma informação é enviada para servidores externos (exceto consulta CNPJ)
- ✅ Use HTTPS quando publicar (Netlify e Vercel fazem isso automaticamente)
- ✅ Para produção, implemente autenticação de usuários

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura
- **CSS3** - Estilização moderna e responsiva
- **JavaScript** - Lógica e interatividade
- **LocalStorage** - Armazenamento local de dados
- **BrasilAPI** - Consulta automática de CNPJs

## 📋 Funcionalidades

✅ Busca automática de dados por CNPJ
✅ Cadastro e gestão de múltiplas empresas
✅ Consulta de notas fiscais por período
✅ Visualização detalhada de cada nota
✅ Cálculo automático de totais
✅ Filtro por mês/ano
✅ Interface responsiva (funciona em celular)
✅ Design moderno e intuitivo
✅ Armazenamento local (sem necessidade de banco de dados)

## 🆘 Suporte e Dúvidas

### Problemas Comuns:

**P: O CNPJ não é encontrado automaticamente**
R: Você pode preencher os dados manualmente no formulário que aparece.

**P: As notas não aparecem**
R: Atualmente usa dados simulados. Para dados reais, configure a API conforme instruções acima.

**P: Os dados sumiram**
R: Os dados ficam no navegador. Se limpar o cache, eles são apagados. Não use modo anônimo.

**P: Não consigo publicar**
R: Siga o passo a passo do Netlify ou Vercel. Ambos são gratuitos e muito simples!

## 📞 Suporte Técnico

Para integração profissional com a API do Emissor Nacional NFS-e, recomenda-se:
- Consultar a documentação oficial em: https://www.gov.br/nfse
- Contratar desenvolvedor especializado em integrações fiscais
- Verificar requisitos específicos do seu município

## 📄 Licença

Este sistema é fornecido como está, sem garantias. Use por sua conta e risco.

---

**Desenvolvido para facilitar a gestão de notas fiscais eletrônicas** 🚀

*Versão 1.0 - Fevereiro 2026*
