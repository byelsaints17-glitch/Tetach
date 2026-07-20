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
    { id: "fones" as Tab, label: "Áudio / Som", icon: Headphones },
    { id: "perifericos" as Tab, label: "Periféricos", icon: Keyboard },
    { id: "pecas" as Tab, label: "Hardware", icon: Cpu },
    { id: "gamer" as Tab, label: "Gamer", icon: Gamepad2 },
    { id: "bicicletas" as Tab, label: "Mobilidade", icon: Bike },
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
    <header className="bg-[#0086ff] text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner/Promo */}
      <div className="bg-[#ff6500] text-xs text-center py-1.5 px-4 font-black tracking-wider flex items-center justify-center gap-4 text-white shadow-inner">
        <span>⚡ DIA DO CLIENTE TECHNOVA • FRETE GRÁTIS ACIMA DE R$ 200,00 • PARCELAMENTO ATÉ 12X SEM JUROS!</span>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div 
          onClick={() => {
            setActiveTab("inicio");
            setMobileMenuOpen(false);
          }} 
          className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
        >
          <div className="bg-white p-2 rounded-xl text-[#0086ff] group-hover:scale-105 transition-all shadow-md">
            <Cpu className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter leading-none text-white">
              TECH<span className="text-amber-300">NOVA</span>
            </h1>
            <p className="text-[9px] text-blue-100 font-bold tracking-widest uppercase">
              O Gigante do Varejo
            </p>
          </div>
        </div>

        {/* Search Bar (Kabum/Magalu styled) */}
        <form 
          onSubmit={handleSubmitSearch} 
          className="hidden md:flex flex-1 max-w-lg relative"
        >
          <input
            type="text"
            placeholder="Buscar celulares, computadores, notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-gray-400 pl-4 pr-12 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition-all shadow-sm font-medium"
          />
          <button 
            type="submit" 
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff6500] text-white hover:bg-[#e05900] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist Icon */}
          <button 
            onClick={() => setActiveTab("desejos")}
            className={`p-2 rounded-xl hover:bg-blue-600/80 transition-colors relative flex items-center gap-1.5 text-sm font-extrabold ${
              activeTab === "desejos" ? "text-amber-300 bg-blue-600" : "text-white"
            }`}
            title="Lista de Desejos"
          >
            <Heart className="w-5 h-5 fill-current" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {wishlistCount}
              </span>
            )}
            <span className="hidden xl:inline">Favoritos</span>
          </button>

          {/* Account Icon */}
          <button 
            onClick={() => setActiveTab("conta")}
            className={`p-2 rounded-xl hover:bg-blue-600/80 transition-colors relative flex items-center gap-1.5 text-sm font-extrabold ${
              activeTab === "conta" ? "text-amber-300 bg-blue-600" : "text-white"
            }`}
            title="Minha Conta"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline">Minha Conta</span>
          </button>

          {/* Orders Tracking Shortcut */}
          <button 
            onClick={() => setActiveTab("pedidos")}
            className={`p-2 rounded-xl hover:bg-blue-600/80 transition-colors hidden sm:flex items-center gap-1.5 text-sm font-extrabold ${
              activeTab === "pedidos" ? "text-amber-300 bg-blue-600" : "text-white"
            }`}
            title="Meus Pedidos"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden lg:inline">Meus Pedidos</span>
          </button>

          {/* Cart Icon (Bright Orange for CTA pop) */}
          <button 
            onClick={() => setActiveTab("carrinho")}
            className={`p-2.5 px-4 rounded-xl transition-all relative flex items-center gap-2 text-xs sm:text-sm font-black border-none shadow-md ${
              activeTab === "carrinho" 
                ? "bg-[#ff6500] text-white shadow-[#ff6500]/30" 
                : "bg-amber-300 text-slate-900 hover:bg-amber-400 hover:scale-105 active:scale-95"
            }`}
            title="Carrinho de Compras"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 stroke-[2.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-3.5 -right-3.5 bg-red-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Carrinho</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-blue-600/50 rounded"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search - Visible under header on small screens */}
      <div className="md:hidden px-4 pb-3.5 bg-[#0086ff]">
        <form onSubmit={handleSubmitSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Buscar produtos na TECHNOVA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-gray-400 pl-4 pr-12 py-2 rounded-xl text-sm font-semibold"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#ff6500] text-white p-1.5 rounded-lg">
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Categories Bar (Desktop - Horizontal Scrolling track) */}
      <nav className="border-t border-blue-600 bg-white text-slate-700 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1.5 py-2 overflow-x-auto scrollbar-none scroll-smooth">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "bg-[#0086ff] text-white shadow-sm" 
                      : "text-[#0086ff] hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
            <div className="h-5 w-[1px] bg-gray-200 shrink-0 mx-2" />
            {categories.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all shrink-0 ${
                    isActive 
                      ? "bg-amber-100 text-[#ff6500] border border-amber-300/60" 
                      : "text-gray-600 hover:text-[#0086ff] hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-85" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Drawer/Overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white text-slate-800 border-t border-gray-100 px-4 py-4 space-y-3 max-h-[85vh] overflow-y-auto shadow-xl">
          {/* Quick Access Grid for Mobile Profile & Wishlist */}
          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider px-1">Sua Conta</div>
          <div className="grid grid-cols-2 gap-2 pb-2">
            <button
              onClick={() => {
                setActiveTab("conta");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
                activeTab === "conta"
                  ? "bg-[#0086ff] text-white border-blue-500 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <User className="w-4 h-4 text-blue-500" />
              <span>Meu Perfil</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("desejos");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-black transition-all border ${
                activeTab === "desejos"
                  ? "bg-[#0086ff] text-white border-blue-500 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <Heart className="w-4 h-4 text-red-500" />
              <span>Favoritos</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pedidos");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 justify-center px-3 py-2.5 rounded-xl text-xs font-black transition-all border col-span-2 ${
                activeTab === "pedidos"
                  ? "bg-[#0086ff] text-white border-blue-500 shadow-sm"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Acompanhar Meus Pedidos</span>
            </button>
          </div>

          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider px-1 border-t border-gray-100 pt-3">Navegação</div>
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
                className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left text-sm font-extrabold ${
                  isActive 
                    ? "bg-[#0086ff] text-white" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 text-[#0086ff]" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => {
              setActiveTab("carrinho");
              setMobileMenuOpen(false);
            }}
            className={`flex items-center justify-between w-full px-4 py-2 rounded-lg text-left text-sm font-extrabold ${
              activeTab === "carrinho"
                ? "bg-[#ff6500] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-[#ff6500]" />
              <span>Meu Carrinho</span>
            </div>
            {cartCount > 0 && (
              <span className="bg-[#ff6500] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          
          <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider px-1 border-t border-gray-100 pt-3 pb-1">Categorias</div>
          <div className="grid grid-cols-2 gap-2">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold border ${
                    isActive 
                      ? "bg-blue-50 text-[#0086ff] border-[#0086ff]" 
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-75 text-gray-500" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
