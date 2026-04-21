# 🚀 TechTendence - Mentor de Carreira Inteligente

![TechTendence Status](https://img.shields.io/badge/Status-Desenvolvimento-green?style=for-the-badge)
![TechTendence AI](https://img.shields.io/badge/AI-OpenAI%20GPT--5--nano-blue?style=for-the-badge)
![TechTendence Framework](https://img.shields.io/badge/Framework-React-cyan?style=for-the-badge)

**TechTendence** é um ecossistema inteligente projetado para guiar profissionais de tecnologia em suas jornadas de evolução ou transição de carreira. Através de uma arquitetura robusta que combina Inteligência Artificial e dados reais de mercado, o app gera roadmaps personalizados com cursos validados, salários atualizados e insights de demanda.

---

## 🎯 A Ideia

O mercado de tecnologia muda rápido demais. Recrutadores buscam stacks específicas, enquanto desenvolvedores se sentem perdidos em um mar de cursos. O **TechTendence** resolve isso atuando como uma ponte:
1. **Analisa seu perfil atual** (nível, stack e conhecimentos).
2. **Cruza com dados reais de vagas** via MCP (Model Context Protocol).
3. **Gera um plano estratégico** focado no que realmente traz retorno financeiro e de empregabilidade.
4. **Recomenda cursos reais**, garantindo que nenhum link seja inventado pela IA.

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **Vite**: Performance e agilidade no desenvolvimento.
- **Tailwind CSS**: Estilização moderna com foco em UX/UI premium.
- **Lucide React**: Biblioteca de ícones consistente.
- **React Markdown**: Renderização de respostas ricas da IA no chat.

### Backend (Core Inteligente)
- **Node.js** + **Fastify**: Servidor de alta performance e baixa latência.
- **OpenAI API (GPT-4o)**: Orquestração de inteligência.
- **SQLite**: Armazenamento local de cursos e estatísticas de mercado.
- **MCP (Model Context Protocol)**: Protocolo de comunicação para ferramentas de busca de dados em tempo real.

---

## 🏗️ Arquitetura do Pipeline "Anti-Alucinação"

Um dos maiores desafios em apps de IA é a invenção de URLs. O TechTendence utiliza um pipeline proprietário de 4 fases para garantir **100% de precisão nos links**:

1.  **Fase 1 (O Estrategista):** A IA analisa o catálogo real do banco de dados e escolhe 4 tecnologias (gaps) para o roadmap.
2.  **Fase 2 (O Coletor):** O Node.js intercepta o plano e busca **diretamente no SQLite** os cursos disponíveis para aquelas tecnologias.
3.  **Fase 3 (O Arquiteto):** A IA gera apenas a estrutura do layout (títulos das semanas, descrições motivadoras e impacto), sem tocar nos cursos.
4.  **Fase 4 (Assembly):** O Node.js injeta os links e metadados reais (carga horária, tipo de curso) na estrutura gerada pela IA e entrega ao frontend.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)
- Uma chave de API da OpenAI

### Configuração Inicial
1. Clone o repositório.
2. Crie um arquivo `.env` na raiz com sua chave:
   ```env
   OPENAI_API_KEY=sua_chave_aqui
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

### Executando
O projeto precisa que o Backend e o Frontend rodem simultaneamente:

**Terminal 1: Backend**
```bash
node src/api.mjs
```

**Terminal 2: Frontend**
```bash
npm run dev
```

---

## 📂 Estrutura de Código

- `src/api.mjs`: O coração do projeto. Orquestra as fases de IA, chamadas de ferramentas e montagem dos dados.
- `src/mcp_web.mjs`: Servidor de protocolo MCP que gerencia as buscas no banco de dados SQLite.
- `src/db.mjs`: Camada de persistência e gerenciamento do banco de dados.
- `src/components/insights/`: Componentes visuais como o `RecomendacaoCard` (layout premium dos roadmaps) e o `FloatingChat` (mentor interativo).

---

## 👨‍💻 Para Recrutadores & Desenvolvedores

Este projeto demonstra competências avançadas em:
- **Engenharia de Prompt:** Orquestração de múltiplos agentes de IA.
- **Desenvolvimento Fullstack:** Integração fluida entre React e Fastify.
- **Arquitetura de Dados:** Uso de SQLite para caching de dados de mercado e cursos.
- **Segurança & Robustez:** Tratamento de erros de API e sanitização de outputs de IA.

**TechTendence** é código aberto e focado na comunidade. Se você deseja contribuir com novos scrapers de cursos ou melhorias na UI, sinta-se à vontade para abrir um PR!

---

Desenvolvido por **Artur Felipe** e feito para a comunidade Tech 💜.
