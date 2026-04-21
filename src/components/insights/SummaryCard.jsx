export default function SummaryCard({ icone: Icone, label, valor, sub, corFundo, corIcone }) {
    return (
        <div className="flex-1 min-w-0 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${corFundo}`}>
                    <Icone size={18} className={corIcone} />
                </div>
                <span className="text-slate-500 text-xs font-medium tracking-widest uppercase">{label}</span>
            </div>
            <p className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 group-hover:text-indigo-300 transition-colors ${valor === "Não Especificado" ? "text-slate-400 text-xl" : "text-white"}`}>
                {valor}
            </p>
            {sub && <p className="text-slate-400 text-xs">{sub}</p>}
        </div>
    );
}