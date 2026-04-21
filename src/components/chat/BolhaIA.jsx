import { Sparkles } from "lucide-react";

export default function BolhaIA({ texto, digitando = false }) {
    return (
        <div className="flex items-start gap-3 animate-fadeSlideIn">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center mt-0.5">
                <Sparkles size={14} className="text-indigo-400" />
            </div>
            <div className="max-w-[78%]">
                <p className="text-[11px] text-slate-500 font-medium mb-1.5 ml-1">Tech Tendence IA</p>
                <div className="bg-slate-800/70 border border-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-200 text-sm leading-relaxed">
                    {digitando ? (
                        <span className="flex items-center gap-1.5 h-5">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                    ) : (
                        texto
                    )}
                </div>
            </div>
        </div>
    );
}