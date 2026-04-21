import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Garante o caminho correto do banco
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../db/tech_trends.sqlite'); // Caminho corrigido para apontar para a pasta externa db

// URL da versão RAW (Texto Puro) da lista de cursos em PT-BR
const URL_GITHUB = "https://raw.githubusercontent.com/EbookFoundation/free-programming-books/main/courses/free-courses-pt_BR.md";

async function iniciarImportacao() {
    console.log("⬇️ Baixando a base de dados de cursos do GitHub...");

    try {
        const response = await fetch(URL_GITHUB);
        const markdown = await response.text();

        console.log("✅ Download concluído! Processando os dados...");

        const linhas = markdown.split('\n');
        const cursosFormatados = [];
        let tecnologiaAtual = "Geral"; // Caso tenha cursos antes dos títulos

        // Regex para capturar os títulos das linguagens: ### Python
        const regexTitulo = /^###\s+(.*)/;

        // Regex para capturar os links do Markdown: * [Nome do Curso](http://link...)
        const regexLink = /^\s*\*\s+\[(.*?)\]\((https?:\/\/.*?)\)/;

        for (const linha of linhas) {
            // Verifica se a linha é um título de tecnologia
            const matchTitulo = linha.match(regexTitulo);
            if (matchTitulo) {
                // Remove tags HTML (ex: <a id="cpp"></a>) e contra-barras (ex: C\#)
                tecnologiaAtual = matchTitulo[1].replace(/<[^>]*>?/gm, '').replace(/\\/g, '').trim();
                continue;
            }

            // Verifica se a linha é um link de curso
            const matchLink = linha.match(regexLink);
            if (matchLink) {
                const nomeCurso = matchLink[1].trim();
                const linkCurso = matchLink[2].trim();

                // Dica: Tenta adivinhar o nível pelo nome do curso
                let nivel = "Básico";
                const nomeLower = nomeCurso.toLowerCase();
                if (nomeLower.includes("intermediário") || nomeLower.includes("intermediario")) nivel = "Intermediário";
                if (nomeLower.includes("avançado") || nomeLower.includes("avancado") || nomeLower.includes("master")) nivel = "Avançado";

                // Adiciona ao array que vai pro banco
                cursosFormatados.push({
                    link: linkCurso,
                    nome: nomeCurso,
                    tipo: linkCurso.includes("youtube") ? "YouTube" : "Curso Online",
                    nivel: nivel,
                    tech: tecnologiaAtual,
                    horas: 10 // Como o GitHub não tem a carga horária em número, chutamos 10h como padrão
                });
            }
        }

        console.log(`🚀 Foram encontrados ${cursosFormatados.length} cursos reais. Inserindo no banco SQLite...`);

        // Conecta ao banco
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Garante que a tabela exista antes de inserir, já que a excluímos anteriormente
        await db.exec(`
            CREATE TABLE IF NOT EXISTS cursos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link TEXT NOT NULL,
                nome_curso TEXT NOT NULL,
                tipo_curso TEXT NOT NULL,
                nivel_curso TEXT NOT NULL,
                tecnologia TEXT NOT NULL,
                carga_horaria INTEGER
            )
        `);

        // Loop de inserção no banco
        let inseridos = 0;
        for (const curso of cursosFormatados) {
            try {
                await db.run(
                    `INSERT INTO cursos (link, nome_curso, tipo_curso, nivel_curso, tecnologia, carga_horaria) VALUES (?, ?, ?, ?, ?, ?)`,
                    [curso.link, curso.nome, curso.tipo, curso.nivel, curso.tech, curso.horas]
                );
                inseridos++;
            } catch (err) {
                console.error(`Erro ao inserir o curso: ${curso.nome}`, err);
            }
        }

        console.log(`🎉 Sucesso! ${inseridos} cursos reais foram adicionados ao seu Tech Tendence.`);
        await db.close();

    } catch (error) {
        console.error("Falha ao buscar ou processar os dados do GitHub:", error);
    }
}

iniciarImportacao();