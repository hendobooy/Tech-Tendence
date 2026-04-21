import { useState } from "react";
import { TrendingUp, Zap, BookOpen, Star, ChevronRight, ChevronDown, CheckCircle2, Target } from "lucide-react";

const ICON_MAP = { TrendingUp, Zap, BookOpen, Star };

const COR_ICONE = {
    indigo: "bg-indigo-500/20 text-indigo-400",
    violet: "bg-violet-500/20 text-violet-400",
    purple: "bg-purple-500/20 text-purple-400",
    fuchsia: "bg-fuchsia-500/20 text-fuchsia-400",
};

const PRIORIDADE_STYLES = {
    Alta: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    Média: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

export default function RecomendacaoCard({ item }) {
    const [expandido, setExpandido] = useState(false);
    const Icone = ICON_MAP[item.icone] || Star;

    return (
        <div
            className={`flex flex-col bg-slate-800/50 border border-slate-700/40 rounded-2xl transition-all duration-300 group ${expandido ? 'border-indigo-500/40 bg-slate-800/70' : 'hover:border-indigo-500/40 hover:bg-slate-800/70'}`}
        >
            {/* Header do Card (Área clicável) */}
            <div
                onClick={() => setExpandido(!expandido)}
                className="flex items-start gap-4 p-5 cursor-pointer"
            >
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${COR_ICONE[item.cor]}`}>
                    <Icone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 className="text-white font-semibold text-sm group-hover:text-indigo-300 transition-colors">{item.titulo}</h4>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${PRIORIDADE_STYLES[item.prioridade]}`}>
                            {item.prioridade}
                        </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.descricao}</p>
                    <p className="text-indigo-400/70 text-xs mt-2 font-medium">Tempo estimado: {item.tempo}</p>
                </div>
                {expandido ? (
                    <ChevronDown size={16} className="text-indigo-400 flex-shrink-0 mt-1 transition-transform" />
                ) : (
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-transform" />
                )}
            </div>

            {/* Área Expandida: Roadmap Timeline */}
            {expandido && item.roadmap && item.roadmap.length > 0 && (
                <div className="px-5 pb-6 pt-3 border-t border-slate-700/40 animate-fadeSlideIn">
                    <h5 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Target size={16} className="text-indigo-400" />
                        Plano de Ação Sugerido
                    </h5>

                    <div className="relative border-l-2 border-indigo-500/20 ml-2.5 space-y-6 pb-2">
                        {item.roadmap.map((etapa, idx) => (
                            <div key={idx} className="relative flex items-start group/step">
                                {/* Ponto da Timeline */}
                                <div className="absolute -left-[11px] mt-1.5 w-5 h-5 rounded-full bg-slate-950 border-2 border-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.3)] group-hover/step:shadow-[0_0_16px_rgba(99,102,241,0.6)] group-hover/step:scale-110 transition-all duration-300 z-10">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                </div>

                                {/* Conteúdo da Etapa */}
                                <div className="ml-8 w-full bg-gradient-to-br from-slate-800/80 to-slate-900/50 rounded-xl p-4 border border-slate-700/40 shadow-lg hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden">
                                    {/* Efeito de brilho interno no hover */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover/step:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="flex items-center justify-between mb-2 relative z-10">
                                        <span className="text-xs font-bold bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-500/20">
                                            Semana {etapa.semana}
                                        </span>
                                        {etapa.impacto && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <TrendingUp size={10} />
                                                Impacto {etapa.impacto}
                                            </span>
                                        )}
                                    </div>
                                    <h6 className="text-sm text-slate-100 font-semibold mb-3 relative z-10 leading-snug">{etapa.titulo}</h6>

                                    {/* Lista de Recursos */}
                                    {etapa.recursos && etapa.recursos.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                                            {etapa.recursos.map((rec, rIdx) => {
                                                // Dados garantidos do banco (Node.js injeta diretamente)
                                                const nomeCurso = rec.nome || rec.nome_curso || (typeof rec === 'string' ? rec : 'Curso');
                                                const linkCurso = rec.url || rec.link || null;
                                                const tipo = rec.tipo || rec.tipo_curso || null;
                                                const carga = rec.carga_horaria || null;

                                                const badgeLabel = [tipo, carga ? `${carga}h` : null].filter(Boolean).join(' · ');

                                                if (linkCurso) {
                                                    return (
                                                        <a
                                                            key={rIdx}
                                                            href={linkCurso}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex flex-col gap-0.5 text-[11px] font-medium text-slate-300 bg-slate-950/50 px-2.5 py-2 rounded-lg border border-slate-700/50 hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30 cursor-pointer transition-all duration-200 decoration-transparent max-w-[240px]"
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                <CheckCircle2 size={12} className="text-indigo-500/70 flex-shrink-0" />
                                                                <span className="truncate">{nomeCurso}</span>
                                                            </span>
                                                            {badgeLabel && (
                                                                <span className="text-[9px] text-slate-500 pl-[18px]">{badgeLabel}</span>
                                                            )}
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <span key={rIdx} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-700/30 cursor-default">
                                                        <CheckCircle2 size={12} className="text-slate-600/70" />
                                                        {nomeCurso}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}