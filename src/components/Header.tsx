import React, { useState } from "react";
import { 
  Search, ShoppingCart, User, Menu, X, Laptop, Smartphone, Headphones, 
  Percent, Sparkles, PhoneCall, HelpCircle, Heart, Settings, Monitor, 
  Printer, Tv, Watch, Keyboard, Cpu, Gamepad2, Tag, Info, ShieldAlert, Bike
} from "lucide-react";
import { Tab } from "../types";
import { isDevEnv } from "../utils/localDb";

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  cartCount: number;
  onSearch: (query: string) => void;
  wishlistCount?: number;
}

export default function Header({ activeTab, setActiveTab, cartCount, onSearch, wishlistCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const showAdmin = isDevEnv();

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setActiveTab("inicio"); // Reset to home/main search view when searching
  };

  const categories = [
    { id: "celulares" as Tab, label: "Celulares", icon: Smartphone },
    { id: "notebooks" as Tab, label: "Notebooks", icon: Laptop },
    { id: "computadores" as Tab, label: "Desktops", icon: Cpu },
    { id: "tablets" as Tab, label: "Tablets", icon: Watch },
    { id: "monitores" as Tab, label: "Monitores", icon: Monitor },
    { id: "impressoras" as Tab, label: "Impressoras", icon: Printer },
    { id: "tvs" as Tab, label: "Smart TVs", icon: Tv },
    { id: "smartwatches" as Tab, label: "Smartwatches", icon: Watch },
    { id: "fones" as Tab, label: "Áudio", icon: Headphones },
    { id: "perifericos" as Tab, label: "Periféricos", icon: Keyboard },
    { id: "pecas" as Tab, label: "Peças", icon: Cpu },
    { id: "gamer" as Tab, label: "Gamer", icon: Gamepad2 },
    { id: "bicicletas" as Tab, label: "Bicicletas", icon: Bike },
  ];

  const secondaryNav = [
    { id: "inicio" as Tab, label: "Início", icon: Sparkles },
    { id: "ofertas" as Tab, label: "Promoções", icon: Percent },
    { id: "lancamentos" as Tab, label: "Lançamentos", icon: Sparkles },
    { id: "marcas" as Tab, label: "Marcas", icon: Tag },
    { id: "faq" as Tab, label: "Dúvidas (FAQ)", icon: HelpCircle },
    { id: "sobre" as Tab, label: "Quem Somos", icon: Info },
    { id: "contato" as Tab, label: "Fale Conosco", icon: PhoneCall },
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner/Promo */}
      <div className="bg-blue-600 text-xs text-center py-1.5 px-4 font-medium tracking-wide flex items-center justify-center gap-4">
        <span>⚡ FRETE GRÁTIS nas compras acima de R$ 200,00 • Parcelamento em até 12x sem juros!</span>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => {
            setActiveTab("inicio");
            setMobileMenuOpen(false);
          }} 
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="bg-blue-600 p-2.5 rounded-lg text-white group-hover:bg-blue-500 transition-all">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white">
              TECH<span className="text-blue-500">NOVA</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              Sua Loja de Tecnologia
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSubmitSearch} 
          className="hidden md:flex flex-1 max-w-lg relative"
        >
          <input
            type="text"
            placeholder="Buscar celulares, computadores, notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-gray-400 pl-4 pr-10 py-2.5 rounded-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          />
          <button 
            type="submit" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist Icon */}
          <button 
            onClick={() => setActiveTab("desejos")}
            className={`p-2 rounded-full hover:bg-slate-800 transition-colors relative flex items-center gap-1 text-sm font-medium ${
              activeTab === "desejos" ? "text-red-500 bg-slate-800" : "text-gray-300"
            }`}
            title="Lista de Desejos"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
            <span className="hidden xl:inline">Favoritos</span>
          </button>

          {/* Account Icon */}
          <button 
            onClick={() => setActiveTab("conta")}
            className={`p-2 rounded-full hover:bg-slate-800 transition-colors relative flex items-center gap-1 text-sm font-medium ${
              activeTab === "conta" ? "text-blue-500 bg-slate-800" : "text-gray-300"
            }`}
            title="Minha Conta"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline">Minha Conta</span>
          </button>

          {/* Orders Tracking Shortcut */}
          <button 
            onClick={() => setActiveTab("pedidos")}
            className={`p-2 rounded-full hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-sm font-medium ${
              activeTab === "pedidos" ? "text-blue-500 bg-slate-800" : "text-gray-300"
            }`}
            title="Meus Pedidos"
          >
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span className="hidden lg:inline">Meus Pedidos</span>
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => setActiveTab("carrinho")}
            className={`p-2.5 px-3.5 rounded-xl transition-all relative flex items-center gap-2 text-sm font-black border ${
              activeTab === "carrinho" 
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/30" 
                : "bg-blue-600/15 text-blue-400 border-blue-500/30 hover:bg-blue-600/25 hover:scale-105 active:scale-95"
            }`}
            title="Carrinho de Compras"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-3.5 -right-3 bg-rose-500 text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md shadow-rose-500/20 animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrinho</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search - Visible under header on small screens */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSubmitSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Buscar produtos na TECHNOVA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-gray-400 pl-4 pr-10 py-2 rounded-full border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Categories Bar (Desktop - Horizontal Scrolling track) */}
      <nav className="border-t border-slate-800/80 bg-slate-950/90 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 py-1.5 overflow-x-auto scrollbar-none scroll-smooth">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "bg-blue-600 text-white" 
                      : "text-blue-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
            <div className="h-4 w-[1px] bg-slate-800 shrink-0 mx-2" />
            {categories.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "bg-blue-600/35 text-blue-400 border border-blue-500/50" 
                      : "text-gray-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-70" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Drawer/Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-2 max-h-[80vh] overflow-y-auto">
          {/* Quick Access Grid for Mobile Profile & Wishlist */}
          <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider px-2 pt-1 pb-1">Sua Conta</div>
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button
              onClick={() => {
                setActiveTab("conta");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "conta"
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-slate-900 text-gray-300 border-slate-800 hover:text-white"
              }`}
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Meu Perfil</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("desejos");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === "desejos"
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-slate-900 text-gray-300 border-slate-800 hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>Favoritos</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pedidos");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all border col-span-2 ${
                activeTab === "pedidos"
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10"
                  : "bg-slate-900 text-gray-300 border-slate-800 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Rastrear Meus Pedidos</span>
            </button>
          </div>

          <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider px-2 pt-2 border-t border-slate-900">Navegação</div>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left text-sm font-semibold ${
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setActiveTab("carrinho");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-left text-sm font-semibold ${
              activeTab === "carrinho"
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4" />
              <span>Meu Carrinho</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {cartCount} {cartCount === 1 ? "item" : "itens"}
              </span>
            )}
          </button>
          <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider px-2 pt-2 pb-1">Categorias de Produtos</div>
          {categories.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left text-sm font-semibold ${
                  isActive 
                    ? "bg-blue-600/55 text-blue-300" 
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 opacity-75" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
