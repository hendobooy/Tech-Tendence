import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, RotateCcw } from "lucide-react";
import BolhaIA from "../components/chat/BolhaIA";
import BolhaUsuario from "../components/chat/BolhaUsuario";
import BarraProgresso from "../components/chat/BarraProgresso";
import PainelOpcoes from "../components/chat/PainelOpcoes";

const FLUXO_BASE = [
    { id: "nivel", mensagem: "Olá! Para começarmos sua análise, qual seu nível de experiência atual?", tipo: "unica", opcoes: ["Júnior", "Pleno", "Sênior", "Estagiário", "Outro"] },
    { id: "stack", mensagem: "Legal! E em qual stack você foca hoje ou tem mais domínio?", tipo: "unica", opcoes: ["Frontend", "Backend", "Full Stack", "Dados", "Outro"] },
    { id: "tecnologias", mensagem: "Quais tecnologias você mais utiliza no dia a dia?", tipo: "multipla", opcoes: ["React", "Node.js", "Python", "SQL", "Java", "AWS", "Docker", "Outro"], dica: "Selecione quantas quiser" },
    { id: "objetivo", mensagem: "Qual o seu principal objetivo de carreira no momento?", tipo: "unica", opcoes: ["Migrar de área", "Conseguir promoção", "Aumento salarial", "Primeira vaga", "Outro"] },
];

const MSG_PROCESSANDO = "Perfeito! Estou processando seu perfil agora...";
const esperar = (ms) => new Promise((res) => setTimeout(res, ms));

