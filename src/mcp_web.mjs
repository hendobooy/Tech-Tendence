import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/tech_trends.sqlite');

async function getDb() {
    return open({ filename: dbPath, driver: sqlite3.Database });
}

const server = new Server(
    { name: "tech-tendence-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "listar_techs_em_alta",
                description: "Retorna as 10 tecnologias mais exigidas baseadas em um cargo.",
                inputSchema: {
                    type: "object",
                    properties: {
                        palavras_chave: {
                            type: "array",
                            items: { type: "string" },
                            description: "Ex: ['Dados', 'Data'], ['Front', 'React'], ['Sec', 'Segurança']"
                        }
                    },
                    required: ["palavras_chave"]
                }
            },
            {
                name: "panorama_salarial",
                description: "Busca os salários reais oferecidos para um determinado cargo.",
                inputSchema: {
                    type: "object",
                    properties: {
                        cargo: { type: "string", description: "Ex: Engenheiro de Software" }
                    },
                    required: ["cargo"]
                }
            },
            {
                name: "buscar_vagas_por_hardskill",
                description: "Encontra vagas abertas que exigem uma tecnologia específica.",
                inputSchema: {
                    type: "object",
                    properties: {
                        hardskill: { type: "string", description: "Ex: Python, React, SQL" }
                    },
                    required: ["hardskill"]
                }
            },
            // NOVA FERRAMENTA ADICIONADA AQUI
            {
                name: "buscar_cursos_recomendados",
                description: "Busca cursos na base de dados filtrando por tecnologia e nível necessário (Básico, Intermediário, Avançado).",
                inputSchema: {
                    type: "object",
                    properties: {
                        tecnologia: { type: "string", description: "Nome da tecnologia (ex: Python, AWS, React)" },
                        nivel_curso: { type: "string", enum: ["Básico", "Intermediário", "Avançado"] }
                    },
                    required: ["tecnologia", "nivel_curso"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const db = await getDb();
    const args = request.params.arguments;

    try {
        if (request.params.name === "listar_techs_em_alta") {
            const palavras = args.palavras_chave;
            if (!palavras || !Array.isArray(palavras) || palavras.length === 0) {
                return { content: [{ type: "text", text: "Erro: Forneça um array 'palavras_chave' válido (ex: ['Python', 'Dados'])." }] };
            }

            const condicoes = palavras.map(() => 'v.titulo LIKE ?').join(' OR ');
            const parametros = palavras.map(p => `%${p}%`);

            // Conta vagas únicas
            const countQuery = `SELECT COUNT(DISTINCT v.id) as total FROM vagas v WHERE ${condicoes}`;
            const countRow = await db.get(countQuery, parametros);
            const totalVagas = countRow.total;

            // Busca tecnologias dessas vagas sem duplicar a contagem
            const techsQuery = `
                SELECT t.nome as tecnologia, COUNT(DISTINCT v.id) as demandas
                FROM tecnologias t
                JOIN vagas_techs vt ON t.id = vt.tech_id
                JOIN vagas v ON v.id = vt.vaga_id
                WHERE ${condicoes}
                GROUP BY t.id
                ORDER BY demandas DESC
                LIMIT 10
            `;
            const techsRows = await db.all(techsQuery, parametros);

            const resultado = {
                total_vagas_analisadas: totalVagas,
                tecnologias: techsRows
            };

            return { content: [{ type: "text", text: JSON.stringify(resultado, null, 2) }] };
        }

        if (request.params.name === "panorama_salarial") {
            const query = `
                SELECT empresa, titulo, senioridade, salario 
                FROM vagas 
                WHERE titulo LIKE ? AND salario NOT IN ('A combinar', 'Nao_Informado', '')
                LIMIT 30
            `;
            const rows = await db.all(query, [`%${args.cargo}%`]);
            return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
        }

        if (request.params.name === "buscar_vagas_por_hardskill") {
            const query = `
                SELECT v.titulo, v.empresa, v.modelo, v.salario, v.fonte 
                FROM vagas v 
                JOIN vagas_techs vt ON v.id = vt.vaga_id 
                JOIN tecnologias t ON t.id = vt.tech_id 
                WHERE t.nome LIKE ? 
                LIMIT 15
            `;
            const rows = await db.all(query, [`%${args.hardskill}%`]);
            return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
        }

        // NOVA LÓGICA DE EXECUÇÃO ADICIONADA AQUI
        if (request.params.name === "buscar_cursos_recomendados") {
            const { tecnologia, nivel_curso } = args;

            let query = `
                SELECT nome_curso, link, tipo_curso, carga_horaria 
                FROM cursos 
                WHERE tecnologia LIKE ? AND nivel_curso = ? 
                LIMIT 5
            `;

            let rows = await db.all(query, [`%${tecnologia}%`, nivel_curso]);

            // FALLBACK: Se não achar cursos para o nível exigido (ex: Avançado), tenta buscar qualquer curso daquela tecnologia
            if (rows.length === 0) {
                const fallbackQuery = `
                    SELECT nome_curso, link, tipo_curso, carga_horaria 
                    FROM cursos 
                    WHERE tecnologia LIKE ? 
                    LIMIT 5
                `;
                rows = await db.all(fallbackQuery, [`%${tecnologia}%`]);
            }

            const responseText = rows.length > 0 ? JSON.stringify(rows, null, 2) : "Nenhum curso encontrado para este filtro.";

            return { content: [{ type: "text", text: responseText }] };
        }

        throw new Error("Ferramenta desconhecida");
    } finally {
        await db.close();
    }
});

// Inicialização com Stdio (Padrão para Claude Desktop)
async function startServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Usamos console.error para não poluir o stdout!
    console.error("🚀 Servidor MCP conectado via stdio!");
}

startServer().catch((error) => {
    console.error("Erro fatal no servidor MCP:", error);
    process.exit(1);
});