import React, { useState, useEffect } from "react";
import { 
  User, ShieldCheck, Mail, Server, Eye, EyeOff, Save, Key, 
  UserCheck, AlertCircle, LogOut, Plus, Trash2, Search, 
  Shield, UserPlus, Lock, CheckCircle, Smartphone 
} from "lucide-react";
import { motion } from "motion/react";
import { UserAccount } from "../types";
import { 
  getLocalUsers, 
  saveLocalUser, 
  deleteLocalUser, 
  getLocalCurrentUser, 
  setLocalCurrentUser 
} from "../utils/localDb";

export default function MyAccountView() {
  // Current user session state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  
  // Auth view states: "login" or "register"
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Form states
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Admin section: registered users/creators list
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New user creation modal (from admin list)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdminUserName, setNewAdminUserName] = useState("");
  const [newAdminUserEmail, setNewAdminUserEmail] = useState("");
  const [newAdminUserPassword, setNewAdminUserPassword] = useState("");
  const [newAdminUserRole, setNewAdminUserRole] = useState<"admin" | "cliente">("cliente");

  // SMTP config state (kept as developer value add)
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [smtpSaveStatus, setSmtpSaveStatus] = useState("");

  // Load state on mount
  useEffect(() => {
    // Current user session
    const activeUser = getLocalCurrentUser();
    setCurrentUser(activeUser);

    // SMTP configuration
    const savedSmtp = localStorage.getItem("technova_smtp_config");
    if (savedSmtp) {
      try {
        setSmtpConfig(JSON.parse(savedSmtp));
      } catch (e) {
        console.error(e);
      }
    }

    // Load registered accounts
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch users from API, using localStorage database fallback.", err);
    }
    setUsersList(getLocalUsers());
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (authMode === "register") {
      if (!nameInput.trim() || !emailInput.trim() || !passwordInput.trim()) {
        setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
        setIsLoading(false);
        return;
      }

      const payload = {
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        role: "cliente" as const
      };

      let apiSavedUser = null;
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          apiSavedUser = data.user;
        } else {
          const err = await res.json();
          setErrorMessage(err.error || "Ocorreu um erro ao criar a conta.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend registration failed, using localStorage database.", err);
      }

      // Check duplicate locally
      const localUsers = getLocalUsers();
      const duplicate = localUsers.find(u => u.email.toLowerCase() === emailInput.toLowerCase().trim());
      if (duplicate && !apiSavedUser) {
        setErrorMessage("Este e-mail já está em uso localmente.");
        setIsLoading(false);
        return;
      }

      // Save to localStorage
      const userToSave = apiSavedUser || saveLocalUser({
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        role: "cliente"
      });

      // Automatically log in
      setLocalCurrentUser(userToSave);
      setCurrentUser(userToSave);
      setSuccessMessage("Conta criada com sucesso! Seja bem-vindo à TECHNOVA.");
      fetchUsers();
    } else {
      // LOGIN
      if (!emailInput.trim() || !passwordInput.trim()) {
        setErrorMessage("Preencha o e-mail e a senha para entrar.");
        setIsLoading(false);
        return;
      }

      let apiLoggedInUser = null;
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailInput, password: passwordInput })
        });

        if (res.ok) {
          const data = await res.json();
          apiLoggedInUser = data.user;
        } else if (res.status === 401 || res.status === 400) {
          const err = await res.json();
          setErrorMessage(err.error || "E-mail ou senha incorretos.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("API login failed, logging in via localStorage fallback.", err);
      }

      if (apiLoggedInUser) {
        setLocalCurrentUser(apiLoggedInUser);
        setCurrentUser(apiLoggedInUser);
        setSuccessMessage("Login realizado com sucesso! Bem-vindo de volta.");
      } else {
        // Local check fallback
        const localUsers = getLocalUsers();
        const matched = localUsers.find(
          u => u.email.toLowerCase() === emailInput.toLowerCase().trim() && u.password === passwordInput
        );

        if (matched) {
          setLocalCurrentUser(matched);
          setCurrentUser(matched);
          setSuccessMessage("Login realizado com sucesso! Bem-vindo de volta.");
        } else {
          setErrorMessage("E-mail ou senha incorretos. Por favor, tente novamente.");
        }
      }
    }

    setIsLoading(false);
  };

  // Log out
  const handleLogout = () => {
    setLocalCurrentUser(null);
    setCurrentUser(null);
    setNameInput("");
    setEmailInput("");
    setPasswordInput("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Add account from Admin interface
  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUserName.trim() || !newAdminUserEmail.trim() || !newAdminUserPassword.trim()) {
      alert("Preencha todos os campos do formulário.");
      return;
    }

    const payload = {
      name: newAdminUserName,
      email: newAdminUserEmail,
      password: newAdminUserPassword,
      role: newAdminUserRole
    };

    let apiSaved = null;
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        apiSaved = data.user;
      }
    } catch (err) {
      console.warn("API registration failed inside admin panel, saving locally.");
    }

    // Save locally
    saveLocalUser({
      name: newAdminUserName,
      email: newAdminUserEmail,
      password: newAdminUserPassword,
      role: newAdminUserRole
    });

    alert("Conta de usuário criada com sucesso no banco de dados!");
    setShowCreateModal(false);
    setNewAdminUserName("");
    setNewAdminUserEmail("");
    setNewAdminUserPassword("");
    fetchUsers();
  };

  // Delete account
  const handleDeleteUser = async (id: string) => {
    if (id === "user-admin") {
      alert("Não é permitido remover a conta de administrador padrão.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta conta de usuário permanentemente?")) {
      return;
    }

    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "DELETE"
      });
    } catch (err) {
      console.warn("API user deletion failed, removing locally.");
    }

    deleteLocalUser(id);
    fetchUsers();
  };

  // Save SMTP settings
  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("technova_smtp_config", JSON.stringify(smtpConfig));
    setSmtpSaveStatus("success");
    setTimeout(() => setSmtpSaveStatus(""), 4000);
  };

  // Filter accounts
  const filteredUsers = usersList.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Banco de Dados de Contas</h2>
        <p className="text-xs text-gray-400">Sistema completo de cadastro, login e gerenciamento de contas de usuário.</p>
      </div>

      {!currentUser ? (
        /* ================= AUTHENTICATION MODAL ================= */
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="text-center mb-6 space-y-2">
            <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              {authMode === "login" ? <Lock className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
            </div>
            <h3 className="text-xl font-extrabold text-white">
              {authMode === "login" ? "Acesse sua Conta" : "Crie uma Nova Conta"}
            </h3>
            <p className="text-xs text-gray-400">
              {authMode === "login" 
                ? "Entre para salvar seus pedidos e gerenciar suas preferências." 
                : "Cadastre-se rapidamente no nosso banco de dados unificado."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-10 rounded-xl text-white text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Endereço de E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="voce@exemplo.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-10 rounded-xl text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Senha Secreta</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-10 pr-10 rounded-xl text-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50"
            >
              {isLoading ? "Processando..." : authMode === "login" ? "Entrar na Conta" : "Criar Minha Conta"}
            </button>
          </form>

          <div className="border-t border-slate-800/80 mt-6 pt-4 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-bold"
            >
              {authMode === "login" 
                ? "Não possui uma conta? Cadastre-se agora" 
                : "Já possui uma conta criada? Faça o login"}
            </button>
          </div>
        </div>
      ) : (
        /* ================= LOGGED IN USER VIEW ================= */
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* User Profile Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full -mr-6 -mt-6"></div>
              
              <div className="text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-slate-800 border-2 border-blue-600 flex items-center justify-center text-blue-500 shadow-inner">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">{currentUser.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser.role === "admin" ? "Administrador / Dev" : "Cliente Cadastrado"}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl text-xs text-gray-400 space-y-2.5 border border-slate-850">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID da Conta:</span>
                  <span className="font-mono text-white text-[10px]">{currentUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Criada Em:</span>
                  <span className="font-bold text-white">{currentUser.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status Banco:</span>
                  <span className="font-bold text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Sincronizado
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-slate-800 hover:bg-red-950/45 hover:text-red-400 hover:border-red-900/40 text-gray-300 font-bold py-3 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 border border-slate-700"
              >
                <LogOut className="w-4 h-4" /> Finalizar Sessão
              </button>
            </div>

            {/* Dashboard / SMTP settings */}
            <div className="md:col-span-2 space-y-8">
              {currentUser.role === "admin" ? (
                /* ================= ADMIN MANAGEMENT TABLE ================= */
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-500" />
                        <h3 className="font-extrabold text-white text-lg">Gerenciador do Banco de Dados de Contas</h3>
                      </div>
                      <p className="text-xs text-gray-400">Total de criadores de conta cadastrados no sistema: <strong className="text-white">{usersList.length}</strong></p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/15 shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Nova Conta
                      </button>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Pesquisar contas por nome, email ou perfil..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3.5 pl-10 rounded-xl text-white text-xs"
                    />
                  </div>

                  {/* Users table */}
                  <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/50">
                    <table className="w-full text-left text-xs text-gray-400 border-collapse">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-800 font-bold uppercase tracking-wider text-[10px] text-gray-500">
                          <th className="p-4">Nome</th>
                          <th className="p-4">E-mail</th>
                          <th className="p-4">ID</th>
                          <th className="p-4">Perfil</th>
                          <th className="p-4 text-center">Criado Em</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              Nenhuma conta encontrada correspondente aos termos de busca.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 font-bold text-white">{u.name}</td>
                              <td className="p-4 font-mono text-[11px]">{u.email}</td>
                              <td className="p-4 font-mono text-slate-500 text-[10px]">{u.id}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  u.role === "admin" 
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                }`}>
                                  {u.role === "admin" ? "Admin" : "Cliente"}
                                </span>
                              </td>
                              <td className="p-4 text-center font-mono text-gray-500 text-[11px]">{u.createdAt}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={u.id === "user-admin"}
                                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-35 disabled:hover:bg-transparent"
                                  title="Remover conta do banco de dados"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ================= CLIENT SIMPLE ACCOUNT SUMMARY ================= */
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="border-b border-slate-800/80 pb-4">
                    <h3 className="text-lg font-extrabold text-white">Central do Cliente</h3>
                    <p className="text-xs text-gray-400">Acesse seus cupons, rastreie pedidos e configure suas informações de forma segura.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Histórico de Pedidos</span>
                      <p className="text-xl font-black text-white">Sincronizado</p>
                      <p className="text-xs text-gray-500">Suas compras finalizadas com este e-mail serão listadas automaticamente no menu superior de rastreamento.</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Segurança</span>
                      <p className="text-xl font-black text-white">Criptografia Local</p>
                      <p className="text-xs text-gray-500">Seus dados de sessão e senhas estão guardados de forma segura e protegida usando os padrões da plataforma.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* SMTP Settings Block (always at the bottom of Profile Panel) */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5">
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-blue-500" />
                    <h3 className="font-extrabold text-white text-lg">E-mail do Servidor (SMTP)</h3>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Deseja que os e-mails de compras cheguem de forma real a <strong>byelsaints17@gmail.com</strong> usando seu próprio servidor de e-mail? Preencha os dados abaixo. Se preferir não preencher, o TECHNOVA gerará automaticamente uma simulação interativa usando o Ethereal Mail!
                  </p>
                </div>

                <form onSubmit={handleSaveSmtp} className="space-y-4 text-xs text-gray-400">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-gray-400 font-bold mb-1.5">Host do Servidor SMTP</label>
                      <input
                        type="text"
                        placeholder="exemplo: smtp.gmail.com"
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
                      <label className="block text-gray-400 font-bold mb-1.5">Usuário de Autenticação</label>
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
                        type={showSmtpPass ? "text" : "password"}
                        placeholder="Sua senha ou senha de app"
                        value={smtpConfig.pass}
                        onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        className="absolute right-3 bottom-3 text-gray-500 hover:text-white transition-colors"
                      >
                        {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

                {smtpSaveStatus === "success" && (
                  <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl text-xs text-green-400 font-semibold">
                    ✓ Configurações de SMTP salvas com sucesso!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CREATE NEW ACCOUNT MODAL (ADMIN) ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md relative shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-2">Cadastrar Nova Conta de Usuário</h3>
            <p className="text-xs text-gray-400 mb-6">Insira os dados do criador de conta para inserção direta no banco de dados.</p>
            
            <form onSubmit={handleAdminCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do usuário"
                  value={newAdminUserName}
                  onChange={(e) => setNewAdminUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Endereço de E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="email@exemplo.com"
                  value={newAdminUserEmail}
                  onChange={(e) => setNewAdminUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Senha Provisória</label>
                <input
                  type="text"
                  required
                  placeholder="Defina uma senha"
                  value={newAdminUserPassword}
                  onChange={(e) => setNewAdminUserPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo de Perfil</label>
                <select
                  value={newAdminUserRole}
                  onChange={(e) => setNewAdminUserRole(e.target.value as "admin" | "cliente")}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-bold"
                >
                  <option value="cliente">Cliente Padrão</option>
                  <option value="admin">Administrador / Gestor</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-850 hover:bg-slate-850 text-xs font-bold text-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/15"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
