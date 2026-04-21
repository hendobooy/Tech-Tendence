import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, DollarSign, BarChart2, Sparkles } from "lucide-react";
import { CustomTooltip, SummaryCard, RecomendacaoCard } from "../components/index.js";
import { useEffect } from "react";
import FloatingChat from "../components/insights/FloatingChat.jsx";


const BAR_COLORS = ["#6366f1", "#7c3aed", "#8b5cf6", "#a78bfa", "#818cf8", "#6d28d9", "#c4b5fd", "#ddd6fe"];


export default function InsightsResult({ dados, onReset }) {

    // --- SINCRONIZANDO O MENTOR ---
    useEffect(() => {
        if (dados) {
            localStorage.setItem("tech_tendence_perfil", JSON.stringify(dados));
        }
    }, [dados]);
    if (!dados) return null;

    const formatarMoeda = (v) => {
        if (!v || v === 0) return "Não Especificado";
        return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    };

    // --- LÓGICA DE DADOS DENTRO DO COMPONENTE ---
    const isSemDados = dados.vagasDisponiveis === "Sem Dados" || dados.vagasDisponiveis === 0;

    const vagasSub = isSemDados ? "Base de dados em atualização" : "vagas disponíveis no mercado";
    const valorVagas = isSemDados ? "Sem Dados" : dados.vagasDisponiveis;

    let salarioSub = "";
    if (dados.salario?.piso > 0 && dados.salario?.teto > 0) {
        salarioSub = `${formatarMoeda(dados.salario.piso)} – ${formatarMoeda(dados.salario.teto)}`;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 py-10 space-y-8">
                <header className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-indigo-400" />
                            <span className="text-indigo-400 text-xs font-semibold tracking-widest uppercase">Tech Tendence</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Análise Completa</h1>
                        <p className="text-slate-400 text-sm mt-1">Atualizado com inteligência artificial</p>
                    </div>
                    {onReset && (
                        <button onClick={onReset} className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50 hover:border-indigo-500/50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-indigo-500/10">
                            Refazer Perfil
                        </button>
                    )}
                </header>

                <section className="flex flex-col sm:flex-row gap-4">
                    <SummaryCard icone={Target} label="Compatibilidade" valor={`${dados.compatibilidade}%`} sub={`com vagas de ${dados.salario.cargo}`} corFundo="bg-indigo-500/20" corIcone="text-indigo-400" />
                    <SummaryCard icone={DollarSign} label="Faixa Salarial" valor={formatarMoeda(dados.salario.media)} sub={salarioSub} corFundo="bg-violet-500/20" corIcone="text-violet-400" />
                    <SummaryCard icone={BarChart2} label="Vagas Analisadas" valor={valorVagas} sub={vagasSub} corFundo="bg-purple-500/20" corIcone="text-purple-400" />
                </section>

                <section className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-white">O que o mercado está pedindo</h2>
                        <p className="text-slate-400 text-xs mt-0.5">Número de menções da tecnologia nas vagas analisadas</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dados.techs} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="nome" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />

                            {/* GRÁFICO DINÂMICO (dataMax em vez de 100) */}
                            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 'dataMax']} allowDecimals={false} />

                            {/* ENVIANDO O TOTAL DE VAGAS PARA O TOOLTIP */}
                            <Tooltip content={<CustomTooltip totalVagas={dados.vagasDisponiveis} />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />

                            <Bar dataKey="demanda" radius={[6, 6, 0, 0]}>
                                {dados.techs.map((entry, index) => (
                                    <Cell key={entry.nome} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Recomendações para você</h2>
                            <p className="text-slate-400 text-xs mt-0.5">Priorizado com base nas lacunas do seu perfil</p>
                        </div>
                        <span className="text-slate-500 text-xs bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                            {dados.recomendacoes.length} ações
                        </span>
                    </div>
                    <div className="space-y-3">
                        {dados.recomendacoes.map((item) => (
                            <RecomendacaoCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            </div>
            <FloatingChat />
        </div>
    );
}