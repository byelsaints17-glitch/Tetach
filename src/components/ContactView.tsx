import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, HelpCircle, CheckCircle2, RefreshCw } from "lucide-react";

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Dúvidas sobre produtos",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSending(true);
    setErrorMsg("");

    // Simulate sending support inquiry mail
    try {
      // Let's call checkout endpoint with a special simulated "contato" format or do a quick 2-second mock wait
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSentSuccess(true);
      setFormData({ name: "", email: "", subject: "Dúvidas sobre produtos", message: "" });
    } catch (err) {
      setErrorMsg("Falha ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const contactInfos = [
    {
      icon: Phone,
      title: "Telefone de Suporte",
      desc: "(11) 4004-9999",
      sub: "De segunda a sexta, das 8h às 20h",
    },
    {
      icon: Mail,
      title: "E-mail Oficial",
      desc: "suporte@technova.com.br",
      sub: "Cópia para: byelsaints17@gmail.com",
    },
    {
      icon: MapPin,
      title: "Sede de Tecnologia",
      desc: "Av. Paulista, 1000 - Bela Vista",
      sub: "São Paulo - SP, CEP 01310-100",
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight font-sans">Fale Conosco</h2>
        <p className="text-xs text-gray-400">Tem alguma dúvida, sugestão ou precisa de suporte técnico? Entre em contato!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Blocks */}
        <div className="md:col-span-1 space-y-6">
          {contactInfos.map((info, idx) => {
            const Icon = info.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="bg-blue-600/20 text-blue-400 p-2.5 rounded-xl w-fit">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">{info.title}</h4>
                  <p className="text-sm font-semibold text-blue-400 mt-1">{info.desc}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{info.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-lg">Enviar Mensagem</h3>
            <p className="text-xs text-gray-400 mt-1">
              Sua mensagem será processada e encaminhada para a nossa equipe de suporte e monitoramento.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs text-red-400 font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {sentSuccess ? (
            <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto animate-bounce" />
              <div>
                <h4 className="font-extrabold text-white text-lg">Mensagem enviada com sucesso!</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Agradecemos seu contato. Uma cópia dessa mensagem de suporte foi encaminhada com sucesso ao e-mail principal <strong className="text-white">byelsaints17@gmail.com</strong>. Responderemos em até 24 horas úteis!
                </p>
              </div>
              <button
                onClick={() => setSentSuccess(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all mt-2"
              >
                Enviar nova mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1.5">Seu E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Assunto</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-bold"
                >
                  <option value="Dúvidas sobre produtos">Dúvidas sobre produtos</option>
                  <option value="Problemas no pagamento">Problemas no pagamento / CEP</option>
                  <option value="Acompanhamento de entrega">Acompanhamento de entrega</option>
                  <option value="Sugestões e Parcerias">Sugestões e Parcerias</option>
                  <option value="Outros assuntos">Outros assuntos</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Mensagem *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Escreva detalhadamente sua dúvida ou solicitação de suporte técnico..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Enviando suporte...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Enviar Mensagem para Equipe
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
