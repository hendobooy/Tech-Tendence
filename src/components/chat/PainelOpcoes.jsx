import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import InputAdicionar from "./InputAdicionar";

export default function PainelOpcoes({ pergunta, onResponder, bloqueado }) {
    const [selecionadas, setSelecionadas] = useState([]);
    const [customizadas, setCustomizadas] = useState([]);
    const [mostrarInput, setMostrarInput] = useState(false);

    const isMultipla = pergunta.tipo === "multipla";
    const modoAcumula = isMultipla || mostrarInput;
    const totalSeleção = selecionadas.length + customizadas.length;
    const podeConfirmar = !bloqueado && totalSeleção > 0 && (isMultipla || mostrarInput);

    const toggleOpcao = (opcao) => {
        if (bloqueado) return;
        if (opcao === "Outro") {
            setMostrarInput(true);
            return;
        }
        if (!modoAcumula) {
            onResponder([opcao]);
            return;
        }
        setSelecionadas((prev) =>
            prev.includes(opcao) ? prev.filter((o) => o !== opcao) : [...prev, opcao]
        );
    };

    const handleAdicionar = (val) => {
        if (!customizadas.includes(val)) {
            setCustomizadas((prev) => [...prev, val]);
        }
    };

    const removerCustom = (val) => {
        setCustomizadas((prev) => prev.filter((v) => v !== val));
    };

    const confirmar = () => {
        if (totalSeleção === 0) return;
        onResponder([...selecionadas, ...customizadas]);
    };

    return (
        <div className="space-y-3 animate-fadeSlideIn">
            {isMultipla && pergunta.dica && (
                <p className="text-[11px] text-slate-500 ml-11">{pergunta.dica}</p>
            )}
            <div className="flex flex-wrap gap-2 ml-11">
                {pergunta.opcoes.map((opcao) => {
                    const ativa = selecionadas.includes(opcao);
                    const éOutro = opcao === "Outro";
                    const outroCometido = éOutro && mostrarInput;
                    return (
                        <button
                            key={opcao}
                            onClick={() => toggleOpcao(opcao)}
                            disabled={bloqueado}
                            className={`relative px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 active:scale-95 disabled:cursor-default ${ativa || outroCometido
                                ? "bg-indigo-600/30 border-indigo-500/60 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                                : "bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/60 hover:border-slate-600/60 hover:text-white"
                                } ${bloqueado ? "opacity-40" : ""}`}
                        >
                            {(ativa || outroCometido) && (
                                <Check size={12} className="inline mr-1.5 text-indigo-300" />
                            )}
                            {opcao}
                        </button>
                    );
                })}
            </div>

            {customizadas.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-11">
                    {customizadas.map((val) => (
                        <span key={val} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-violet-600/25 border border-violet-500/40 text-violet-200">
                            {val}
                            {!bloqueado && (
                                <button onClick={() => removerCustom(val)} className="ml-0.5 text-violet-400 hover:text-violet-200 transition-colors leading-none">
                                    ×
                                </button>
                            )}
                        </span>
                    ))}
                </div>
            )}

            {mostrarInput && !bloqueado && (
                <div className="ml-11">
                    <InputAdicionar onAdicionar={handleAdicionar} />
                </div>
            )}

            {podeConfirmar && (
                <div className="ml-11">
                    <button onClick={confirmar} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-900/30">
                        Confirmar seleção
                        <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}