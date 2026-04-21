import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Sparkles, User, Trash2, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function FloatingChat() {
    const [chatAberto, setChatAberto] = useState(false);
    const [mensagens, setMensagens] = useState([]);
    const [input, setInput] = useState("");
    const [digitando, setDigitando] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);
    const fimRef = useRef(null);

    // Carrega histórico, perfil inicial e verifica banimento
    useEffect(() => {
        if (localStorage.getItem("tech_tendence_ban") === "true") {
            setBloqueado(true);
        }

        const historicoSalvo = localStorage.getItem("tech_tendence_chat");
        if (historicoSalvo) {
            setMensagens(JSON.parse(historicoSalvo));
        } else {
            setMensagens([{ role: "assistant", content: "Olá! Sou seu mentor de carreira. Como posso te ajudar com seu perfil hoje?" }]);
        }
    }, []);

    // Salva histórico a cada nova mensagem
    useEffect(() => {
        if (mensagens.length > 0) {
            localStorage.setItem("tech_tendence_chat", JSON.stringify(mensagens));
        }
        fimRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensagens, chatAberto]);

    const limparHistorico = () => {
        if (bloqueado) return;
        localStorage.removeItem("tech_tendence_chat");
        setMensagens([{ role: "assistant", content: "Histórico limpo! Como posso te ajudar agora?" }]);
    };

    const enviarMensagem = async () => {
        if (!input.trim() || digitando || bloqueado) return;

        const novaMensagem = { role: "user", content: input.trim() };
        const novoHistorico = [...mensagens, novaMensagem];

        setMensagens(novoHistorico);
        setInput("");
        setDigitando(true);

        const perfilSalvo = localStorage.getItem("tech_tendence_perfil");
        const perfil = perfilSalvo ? JSON.parse(perfilSalvo) : null;

        try {
            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

            const response = await fetch(`${baseUrl}/api/chat-ia`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ mensagens: novoHistorico, perfil })
            });

            const data = await response.json();

            if (data.resposta) {
                // Interceptação de Segurança
                if (data.resposta.includes("PROMPT_INJECTED")) {
                    localStorage.setItem("tech_tendence_ban", "true");
                    setBloqueado(true);
                    setMensagens((prev) => [...prev, {
                        role: "assistant",
                        content: "⚠️ ACESSO REVOGADO. Tentativa de manipulação detectada. O chat foi desabilitado permanentemente por violação de segurança."
                    }]);
                } else {
                    setMensagens((prev) => [...prev, { role: "assistant", content: data.resposta }]);
                }
            }
        } catch (error) {
            console.error("Erro no chat:", error);
            setMensagens((prev) => [...prev, { role: "assistant", content: "Ops, falha na conexão. Tente novamente." }]);
        } finally {
            setDigitando(false);
        }
    };



    return (
        <>
            {/* Painel do Chat */}
            <div className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 h-[80dvh] sm:h-[600px] w-full sm:w-[400px] bg-slate-900/95 backdrop-blur-2xl border border-slate-700/60 sm:rounded-2xl rounded-t-2xl flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out origin-bottom-right ${chatAberto ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 sm:translate-y-0 opacity-0 scale-95 pointer-events-none"}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-transparent">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-inner ${bloqueado ? "bg-red-500/10 border-red-500/30" : "bg-indigo-600/20 border-indigo-500/30"}`}>
                            {bloqueado ? <ShieldAlert size={18} className="text-red-400" /> : <Sparkles size={18} className="text-indigo-400" />}
                        </div>
                        <div>
                            <h3 className="text-slate-100 text-sm font-semibold tracking-wide">Mentor Tech</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${bloqueado ? "bg-red-500" : "bg-emerald-400 animate-pulse"}`} />
                                <span className={`text-[10px] font-medium tracking-wider uppercase ${bloqueado ? "text-red-400" : "text-emerald-400"}`}>
                                    {bloqueado ? "Offline (Bloqueado)" : "Online"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={limparHistorico} disabled={bloqueado} className={`p-2 rounded-xl transition-all ${bloqueado ? "text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"}`} title="Limpar conversa">
                            <Trash2 size={18} />
                        </button>
                        <button onClick={() => setChatAberto(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Fechar chat">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body (Mensagens) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {mensagens.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-3 animate-fadeSlideIn ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className={`w-8 h-8 rounded-xl border flex-shrink-0 flex items-center justify-center mt-1 ${msg.content.includes("ACESSO REVOGADO") ? "bg-red-500/20 border-red-500/40" : "bg-indigo-600/30 border-indigo-500/40"}`}>
                                    {msg.content.includes("ACESSO REVOGADO") ? <ShieldAlert size={14} className="text-red-400" /> : <Sparkles size={14} className="text-indigo-400" />}
                                </div>
                            )}
                            <div className={`px-4 py-3 rounded-2xl max-w-[82%] text-[13px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : msg.content.includes("ACESSO REVOGADO") ? "bg-red-500/10 text-red-300 border border-red-500/30 rounded-tl-sm" : "bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50 backdrop-blur-sm"}`}>
                                {msg.content.includes("ACESSO REVOGADO") || msg.role === "user" ? (
                                    msg.content
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/50 underline-offset-2 font-semibold transition-colors" />,
                                            p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                                            ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 mb-2 space-y-1" />,
                                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 mb-2 space-y-1" />,
                                            li: ({ node, ...props }) => <li {...props} className="leading-relaxed" />,
                                            strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-indigo-200" />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-xl bg-slate-700/60 border border-slate-600/40 flex-shrink-0 flex items-center justify-center mt-1">
                                    <User size={14} className="text-slate-400" />
                                </div>
                            )}
                        </div>
                    ))}
                    {digitando && (
                        <div className="flex items-start gap-3 animate-fadeSlideIn">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center mt-1">
                                <Sparkles size={14} className="text-indigo-400" />
                            </div>
                            <div className="px-4 py-4 rounded-2xl bg-slate-800/80 rounded-tl-sm border border-slate-700/50 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </div>
                    )}
                    <div ref={fimRef} className="h-1" />
                </div>

                {/* Footer (Input) */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
                            placeholder={bloqueado ? "Chat indisponível (Segurança)" : "Pergunte ao seu mentor..."}
                            disabled={bloqueado || digitando}
                            className={`w-full border rounded-xl pl-4 pr-12 py-3.5 text-sm transition-all shadow-inner focus:outline-none 
                                ${bloqueado
                                    ? "bg-slate-800/40 border-slate-700/40 text-slate-500 cursor-not-allowed placeholder-slate-600"
                                    : "bg-slate-800/80 border-slate-600/50 text-slate-200 placeholder-slate-400 focus:border-indigo-500/80 focus:bg-slate-800"
                                }`}
                        />
                        <button
                            onClick={enviarMensagem}
                            disabled={!input.trim() || digitando || bloqueado}
                            className={`absolute right-2 p-2.5 rounded-lg transition-all duration-200 ${bloqueado ? "text-slate-600 cursor-not-allowed bg-transparent" : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-0 disabled:scale-75"}`}
                        >
                            <Send size={16} className={bloqueado ? "" : "-ml-0.5 mt-0.5"} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Botão Flutuante (FAB) */}
            <button onClick={() => setChatAberto(true)} className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.4)] flex items-center justify-center transition-all duration-300 active:scale-95 ${bloqueado ? "bg-red-900/50 border border-red-500/30" : "bg-indigo-600 hover:bg-indigo-500"} ${chatAberto ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"}`}>
                {bloqueado ? <ShieldAlert size={24} className="text-red-400" /> : <MessageCircle size={24} className="text-white" />}
                {!chatAberto && !bloqueado && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />}
            </button>
        </>
    );
}