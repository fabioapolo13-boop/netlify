// server.js - Servidor Backend para integração com API Emissor Nacional NFS-e
const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const multer = require('multer');
const forge = require('node-forge');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazenamento temporário de certificados em memória (por sessão)
const certificadosAtivos = new Map();

// Configuração do multer para upload de certificado
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.pfx') || file.originalname.endsWith('.p12')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos .pfx ou .p12 são permitidos'));
        }
    }
});

// ============================================================================
// ENDPOINT: Upload e validação de certificado digital
// ============================================================================
app.post('/api/certificado/upload', upload.single('certificado'), async (req, res) => {
    try {
        const { senha } = req.body;
        const certificadoBuffer = req.file.buffer;

        // Validar certificado com a senha
        const certificadoValido = validarCertificado(certificadoBuffer, senha);
        
        if (!certificadoValido.valido) {
            return res.status(400).json({ 
                erro: certificadoValido.erro || 'Certificado inválido ou senha incorreta' 
            });
        }

        // Gerar ID de sessão único
        const sessaoId = gerarIdSessao();

        // Armazenar certificado em memória (temporário)
        certificadosAtivos.set(sessaoId, {
            buffer: certificadoBuffer,
            senha: senha,
            cnpj: certificadoValido.cnpj,
            nome: certificadoValido.nome,
            validade: certificadoValido.validade,
            timestamp: Date.now()
        });

        // Limpar certificados antigos (mais de 24h)
        limparCertificadosExpirados();

        res.json({
            sucesso: true,
            sessaoId: sessaoId,
            certificado: {
                cnpj: certificadoValido.cnpj,
                nome: certificadoValido.nome,
                validade: certificadoValido.validade
            }
        });

    } catch (error) {
        console.error('Erro ao processar certificado:', error);
        res.status(500).json({ erro: 'Erro ao processar certificado: ' + error.message });
    }
});

