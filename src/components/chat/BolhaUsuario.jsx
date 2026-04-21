import { User } from "lucide-react";

export default function BolhaUsuario({ texto }) {
    return (
        <div className="flex items-start gap-3 justify-end animate-fadeSlideIn">
            <div className="max-w-[78%]">
                <p className="text-[11px] text-slate-500 font-medium mb-1.5 mr-1 text-right">Você</p>
                <div className="bg-indigo-600/25 border border-indigo-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-indigo-100 text-sm leading-relaxed">
                    {texto}
                </div>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center mt-0.5">
                <User size={14} className="text-slate-400" />
            </div>
        </div>
    );
}