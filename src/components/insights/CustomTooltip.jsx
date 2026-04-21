export default function CustomTooltip({ active, payload, label, totalVagas }) {
    if (!active || !payload?.length) return null;
    const divisor = totalVagas === "Sem Dados" ? 0 : totalVagas;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl">
            <p className="text-slate-300 text-xs mb-1">{label}</p>
            <p className="text-indigo-400 font-semibold text-lg">
                {payload[0].value}
                <span className="text-slate-400 text-xs font-normal ml-1">/ {divisor} vagas</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">{payload[0].payload.status}</p>
        </div>
    );
}