import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Aqui nós "importamos" as telas que você exportou!
import ChatInterface from './screens/ChatInterface';
import InsightsResult from './screens/InsightsResult';

export default function App() {
  const [dadosIA, setDadosIA] = useState(() => {
    const savedData = localStorage.getItem('@TechTendence:dadosIA');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const navigate = useNavigate();

  const finalizarChat = async (perfilData) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const resposta = await fetch(`${baseUrl}/api/gerar-insights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(perfilData)
      });

      if (!resposta.ok) {
        throw new Error("Erro na resposta do servidor");
      }

      const dadosProcessados = await resposta.json();
      setDadosIA(dadosProcessados);
      localStorage.setItem('@TechTendence:dadosIA', JSON.stringify(dadosProcessados));

      // Redireciona para a rota de insights
      navigate('/insights');

    } catch (erro) {
      console.error("Falha na API:", erro);
      alert("Ops! Tivemos um problema na conexão com a IA.\nPor favor, faça o preenchimento novamente.");
      window.location.reload();
    }
  };

  const resetarPerfil = () => {
    setDadosIA(null);
    localStorage.removeItem('@TechTendence:dadosIA');
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Routes>
        <Route path="/" element={<Navigate to={dadosIA ? "/insights" : "/chat"} replace />} />
        <Route path="/chat" element={<ChatInterface onComplete={finalizarChat} />} />
        <Route path="/insights" element={
          dadosIA ? <InsightsResult dados={dadosIA} onReset={resetarPerfil} /> : <Navigate to="/chat" replace />
        } />
      </Routes>
    </div>
  );
}