import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

function parseDate(str) {
  if (!str || str === "Não identificado") return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
  if (isNaN(d.getTime())) return null;
  return d.getTime();
}

function normalizeDiretoria(dir) {
  if (!dir || dir === "Não identificado") return "Não Identificada";
  if (dir.includes("Identificação Civil") || dir.includes("DIRIC") || dir.includes("DIC")) return "Diretoria de Identificação Civil";
  if (dir.includes("Habilitação") || dir.includes("DIRHAB")) return "Diretoria de Habilitação";
  if (dir.includes("Registro de Veículos")) return "Diretoria de Registro de Veículos";
  if (dir.includes("Apoio Operacional")) return "Diretoria de Apoio Operacional";
  if (dir.includes("Tecnologia") || dir.includes("DTIC")) return "Diretoria de Tecnologia da Informação";
  if (dir.includes("Administração") || dir.includes("Finanças")) return "Diretoria de Administração e Finanças";
  return dir;
}

function normalizeTipo(tipo) {
  if (tipo.includes("Contrato")) return "Contrato";
  if (tipo.includes("Acordo de Cooperação Técnica")) return "Acordo de Cooperação Técnica";
  if (tipo.includes("Termo de Cooperação Técnica")) return "Termo de Cooperação Técnica";
  if (tipo.includes("Convênio")) return "Convênio";
  if (tipo.includes("Acordo de Cooperação")) return "Acordo de Cooperação";
  if (tipo.includes("Termo de Acordo")) return "Termo de Acordo de Cooperação";
  if (tipo.includes("Credenciamento")) return "Termo de Credenciamento";
  return tipo;
}

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Seed instrumentos
    const raw = JSON.parse(fs.readFileSync("/home/ubuntu/extract_contract_data.json", "utf-8"));
    const seen = new Set();
    const rows = [];

    for (const r of raw.results) {
      if (r.error) continue;
      const o = r.output;
      const key = o.numero_instrumento;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push([
        o.numero_instrumento || "S/N",
        normalizeTipo(o.tipo_instrumento),
        o.partes_envolvidas,
        o.objeto,
        parseDate(o.data_inicio),
        parseDate(o.data_termino),
        o.numero_processo || null,
        normalizeDiretoria(o.diretoria_responsavel),
        o.arquivo_origem || null,
      ]);
    }

    const batchSize = 10;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const placeholders = batch.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
      const params = batch.flat();
      await conn.execute(
        `INSERT INTO instrumentos (numero, tipo, partesEnvolvidas, objeto, dataInicio, dataTermino, processoSei, diretoria, arquivoOrigem) VALUES ${placeholders}`,
        params
      );
    }
    console.log(`✅ ${rows.length} instrumentos importados`);

    // Add termos aditivos for contract 039/2023
    const [contractRows] = await conn.execute("SELECT id FROM instrumentos WHERE numero = '039/2023' LIMIT 1");
    if (contractRows.length > 0) {
      const cid = contractRows[0].id;
      await conn.execute(
        "INSERT INTO termos_aditivos (instrumentoId, descricao, dataAditivo) VALUES (?, ?, ?), (?, ?, ?)",
        [cid, "Primeiro Termo Aditivo - Prorrogação de vigência por 12 meses", parseDate("01/08/2024"),
         cid, "Segundo Termo Aditivo - Reajuste de valor contratual", parseDate("01/02/2025")]
      );
      console.log("✅ Termos aditivos inseridos");
    }

    // Seed VPN mockup
    const vpnData = [
      ["Carlos Silva", "DET-2019-0451", "Diretoria de Identificação Civil", "vpn-srv-01.detran.rj.gov.br", "10.0.1.15", "conectado", Date.now() - 300000, 1524000, 8920000],
      ["Ana Oliveira", "DET-2020-0832", "Diretoria de Habilitação", "vpn-srv-01.detran.rj.gov.br", "10.0.1.22", "conectado", Date.now() - 600000, 892000, 4510000],
      ["Roberto Santos", "DET-2018-0123", "Diretoria de Registro de Veículos", "vpn-srv-02.detran.rj.gov.br", "10.0.2.8", "conectado", Date.now() - 120000, 3200000, 12400000],
      ["Maria Fernanda Costa", "DET-2021-0567", "Diretoria de Apoio Operacional", "vpn-srv-01.detran.rj.gov.br", "10.0.1.34", "conectado", Date.now() - 1800000, 450000, 2100000],
      ["José Pereira", "DET-2017-0298", "Diretoria de Tecnologia da Informação", "vpn-srv-02.detran.rj.gov.br", "10.0.2.15", "conectado", Date.now() - 60000, 15800000, 42300000],
      ["Luciana Almeida", "DET-2022-0901", "Diretoria de Identificação Civil", "vpn-srv-01.detran.rj.gov.br", null, "desconectado", Date.now() - 86400000, 0, 0],
      ["Fernando Gomes", "DET-2019-0677", "Diretoria de Habilitação", "vpn-srv-02.detran.rj.gov.br", null, "desconectado", Date.now() - 172800000, 0, 0],
      ["Patrícia Lima", "DET-2020-0445", "Diretoria de Registro de Veículos", "vpn-srv-01.detran.rj.gov.br", null, "desconectado", Date.now() - 259200000, 0, 0],
      ["Ricardo Mendes", "DET-2016-0089", "Diretoria de Identificação Civil", "vpn-srv-02.detran.rj.gov.br", null, "bloqueado", Date.now() - 604800000, 0, 0],
      ["Beatriz Souza", "DET-2023-0112", "Diretoria de Administração e Finanças", "vpn-srv-01.detran.rj.gov.br", "10.0.1.41", "conectado", Date.now() - 900000, 670000, 3400000],
      ["Marcos Ribeiro", "DET-2018-0534", "Diretoria de Tecnologia da Informação", "vpn-srv-02.detran.rj.gov.br", "10.0.2.28", "conectado", Date.now() - 240000, 8900000, 25600000],
      ["Camila Rodrigues", "DET-2021-0789", "Diretoria de Apoio Operacional", "vpn-srv-01.detran.rj.gov.br", null, "desconectado", Date.now() - 432000000, 0, 0],
    ];

    const vpnPlaceholders = vpnData.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
    await conn.execute(
      `INSERT INTO vpn_conexoes (nomeUsuario, matricula, diretoria, servidor, ipAtribuido, status, ultimaConexao, bytesEnviados, bytesRecebidos) VALUES ${vpnPlaceholders}`,
      vpnData.flat()
    );
    console.log(`✅ ${vpnData.length} conexões VPN mockup importadas`);

    console.log("🎉 Seed completo!");
  } finally {
    await conn.end();
  }
}

main().catch(err => { console.error("❌ Erro:", err); process.exit(1); });
