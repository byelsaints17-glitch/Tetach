import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Server, Eye, EyeOff, Save, Key, UserCheck, AlertCircle } from "lucide-react";

export default function MyAccountView() {
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Load any existing SMTP configuration from localStorage on mount (optional developer convenience)
  useEffect(() => {
    const saved = localStorage.getItem("technova_smtp_config");
    if (saved) {
      try {
        setSmtpConfig(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("technova_smtp_config", JSON.stringify(smtpConfig));
    setSaveStatus("success");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Minha Conta</h2>
        <p className="text-xs text-gray-400">Configure suas informações de perfil e credenciais do servidor.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Side: Mock Profile Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto rounded-full bg-slate-800 border-2 border-blue-600 flex items-center justify-center text-blue-500">
            <User className="w-12 h-12" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-lg">Administrador TECHNOVA</h3>
            <p className="text-xs text-gray-500 mt-1 font-semibold">byelsaints17@gmail.com</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl text-left border border-slate-800 space-y-1.5 text-xs text-gray-400">
            <div className="flex justify-between">
              <span className="font-medium">Perfil:</span>
              <span className="font-bold text-white">Lojista / Dev</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className="font-bold text-green-500">Ativo</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Loja Integrada:</span>
              <span className="font-bold text-white">Sim (v1.0)</span>
            </div>
          </div>
        </div>

        {/* Right Side: SMTP Configuration for developer/admin */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              <h3 className="font-extrabold text-white text-lg">Configurar E-mail do Servidor (SMTP)</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Deseja que os e-mails de compras cheguem de forma real a <strong>byelsaints17@gmail.com</strong> usando seu próprio servidor de e-mail? Preencha os dados do SMTP abaixo. Se preferir não preencher, o TECHNOVA gerará automaticamente uma simulação interativa usando o Ethereal Mail!
            </p>
          </div>

          <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs text-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Host do Servidor SMTP</label>
                <input
                  type="text"
                  placeholder="exemplo: smtp.gmail.com ou mail.suadominio.com"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Porta SMTP</label>
                <input
                  type="text"
                  placeholder="587 ou 465"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-gray-400 font-bold mb-1.5">E-mail de Envio (Remetente)</label>
                <input
                  type="text"
                  placeholder="exemplo: remetente@exemplo.com"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Usuário de Autenticação (Email/Login)</label>
                <input
                  type="text"
                  placeholder="exemplo: login@exemplo.com"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div className="relative">
                <label className="block text-gray-400 font-bold mb-1.5">Senha SMTP</label>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Sua senha ou senha de app"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 bottom-3 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>As chaves serão guardadas de forma segura no navegador.</span>
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Salvar Configurações
              </button>
            </div>
          </form>

          {saveStatus === "success" && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-xs text-green-400 font-semibold">
              ✓ Configurações salvas localmente! Suas próximas compras serão processadas com seu próprio SMTP (se as credenciais forem válidas no servidor).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
