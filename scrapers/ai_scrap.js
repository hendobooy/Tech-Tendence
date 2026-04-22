import 'dotenv/config';
import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function analisarVaga(titulo, descricao) {
    console.log(`🧠 IA analisando: ${titulo}...`);

    try {
        const resposta = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                {
                    role: "system",
                    content: `Você é um Extrator de Dados de RH. 
                    Analise a descrição da vaga e retorne APENAS um objeto JSON estrito com as seguintes chaves:
                    - "senioridade": (Junior, Pleno, Senior ou Nao_Informado)
                    - "salario": (FaixaSalarial, ou Nao_Informado)
                    - "modelo": (Remoto, Hibrido, Presencial ou Nao_Informado)
                    - "tecnologias_obrigatorias": [array de strings com as ferramentas/linguagens principais]
                    - "tecnologias_diferenciais": [array de strings com os diferenciais]
                    NÃO retorne formatação markdown (\`\`\`json), apenas o JSON puro.`
                },
                {
                    role: "user",
                    content: `Vaga: ${titulo}\nDescrição: ${descricao}`
                }
            ],
            temperature: 1,
        });

        const dadosEstruturados = JSON.parse(resposta.choices[0].message.content);
        return dadosEstruturados;

    } catch (erro) {
        console.error("❌ Erro na IA:", erro.message);
        return null;
    }
}