export default function ChatInterface({ onComplete }) {
    const [historico, setHistorico] = useState([]);
    const [etapaAtual, setEtapaAtual] = useState(0);
    const [fluxo, setFluxo] = useState(FLUXO_BASE);
    const [respostas, setRespostas] = useState({});
    const [mostraPainel, setMostraPainel] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);
    const [finalizado, setFinalizado] = useState(false);
    const [mostraDigitando, setMostraDigitando] = useState(false);

    const fimRef = useRef(null);
    const iniciouRef = useRef(false);
    const perguntaAtual = fluxo[etapaAtual];

    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [historico, mostraPainel, mostraDigitando]);

    const exibirMensagemIA = useCallback(async (texto) => {
        setMostraDigitando(true);
        await esperar(900);
        setMostraDigitando(false);
        setHistorico((prev) => [...prev, { tipo: "ia", texto }]);
    }, []);

    useEffect(() => {
        if (iniciouRef.current) return;
        iniciouRef.current = true;
        async function iniciar() {
            await esperar(400);
            await exibirMensagemIA(FLUXO_BASE[0].mensagem);
            setMostraPainel(true);
        }
        iniciar();
    }, [exibirMensagemIA]);

    const handleResposta = useCallback(async (valores) => {
        if (bloqueado || finalizado) return;

        setBloqueado(true);
        setMostraPainel(false);

        const textoResposta = perguntaAtual.tipo === "multipla" ? valores.join(", ") : valores[0];

        await esperar(150);
        setHistorico((prev) => [...prev, { tipo: "usuario", texto: textoResposta }]);

        const novasRespostas = {
            ...respostas,
            [perguntaAtual.id]: perguntaAtual.tipo === "multipla" ? valores : valores[0],
        };
        setRespostas(novasRespostas);

        const proximoFluxo = [...fluxo];
        let hasChanges = false;

        // Lógica: Se escolheu tecnologias, adicionar perguntas de proficiência
        if (perguntaAtual.id === "tecnologias" && valores.length > 0) {
            // Evitar adicionar duplicatas caso o state já tenha atualizado
            if (!proximoFluxo.some(p => p.id.startsWith("nivel_"))) {
                const perguntasNivel = valores.map(tech => ({
                    id: `nivel_${tech.toLowerCase().replace(/\s+/g, '_')}`,
                    tech_name: tech,
                    mensagem: `Como você avalia o seu domínio atual em ${tech}?`,
                    tipo: "unica",
                    opcoes: ["Básico", "Intermediário", "Avançado"]
                }));

                proximoFluxo.splice(etapaAtual + 1, 0, ...perguntasNivel);
                hasChanges = true;
            }
        }

        // Lógica: Se o objetivo for migrar de área, adicionar pergunta extra ao final
        if (perguntaAtual.id === "objetivo" && valores[0] === "Migrar de área") {
            if (!proximoFluxo.find(p => p.id === "area_migracao")) {
                proximoFluxo.push({
                    id: "area_migracao",
                    mensagem: "Entendi! Para qual área você gostaria de migrar?",
                    tipo: "unica",
                    opcoes: ["Frontend", "Backend", "Full Stack", "Dados", "Mobile", "DevOps", "Outro"]
                });
                hasChanges = true;
            }
        }

        if (hasChanges) {
            setFluxo(proximoFluxo);
        }

        const proximaEtapa = etapaAtual + 1;

        if (proximaEtapa < proximoFluxo.length) {
            await esperar(400);
            await exibirMensagemIA(proximoFluxo[proximaEtapa].mensagem);
            setEtapaAtual(proximaEtapa);
            setBloqueado(false);
            setMostraPainel(true);
        } else {
            await esperar(400);
            await exibirMensagemIA(MSG_PROCESSANDO);
            setFinalizado(true);

            const proficiencias = fluxo
                .filter(p => p.id.startsWith('nivel_'))
                .map(p => ({
                    tecnologia: p.tech_name,
                    nivel: novasRespostas[p.id] || "Básico"
                }));

            await esperar(2000);
            onComplete?.({
                nivel: novasRespostas.nivel,
                stack: novasRespostas.stack,
                tecnologias: proficiencias,
                objetivo: novasRespostas.objetivo,
                area_migracao: novasRespostas.area_migracao,
                timestamp: new Date().toISOString(),
            });
        }
    }, [bloqueado, finalizado, etapaAtual, perguntaAtual, respostas, fluxo, exibirMensagemIA, onComplete]);

    const reiniciar = () => {
        setHistorico([]);
        setEtapaAtual(0);
        setRespostas({});
        setMostraPainel(false);
        setBloqueado(false);
        setFinalizado(false);
        setMostraDigitando(false);
        setFluxo(FLUXO_BASE);

        async function reiniciarFluxo() {
            await esperar(300);
            await exibirMensagemIA(FLUXO_BASE[0].mensagem);
            setMostraPainel(true);
        }
        reiniciarFluxo();
    };

    const etapasRespondidas = Object.keys(respostas).length;

    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeSlideIn { animation: fadeSlideIn 0.35s ease-out both; }
            `}</style>

            <div className="min-h-screen bg-slate-950 flex flex-col">
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 -left-32 w-72 h-72 bg-violet-600/6 rounded-full blur-3xl" />
                </div>

                <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
                    <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                                <Sparkles size={13} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold leading-none">Tech Tendence</p>
                                <p className="text-slate-500 text-[10px] mt-0.5">Mapeamento de perfil</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {etapasRespondidas > 0 && !finalizado && (
                                <button onClick={reiniciar} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors duration-200">
                                    <RotateCcw size={12} />
                                    Reiniciar
                                </button>
                            )}
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-emerald-400 text-[10px] font-medium">Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-2xl mx-auto px-4 pb-3">
                        <BarraProgresso atual={etapasRespondidas} total={fluxo.length} />
                    </div>
                </header>

                <main className="relative z-10 flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
                        {historico.map((msg, i) =>
                            msg.tipo === "ia" ? (
                                <BolhaIA key={i} texto={msg.texto} />
                            ) : (
                                <BolhaUsuario key={i} texto={msg.texto} />
                            )
                        )}

                        {mostraDigitando && <BolhaIA digitando />}

                        {mostraPainel && !finalizado && perguntaAtual && (
                            <PainelOpcoes pergunta={perguntaAtual} onResponder={handleResposta} bloqueado={bloqueado} />
                        )}

                        {finalizado && (
                            <div className="flex justify-center py-6 animate-fadeSlideIn">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-slate-500 text-xs">Gerando sua análise...</p>
                                </div>
                            </div>
                        )}

                        <div ref={fimRef} className="h-1" />
                    </div>
                </main>

                <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
                    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                        <p className="text-slate-600 text-[11px]">
                            {finalizado
                                ? "Processando seus dados..."
                                : mostraPainel && perguntaAtual?.tipo === "multipla"
                                    ? "Selecione uma ou mais opções e confirme"
                                    : "Selecione uma das opções acima"}
                        </p>
                        <p className="text-slate-700 text-[11px] tabular-nums">
                            Etapa {Math.min(etapasRespondidas + 1, fluxo.length)}/{fluxo.length}
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}