// ============================================================================
// ENDPOINT: Buscar parâmetros municipais
// ============================================================================
app.get('/api/parametros/:codigoMunicipio/convenio', async (req, res) => {
    try {
        const { codigoMunicipio } = req.params;
        const sessaoId = req.headers['x-sessao-id'];

        const certificado = certificadosAtivos.get(sessaoId);
        if (!certificado) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça upload do certificado novamente.' });
        }

        const url = `https://adn.nfse.gov.br/api/v1/parametros_municipais/${codigoMunicipio}/convenio`;
        
        const resultado = await fazerRequisicaoAPI(url, 'GET', null, certificado);
        
        res.json(resultado);

    } catch (error) {
        console.error('Erro ao buscar parâmetros municipais:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ============================================================================
// ENDPOINT: Buscar notas fiscais por CNPJ e período
// ============================================================================
app.post('/api/notas/buscar', async (req, res) => {
    try {
        const { cnpj, mes, ano, codigoMunicipio } = req.body;
        const sessaoId = req.headers['x-sessao-id'];

        const certificado = certificadosAtivos.get(sessaoId);
        if (!certificado) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça upload do certificado novamente.' });
        }

        // Validar se o CNPJ do certificado corresponde ao CNPJ consultado
        if (certificado.cnpj !== cnpj.replace(/\D/g, '')) {
            return res.status(403).json({ 
                erro: 'O CNPJ do certificado não corresponde ao CNPJ da consulta' 
            });
        }

        // IMPORTANTE: A API do Emissor Nacional não possui endpoint direto para listar todas as notas
        // É necessário conhecer os identificadores das DPS para buscar as NFS-e correspondentes
        // Aqui está uma estratégia de busca:

        const notas = [];
        
        // Estratégia 1: Buscar por intervalo de DPS conhecidas
        // Você deve ter um controle das DPS emitidas (série + número)
        // Exemplo: buscar as últimas 100 DPS do mês
        
        const serie = '00001'; // Configurar série da empresa
        const dataInicio = new Date(ano, mes - 1, 1);
        const dataFim = new Date(ano, mes, 0);
        
        // Buscar DPS conhecidas ou estimar intervalo
        const dpsList = await buscarDPSDoMes(cnpj, serie, mes, ano);
        
        for (const dps of dpsList) {
            try {
                // Construir ID da DPS
                const idDPS = construirIdDPS(codigoMunicipio, cnpj, serie, dps.numero);
                
                // Buscar chave de acesso da NFS-e
                const chaveAcesso = await buscarChaveAcessoPorDPS(idDPS, certificado);
                
                if (chaveAcesso) {
                    // Buscar dados completos da NFS-e
                    const nfse = await buscarNFSe(chaveAcesso, certificado);
                    
                    if (nfse) {
                        notas.push(nfse);
                    }
                }
            } catch (error) {
                // DPS não gerou NFS-e ainda ou não existe
                console.log(`DPS ${dps.numero} não encontrada`);
            }
        }

        res.json({
            sucesso: true,
            quantidade: notas.length,
            notas: notas
        });

    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ============================================================================
// ENDPOINT: Consultar NFS-e por chave de acesso
// ============================================================================
app.get('/api/nfse/:chaveAcesso', async (req, res) => {
    try {
        const { chaveAcesso } = req.params;
        const sessaoId = req.headers['x-sessao-id'];

        const certificado = certificadosAtivos.get(sessaoId);
        if (!certificado) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
        }

        const nfse = await buscarNFSe(chaveAcesso, certificado);
        
        res.json(nfse);

    } catch (error) {
        console.error('Erro ao consultar NFS-e:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ============================================================================
// ENDPOINT: Consultar eventos de uma NFS-e
// ============================================================================
app.get('/api/nfse/:chaveAcesso/eventos', async (req, res) => {
    try {
        const { chaveAcesso } = req.params;
        const sessaoId = req.headers['x-sessao-id'];

        const certificado = certificadosAtivos.get(sessaoId);
        if (!certificado) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada' });
        }

        const url = `https://adn.nfse.gov.br/api/v1/nfse/${chaveAcesso}/eventos`;
        const eventos = await fazerRequisicaoAPI(url, 'GET', null, certificado);
        
        res.json(eventos);

    } catch (error) {
        console.error('Erro ao consultar eventos:', error);
        res.status(500).json({ erro: error.message });
    }
});

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function validarCertificado(certificadoBuffer, senha) {
    try {
        // Converter buffer para base64
        const p12B64 = certificadoBuffer.toString('base64');
        
        // Decodificar PKCS#12
        const p12Der = forge.util.decode64(p12B64);
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        
        // Descriptografar com senha
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);
        
        // Extrair certificado
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const cert = certBags[forge.pki.oids.certBag][0].cert;
        
        // Validar validade
        const agora = new Date();
        if (agora < cert.validity.notBefore || agora > cert.validity.notAfter) {
            return { valido: false, erro: 'Certificado fora do prazo de validade' };
        }
        
        // Extrair CNPJ do certificado
        const cnpj = extrairCNPJDoCertificado(cert);
        const nome = cert.subject.getField('CN').value;
        
        return {
            valido: true,
            cnpj: cnpj,
            nome: nome,
            validade: cert.validity.notAfter.toISOString()
        };
        
    } catch (error) {
        return { valido: false, erro: 'Senha incorreta ou certificado inválido' };
    }
}

function extrairCNPJDoCertificado(cert) {
    // O CNPJ geralmente está no campo CN ou em extensões
    const cn = cert.subject.getField('CN').value;
    
    // Extrair CNPJ do CN (formato pode variar)
    const cnpjMatch = cn.match(/\d{14}/);
    if (cnpjMatch) {
        return cnpjMatch[0];
    }
    
    // Tentar extrair de outras fontes
    // Pode estar em subject alternative name ou outras extensões
    return null;
}

async function fazerRequisicaoAPI(url, metodo, corpo, certificado) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: metodo,
            pfx: certificado.buffer,
            passphrase: certificado.senha,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (corpo && metodo !== 'GET') {
            const bodyString = JSON.stringify(corpo);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const resultado = JSON.parse(data);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(resultado);
                    } else {
                        reject(new Error(resultado.mensagem || `Erro HTTP ${res.statusCode}`));
                    }
                } catch (error) {
                    reject(new Error('Resposta inválida da API'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (corpo && metodo !== 'GET') {
            req.write(JSON.stringify(corpo));
        }

        req.end();
    });
}

function construirIdDPS(codigoMunicipio, cnpj, serie, numero) {
    const municipio = codigoMunicipio.padStart(7, '0');
    const tipoInscricao = '2'; // 1=CPF, 2=CNPJ
    const inscricaoFederal = cnpj.replace(/\D/g, '').padStart(14, '0');
    const serieDPS = serie.padStart(5, '0');
    const numeroDPS = numero.toString().padStart(15, '0');
    
    return `${municipio}${tipoInscricao}${inscricaoFederal}${serieDPS}${numeroDPS}`;
}

async function buscarChaveAcessoPorDPS(idDPS, certificado) {
    const url = `https://adn.nfse.gov.br/api/v1/dps/${idDPS}`;
    
    try {
        const resultado = await fazerRequisicaoAPI(url, 'GET', null, certificado);
        return resultado.chaveAcesso;
    } catch (error) {
        return null;
    }
}

async function buscarNFSe(chaveAcesso, certificado) {
    const url = `https://adn.nfse.gov.br/api/v1/nfse/${chaveAcesso}`;
    
    try {
        const nfse = await fazerRequisicaoAPI(url, 'GET', null, certificado);
        
        // Processar XML e extrair dados relevantes
        return processarNFSeXML(nfse);
    } catch (error) {
        throw error;
    }
}

function processarNFSeXML(nfseData) {
    // A API retorna XML, processar para extrair informações
    // Aqui você deve usar um parser XML (como xml2js)
    // Por simplicidade, assumindo que a API já retorna JSON
    
    return {
        numero: nfseData.numero,
        chaveAcesso: nfseData.chaveAcesso,
        dataEmissao: nfseData.dataEmissao,
        valorServicos: nfseData.valorServicos,
        valorDeducoes: nfseData.valorDeducoes,
        valorLiquido: nfseData.valorLiquido,
        situacao: nfseData.situacao,
        tomador: nfseData.tomador,
        discriminacao: nfseData.discriminacao
    };
}

async function buscarDPSDoMes(cnpj, serie, mes, ano) {
    // Esta função deve consultar seu banco de dados local ou sistema de controle
    // para listar as DPS que foram emitidas no mês
    
    // Exemplo de retorno:
    const dpsList = [];
    
    // IMPORTANTE: Você precisa ter um controle das DPS emitidas
    // Opções:
    // 1. Banco de dados local com registro das DPS
    // 2. Sistema de gestão que controla numeração
    // 3. Busca sequencial (menos eficiente)
    
    // Para demonstração, retornando lista vazia
    // Na produção, implementar busca real
    
    return dpsList;
}

function gerarIdSessao() {
    return require('crypto').randomBytes(32).toString('hex');
}

function limparCertificadosExpirados() {
    const agora = Date.now();
    const umDia = 24 * 60 * 60 * 1000;
    
    for (const [id, cert] of certificadosAtivos.entries()) {
        if (agora - cert.timestamp > umDia) {
            certificadosAtivos.delete(id);
        }
    }
}

// ============================================================================
// INICIAR SERVIDOR
// ============================================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API disponível em http://localhost:${PORT}`);
    console.log(`🔐 Certificados digitais: ${certificadosAtivos.size} ativos`);
});

// Limpar certificados a cada hora
setInterval(limparCertificadosExpirados, 60 * 60 * 1000);
