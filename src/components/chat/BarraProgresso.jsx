export default function BarraProgresso({ atual, total }) {
    const pct = Math.round((atual / total) * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[11px] text-slate-500 font-medium tabular-nums w-10 text-right">
                {atual}/{total}
            </span>
        </div>
    );
}