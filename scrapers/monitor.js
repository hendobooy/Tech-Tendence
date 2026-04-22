import { spawn } from 'child_process';
import cron from 'node-cron';
import { analisarVaga } from './ai_scrap.js';
import { iniciarBanco, salvarVaga } from './db.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const termosDeBusca = [
    "Técnico de informatica", "Estágio em informatica", "Estágio técnico", "Estágio em TI", "Estágio em Tecnologia da Informação",
    "Desenvolvimento Web", "Desenvolvimento Mobile", "Desenvolvimento Full Stack",
    "Desenvolvimento Back End", "Desenvolvimento Front End", "Desenvolvimento de Software", "Desenvolvimento de Aplicativos",
    "Desenvolvimento Java", "Desenvolvimento Python", "Desenvolvimento C#", "Desenvolvimento PHP", "Desenvolvimento JavaScript",
    "Desenvolvimento TypeScript", "Desenvolvimento HTML", "Desenvolvimento CSS", "Desenvolvimento React", "Desenvolvimento Angular",
    "Desenvolvimento Vue", "Desenvolvimento Node", "Desenvolvimento Spring", "Desenvolvimento Django", "Desenvolvimento Laravel",
    "Desenvolvimento .NET", "Desenvolvimento Flutter", "Desenvolvimento React Native", "Desenvolvimento Swift", "Desenvolvimento Kotlin",
    "Desenvolvimento C++", "Desenvolvimento C", "Desenvolvimento Ruby", "Desenvolvimento Go", "Desenvolvimento Rust", "Desenvolvimento SQL",
    "Desenvolvimento Oracle", "Desenvolvimento MySQL", "Desenvolvimento PostgreSQL", "Desenvolvimento MongoDB", "Desenvolvimento Redis", "Desenvolvimento Elasticsearch",
    "Desenvolvimento AWS", "Desenvolvimento Azure", "Desenvolvimento Google Cloud", "Desenvolvimento Docker", "Desenvolvimento Kubernetes", "Desenvolvimento Jenkins",
    "Desenvolvimento Git", "Desenvolvimento Jira", "Análise de Dados", "Ciência de Dados", "Engenharia de Dados", "Engenheiro de Software", "Desenvolvedor de Software",
];

const sites = ["gupy", "solides"];

function rodarPython(site, termo) {
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', ['scrapers/scraper.py', site, termo]);
        let dadosBrutos = '';
        let dadosErro = '';

        pythonProcess.stdout.on('data', (pedaco) => { dadosBrutos += pedaco.toString(); });
        pythonProcess.stderr.on('data', (pedaco) => { dadosErro += pedaco.toString(); });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ Python stderr: ${dadosErro}`);
                return resolve({ erro: "Processo falhou" });
            }
            try {
                resolve(JSON.parse(dadosBrutos));
            } catch (e) {
                console.error(`❌ JSON inválido do Python: ${dadosBrutos.slice(0, 200)}`);
                resolve({ erro: "Falha ao ler JSON do Python" });
            }
        });
    });
}

async function motorDeBusca() {
    console.log(`\n⚙️ [${new Date().toLocaleTimeString()}] Iniciando varredura massiva...`);
    const db = await iniciarBanco();

    for (const site of sites) {
        console.log(`\n🌐 Atacando: ${site.toUpperCase()}`);

        for (const termo of termosDeBusca) {
            console.log(`🔍 Buscando: "${termo}"...`);
            const vagas = await rodarPython(site, termo);

            if (vagas.erro) {
                console.log(`❌ Erro (${site} - ${termo}): ${vagas.erro}`);
                continue;
            }

            if (!Array.isArray(vagas)) {
                console.log(`⚠️ Resposta inesperada do scraper (não é array): ${JSON.stringify(vagas).slice(0, 100)}`);
                continue;
            }

            console.log(`✅ ${vagas.length} vagas encontradas. Processando IA...`);

            for (const vaga of vagas) {
                // Evita duplicatas pela chave id_original + fonte
                const existe = await db.get('SELECT id FROM vagas WHERE id_original = ? AND fonte = ?', [vaga.id, site]);
                if (existe) {
                    console.log(`⏭️ Já existe: ${vaga.titulo}`);
                    continue;
                }

                const analiseIA = await analisarVaga(vaga.titulo, vaga.descricao);

                if (analiseIA) {
                    // Se a vaga já trouxe hardskills nativas (Solides), mescla com as da IA
                    if (vaga.hardskills && vaga.hardskills.length > 0) {
                        analiseIA.tecnologias_obrigatorias = [
                            ...new Set([...(analiseIA.tecnologias_obrigatorias || []), ...vaga.hardskills])
                        ];
                    }

                    await salvarVaga(db, vaga, analiseIA, site);
                    console.log(`💾 Salva: ${vaga.titulo}`);
                } else {
                    console.log(`⚠️ IA não retornou análise para: ${vaga.titulo}`);
                }
            }

            console.log(`⏳ Standby de 30s...`);
            await sleep(30000);
        }

        console.log(`⏳ Trocando de site. Standby de 2 min...`);
        await sleep(120000);
    }
    console.log(`\n🏁 Ciclo finalizado! Hibernando até a próxima hora.`);
};

console.log("⏰ Agendador ativado. Iniciando primeira varredura...");
motorDeBusca();