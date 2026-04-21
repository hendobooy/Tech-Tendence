const { spawn } = require('child_process');
const cron = require('node-cron');
const { analisarVaga } = require('./ai_scrap.js');
const { iniciarBanco, salvarVaga } = require('./db.mjs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const termosDeBusca = [
    "Desenvolvimento Web", "Desenvolvimento Mobile", "Desenvolvimento Full Stack",
    "Desenvolvimento Back End", "Desenvolvimento Front End", "Desenvolvimento de Software", "Desenvolvimento de Aplicativos",
    "Desenvolvimento Java", "Desenvolvimento Python", "Desenvolvimento C#", "Desenvolvimento PHP", "Desenvolvimento JavaScript",
    "Desenvolvimento TypeScript", "Desenvolvimento HTML", "Desenvolvimento CSS", "Desenvolvimento React", "Desenvolvimento Angular",
    "Desenvolvimento Vue", "Desenvolvimento Node", "Desenvolvimento Spring", "Desenvolvimento Django", "Desenvolvimento Laravel",
    "Desenvolvimento .NET", "Desenvolvimento Flutter", "Desenvolvimento React Native", "Desenvolvimento Swift", "Desenvolvimento Kotlin",
    "Desenvolvimento C++", "Desenvolvimento C", "Desenvolvimento Ruby", "Desenvolvimento Go", "Desenvolvimento Rust", "Desenvolvimento SQL",
    "Desenvolvimento Oracle", "Desenvolvimento MySQL", "Desenvolvimento PostgreSQL", "Desenvolvimento MongoDB", "Desenvolvimento Redis", "Desenvolvimento Elasticsearch",
    "Desenvolvimento AWS", "Desenvolvimento Azure", "Desenvolvimento Google Cloud", "Desenvolvimento Docker", "Desenvolvimento Kubernetes", "Desenvolvimento Jenkins",
    "Desenvolvimento Git", "Desenvolvimento Jira"
];

const sites = ["gupy", "solides"];

function rodarPython(site, termo) {
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', ['scrapers/scraper.py', site, termo]);
        let dadosBrutos = '';

        pythonProcess.stdout.on('data', (pedaco) => { dadosBrutos += pedaco.toString(); });

        pythonProcess.on('close', (code) => {
            if (code !== 0) return resolve({ erro: "Processo falhou" });
            try {
                resolve(JSON.parse(dadosBrutos));
            } catch (e) {
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

            console.log(`✅ ${vagas.length} vagas encontradas. Processando IA...`);

            for (const vaga of vagas) {
                // Nova query usando id_original e fonte
                const existe = await db.get('SELECT id FROM vagas WHERE id_original = ? AND fonte = ?', [vaga.id, site]);
                if (existe) continue;

                const analiseIA = await analisarVaga(vaga.titulo, vaga.descricao);

                if (analiseIA) {
                    // Se a vaga já trouxe hardskills nativas (Solides), mescla com as da IA
                    if (vaga.hardskills && vaga.hardskills.length > 0) {
                        analiseIA.tecnologias_obrigatorias = [
                            ...new Set([...(analiseIA.tecnologias_obrigatorias || []), ...vaga.hardskills])
                        ];
                    }

                    // O objeto "vaga" já está padronizado no Python, passamos direto
                    await salvarVaga(db, vaga, analiseIA, site);
                }
            }

            console.log(`⏳ Standby de 30s...`);
            await sleep(30000);
        }

        console.log(`⏳ Trocando de site. Standby de 2 min...`);
        await sleep(120000);
    }
    console.log(`\n🏁 Ciclo finalizado! Hibernando até a próxima hora.`);
}

cron.schedule('0 * * * *', () => {
    motorDeBusca();
});

console.log("⏰ Agendador ativado.");
motorDeBusca(); // Descomente para testar agora