import { useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";

export default function InputAdicionar({ onAdicionar }) {
    const [valor, setValor] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const adicionar = () => {
        const limpo = valor.trim();
        if (!limpo) return;
        onAdicionar(limpo);
        setValor("");
        inputRef.current?.focus();
    };

    return (
        <div className="flex items-center gap-2 animate-fadeSlideIn">
            <input
                ref={inputRef}
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && adicionar()}
                placeholder="Digite e clique em Adicionar..."
                className="flex-1 bg-slate-800/80 border border-slate-600/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-slate-800 transition-all duration-200"
            />
            <button
                onClick={adicionar}
                disabled={!valor.trim()}
                className="flex items-center gap-1.5 px-4 h-10 flex-shrink-0 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all duration-200 active:scale-95 whitespace-nowrap"
            >
                <Check size={13} />
                Adicionar
            </button>
        </div>
    );
}