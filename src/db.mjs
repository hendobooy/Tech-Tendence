import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function iniciarBanco() {
    const db = await open({
        filename: './db/tech_trends.sqlite',
        driver: sqlite3.Database
    });

    // Mantendo suas tabelas originais
    await db.exec(`
        CREATE TABLE IF NOT EXISTS vagas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_original TEXT,
            fonte TEXT,
            titulo TEXT,
            empresa TEXT,
            data_pub TEXT,
            senioridade TEXT,
            modelo TEXT,
            salario TEXT,
            UNIQUE(id_original, fonte)
        );
        CREATE TABLE IF NOT EXISTS tecnologias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE
        );
        CREATE TABLE IF NOT EXISTS vagas_techs (
            vaga_id INTEGER,
            tech_id INTEGER,
            tipo TEXT, 
            PRIMARY KEY (vaga_id, tech_id),
            FOREIGN KEY (vaga_id) REFERENCES vagas(id),
            FOREIGN KEY (tech_id) REFERENCES tecnologias(id)
        );
    `);

    return db;
}

// NOVA FUNÇÃO: Busca métricas de tecnologias
export async function getTechStats(db) {
    return await db.all(`
        SELECT t.nome, COUNT(vt.vaga_id) as demanda
        FROM tecnologias t
        JOIN vagas_techs vt ON t.id = vt.tech_id
        GROUP BY t.nome
        ORDER BY demanda DESC
        LIMIT 10
    `);
}

export async function getSalariosPorCargo(db, cargo) {
    // Busca vagas que tenham o nome do cargo e possuam algum valor de salário
    const vagas = await db.all(
        `SELECT salario FROM vagas WHERE titulo LIKE ? AND salario != 'Nao_Informado'`,
        [`%${cargo}%`]
    );

    if (vagas.length === 0) {
        return { cargo, media: 0, teto: 0, piso: 0 };
    }

    // Tenta converter o texto "R$ 5.000" em número 5000
    const valores = vagas
        .map(v => {
            // Remove tudo que não é número ou ponto/vírgula
            const limpo = v.salario.replace(/[^\d]/g, '');
            return parseInt(limpo);
        })
        .filter(v => !isNaN(v) && v > 0);

    if (valores.length === 0) {
        return { cargo, media: 0, teto: 0, piso: 0 };
    }

    const soma = valores.reduce((a, b) => a + b, 0);

    return {
        cargo: cargo,
        media: Math.round(soma / valores.length),
        teto: Math.max(...valores),
        piso: Math.min(...valores)
    };
}

export async function salvarVaga(db, vagaPadronizada, vagaIA, fonte) {
    // Tenta salvar a vaga baseada na chave dupla (ID original + Site)
    const resultado = await db.run(`
        INSERT OR IGNORE INTO vagas (id_original, fonte, titulo, empresa, data_pub, senioridade, modelo, salario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        vagaPadronizada.id,
        fonte,
        vagaPadronizada.titulo,
        vagaPadronizada.empresa,
        vagaPadronizada.data_pub,
        vagaIA.senioridade || vagaPadronizada.senioridade,
        vagaIA.modelo || vagaPadronizada.modelo_de_trabalho,
        vagaPadronizada.salario || 'Nao_Informado'
    ]);

    if (resultado.changes === 0) {
        console.error(`⚠️ Vaga já existe no banco (ID: ${vagaPadronizada.id} | Fonte: ${fonte}). Pulando...`);
        return false;
    }

    // Pega o ID interno que o SQLite acabou de gerar na linha de cima
    const linha = await db.get(`SELECT id FROM vagas WHERE id_original = ? AND fonte = ?`, [vagaPadronizada.id, fonte]);
    const idInterno = linha.id;

    const processarTechs = async (techs, tipo) => {
        if (!techs) return;
        for (const tech of techs) {
            await db.run(`INSERT OR IGNORE INTO tecnologias (nome) VALUES (?)`, [tech]);
            const techDB = await db.get(`SELECT id FROM tecnologias WHERE nome = ?`, [tech]);

            await db.run(`INSERT OR IGNORE INTO vagas_techs (vaga_id, tech_id, tipo) VALUES (?, ?, ?)`,
                [idInterno, techDB.id, tipo]);
        }
    };

    await processarTechs(vagaIA.tecnologias_obrigatorias, 'obrigatoria');
    await processarTechs(vagaIA.tecnologias_diferenciais, 'diferencial');

    console.error(`💾 Salvo com sucesso: ${vagaPadronizada.titulo} (${fonte})`);
    return true;
}