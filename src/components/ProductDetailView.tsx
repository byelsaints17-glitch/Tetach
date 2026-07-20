import React, { useState, useEffect } from "react";
import { 
  Star, ShoppingCart, Check, ArrowLeft, Shield, Truck, 
  RefreshCw, Share2, MapPin, CreditCard, MessageSquare, 
  Info, Sparkles, ChevronRight, Eye, Heart, BarChart3, ShieldAlert
} from "lucide-react";
import { Product } from "../types";

interface ProductDetailViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  allProducts?: Product[];
  onViewProduct?: (product: Product) => void;
}

type DetailTab = "specs" | "shipping" | "payment" | "reviews";

export default function ProductDetailView({ 
  product, 
  onClose, 
  onAddToCart,
  allProducts = [],
  onViewProduct
}: ProductDetailViewProps) {
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];
  
  const [activeImage, setActiveImage] = useState(product.imageUrl || imagesList[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("specs");
  
  // Shipping Simulation State
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<Array<{ name: string; time: string; price: string; isFree: boolean }> | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");
  
  // Favorites toggle simulation
  const [isFavorite, setIsFavorite] = useState(false);

  // Keep active image updated when product changes (deep linking / recommended navigation)
  useEffect(() => {
    setActiveImage(product.imageUrl || imagesList[0]);
    setShippingOptions(null);
    setCep("");
    setShippingError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}?p=${product.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError("");
    setShippingOptions(null);

    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setShippingError("Por favor, insira um CEP válido (8 dígitos). Exemplo: 01001000");
      return;
    }

    setIsCalculatingShipping(true);
    setTimeout(() => {
      setIsCalculatingShipping(false);
      setShippingOptions([
        {
          name: "Standard Sedex (Correios)",
          time: "3 a 5 dias úteis",
          price: "Grátis",
          isFree: true
        },
        {
          name: "Transportadora Expressa (Pichau Log)",
          time: "1 a 2 dias úteis",
          price: "R$ 14,90",
          isFree: false
        },
        {
          name: "Entrega Ninja KABUM (Super Rápido)",
          time: "Mesmo dia (para compras até as 12h)",
          price: "R$ 29,90",
          isFree: false
        }
      ]);
    }, 850);
  };

  // Generate related products
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Generate Installments Breakdown (12x without interest)
  const installments = Array.from({ length: 12 }, (_, i) => {
    const months = i + 1;
    // Base price divided by months
    const value = product.price / months;
    return {
      months,
      value,
      interest: "Sem juros"
    };
  });

  // Category label formatter
  const formatCategory = (cat: string) => {
    const mapping: Record<string, string> = {
      celulares: "Smartphones",
      notebooks: "Notebooks",
      computadores: "Computadores",
      tablets: "Tablets & iPads",
      monitores: "Monitores",
      impressoras: "Impressoras",
      tvs: "Smart TVs",
      smartwatches: "Smartwatches",
      fones: "Áudio & Headphones",
      perifericos: "Periféricos",
      pecas: "Hardware & Peças",
      gamer: "Gamer & Consoles",
      bicicletas: "Bicicletas & Mobilidade",
      ofertas: "Ofertas Especiais",
      lancamentos: "Lançamentos"
    };
    return mapping[cat] || cat.toUpperCase();
  };

  // Cash discount display (-10% is already pre-applied to catalog prices but we'll show the split beautifully)
  const cardPrice = product.price / 0.9; // Original credit card price
  const installmentValue = cardPrice / 12;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Breadcrumbs Path & Quick Navigation (Kabum / Magalu style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-medium text-gray-400">
        <div className="flex flex-wrap items-center gap-1">
          <span className="hover:text-blue-400 cursor-pointer transition-colors" onClick={onClose}>TECHNOVA</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="capitalize hover:text-blue-400 cursor-pointer transition-colors">{formatCategory(product.category)}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-gray-500 font-semibold">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-gray-300 font-bold max-w-[200px] sm:max-w-xs truncate">{product.name}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Catálogo
          </button>
          
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-400 hover:text-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Grid: Product Showcase (Left) & Premium Buy Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Image Gallery & Highlights - Span 7 like Pichau/Kabum) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
            {/* Corner Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg">
                Original {product.brand}
              </span>
              {product.originalPrice && (
                <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg">
                  OFERTA ATIVA
                </span>
              )}
            </div>

            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  isFavorite 
                    ? "bg-rose-600/10 border-rose-500 text-rose-500" 
                    : "bg-slate-950/80 border-slate-800 text-gray-400 hover:text-rose-500 hover:border-rose-500/50"
                }`}
                title="Favoritar produto"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* Main high fidelity product viewer */}
            <div className="flex items-center justify-center min-h-[320px] max-h-[420px] p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 overflow-hidden group">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[300px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Thumbnails Carousel */}
            {imagesList.length > 1 && (
              <div className="mt-6 pt-6 border-t border-slate-800/60">
                <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2.5">Imagens Disponíveis</p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {imagesList.map((img, idx) => {
                    const isSelected = activeImage === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          isSelected 
                            ? "border-blue-500 ring-2 ring-blue-500/30 bg-slate-950" 
                            : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} visual ${idx}`}
                          className="w-full h-full object-contain p-1"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Quick specifications highlights box below image (Pichau style) */}
            <div className="mt-6 bg-slate-950/50 border border-slate-800/80 p-5 rounded-2xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" /> DESTAQUES DO PRODUTO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specs.slice(0, 4).map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    <span className="line-clamp-1">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (The Buy Panel / "Box de Compra" - Span 5 like Kabum/Mercado Livre) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
            
            {/* Header info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-[11px] text-gray-500 font-semibold">• Ref: {product.id}</span>
              </div>
              
              <h1 className="font-black text-white text-xl sm:text-2xl leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Trust/Rating Stars */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) 
                          ? "text-amber-400 fill-amber-400" 
                          : "text-slate-700"
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-400">
                  {product.rating.toFixed(1)} <span className="text-gray-600">|</span> 99% recomendam este produto
                </span>
              </div>
            </div>

            {/* Price Box with KABUM/Pichau cash (PIX) styling */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                Preço Especial no Pix
              </span>
              
              <div className="space-y-1">
                {product.originalPrice && (
                  <p className="text-xs text-gray-500 line-through">
                    De: R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
                
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                    R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-gray-400">à vista</span>
                </div>
                <p className="text-xs text-emerald-400/80 font-bold">
                  (Ganhe 10% de desconto adicional pagando no PIX)
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3 mt-3">
                <p className="text-xs text-gray-400 font-medium">
                  Ou parcelado em até <strong className="text-blue-400">12x de R$ {installmentValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> sem juros de <strong className="text-white">R$ {cardPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> no cartão de crédito.
                </p>
              </div>
            </div>

            {/* Stock status indicator */}
            <div className="flex items-center gap-2 bg-slate-950/30 border border-slate-850 p-3 rounded-xl text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 5 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
              <span className="text-gray-300 font-semibold">
                Estoque: <strong className="text-white font-extrabold">{product.stock} unidades</strong> disponíveis para pronta entrega
              </span>
            </div>

            {/* Main Action Buttons (Kabum / Magalu style) */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/15 text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
              >
                <ShoppingCart className="w-5 h-5" /> COMPRAR AGORA
              </button>
              
              <button
                onClick={() => {
                  // Direct add to cart but without changing active tab to cart immediately
                  // Just add it to cart and show a brief added notification/state
                  onAddToCart(product);
                }}
                className="w-full bg-slate-950 hover:bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-blue-500/40 font-bold py-3.5 px-6 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>ADICIONAR AO CARRINHO</span>
              </button>
            </div>

            {/* Embedded Shipping Simulator (Mercado Livre style) */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-500" /> SIMULE O FRETE DA SUA REGÃO
              </h4>
              <form onSubmit={handleCalculateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite seu CEP (Ex: 01001-000)"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  maxLength={9}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none font-semibold"
                />
                <button
                  type="submit"
                  disabled={isCalculatingShipping}
                  className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white font-bold px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center shrink-0 border border-slate-700"
                >
                  {isCalculatingShipping ? "Carregando..." : "Calcular"}
                </button>
              </form>

              {shippingError && (
                <p className="text-[11px] font-bold text-rose-400">{shippingError}</p>
              )}

              {shippingOptions && (
                <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl space-y-2.5 text-xs mt-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                  {shippingOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white text-[11px]">{opt.name}</p>
                        <p className="text-[10px] text-gray-500">Prazo: <span className="text-blue-400 font-bold">{opt.time}</span></p>
                      </div>
                      <span className={`text-[11px] font-black ${opt.isFree ? "text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded" : "text-white"}`}>
                        {opt.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust factors */}
            <div className="border-t border-slate-850 pt-4 grid grid-cols-3 gap-2 text-[10px] text-gray-500 font-semibold text-center">
              <div className="space-y-1">
                <Shield className="w-4 h-4 mx-auto text-blue-500" />
                <p className="text-gray-300">Garantia Oficial</p>
                <p className="text-gray-500 leading-none">12 Meses</p>
              </div>
              <div className="space-y-1 border-l border-r border-slate-850">
                <RefreshCw className="w-4 h-4 mx-auto text-emerald-500" />
                <p className="text-gray-300">Devolução</p>
                <p className="text-gray-500 leading-none">7 dias grátis</p>
              </div>
              <div className="space-y-1">
                <Truck className="w-4 h-4 mx-auto text-cyan-500" />
                <p className="text-gray-300">Nota Fiscal</p>
                <p className="text-gray-500 leading-none">NFe integral</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Deep-Dive Product Details (Specs, simulated Payment installment, Reviews) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Navigation Tabs Headers */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`flex items-center gap-2 px-6 py-4.5 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "specs" 
                ? "border-blue-500 text-white bg-slate-900/60" 
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <Info className="w-4.5 h-4.5 text-blue-500" />
            Especificações Técnicas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payment")}
            className={`flex items-center gap-2 px-6 py-4.5 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payment" 
                ? "border-blue-500 text-white bg-slate-900/60" 
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-4.5 h-4.5 text-purple-500" />
            Opções de Parcelamento
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`flex items-center gap-2 px-6 py-4.5 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "reviews" 
                ? "border-blue-500 text-white bg-slate-900/60" 
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5 text-amber-500" />
            Avaliações e Opiniões ({product.rating.toFixed(1)})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8">
          
          {/* TAB 1: Specs (Structured KABUM / Pichau style table) */}
          {activeTab === "specs" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h3 className="text-base font-black text-white flex items-center gap-1.5">
                  <Info className="w-4.5 h-4.5 text-blue-500" /> Descrição do Produto
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">{product.description}</p>
              </div>

              <div className="border-t border-slate-800/80 pt-6">
                <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-blue-500" /> FICHA TÉCNICA DETALHADA
                </h3>
                
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20 divide-y divide-slate-800">
                  <div className="grid grid-cols-3 p-3.5 text-xs bg-slate-950/60">
                    <span className="text-gray-400 font-extrabold col-span-1">Marca</span>
                    <span className="text-white font-extrabold col-span-2">{product.brand}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs">
                    <span className="text-gray-400 font-extrabold col-span-1">Modelo</span>
                    <span className="text-white font-extrabold col-span-2">{product.model}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs bg-slate-950/60">
                    <span className="text-gray-400 font-extrabold col-span-1">Garantia Comercial</span>
                    <span className="text-white font-extrabold col-span-2">{product.warranty || "12 meses de garantia oficial"}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 text-xs">
                    <span className="text-gray-400 font-extrabold col-span-1">Classificação</span>
                    <span className="text-white font-extrabold col-span-2 capitalize">{product.category}</span>
                  </div>

                  {product.specs.map((spec, idx) => {
                    const parts = spec.split(":");
                    const key = parts[0];
                    const val = parts.slice(1).join(":");
                    const isEven = idx % 2 === 0;
                    return (
                      <div key={idx} className={`grid grid-cols-3 p-3.5 text-xs ${isEven ? "bg-slate-950/60" : ""}`}>
                        <span className="text-gray-400 font-extrabold col-span-1">{key?.trim()}</span>
                        <span className="text-white font-semibold col-span-2">{val ? val?.trim() : "Especificado"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Payment Table */}
          {activeTab === "payment" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">Tabela de Parcelamento de Cartões</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Compre com total flexibilidade em até 12x sem juros em nossa plataforma de pagamento auditada. Aceitamos Visa, Mastercard, Elo, Amex e Hipercard.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                        <th className="px-4 py-3">Número de Parcelas</th>
                        <th className="px-4 py-3">Valor da Parcela</th>
                        <th className="px-4 py-3 text-right">Total Geral</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-semibold text-gray-300">
                      {installments.map((inst) => (
                        <tr key={inst.months} className="hover:bg-slate-900/30">
                          <td className="px-4 py-2.5 text-white">{inst.months}x sem juros</td>
                          <td className="px-4 py-2.5 text-blue-400">R$ {inst.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-right">R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl space-y-2">
                    <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Desconto Exclusivo via Pix (-10%)
                    </h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      Efetuando o pagamento por Pix, você aproveita o menor preço garantido, aprovação instantânea de estoque e faturamento no mesmo dia útil!
                    </p>
                    <p className="text-2xl font-black text-white pt-2">
                      R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-800/40 p-5 rounded-2xl text-xs space-y-2 text-gray-400 font-medium leading-relaxed">
                    <p className="text-white font-bold mb-1 uppercase tracking-wide text-[10px] flex items-center gap-1">
                      🔒 COMPRA 100% AUDITADA & SEGURA
                    </p>
                    <p>• Transações criptografadas com certificado de segurança SSL de 256 bits.</p>
                    <p>• Garantia de entrega integralTECHNOVA: receba seu pedido ou tenha estorno integral.</p>
                    <p>• Produto oficial, lacrado na caixa de fábrica e com emissão de nota fiscal integral (NF-e).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Reviews with dynamic star breakdown graph (Mercado Livre/Magalu style) */}
          {activeTab === "reviews" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Star Rating distribution chart */}
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-slate-800 pb-6">
                <div className="text-center md:text-left space-y-2 shrink-0">
                  <span className="text-4xl sm:text-5xl font-black text-white">{product.rating.toFixed(1)}</span>
                  <div className="flex items-center gap-0.5 justify-center md:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wide">Média geral baseada em avaliações reais</span>
                </div>
                
                {/* Distribution Chart Progress bars */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-10 text-right font-semibold">5 estrelas</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "85%" }}></div>
                    </div>
                    <span className="w-8 text-gray-500 text-[10px]">85%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-10 text-right font-semibold">4 estrelas</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "10%" }}></div>
                    </div>
                    <span className="w-8 text-gray-500 text-[10px]">10%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-10 text-right font-semibold">3 estrelas</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "3%" }}></div>
                    </div>
                    <span className="w-8 text-gray-500 text-[10px]">3%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-10 text-right font-semibold">2 estrelas</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "1%" }}></div>
                    </div>
                    <span className="w-8 text-gray-500 text-[10px]">1%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    <span className="w-10 text-right font-semibold">1 estrela</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: "1%" }}></div>
                    </div>
                    <span className="w-8 text-gray-500 text-[10px]">1%</span>
                  </div>
                </div>
              </div>

              {/* Verified Buyer Comments */}
              <div className="space-y-4">
                <div className="bg-slate-950/40 border border-slate-800/40 p-5 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-start gap-4 text-xs">
                    <div>
                      <span className="font-extrabold text-white block">Marcos Silva</span>
                      <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1.5 inline-block">Comprador Verificado</span>
                    </div>
                    <span className="text-gray-500 font-semibold font-mono">15/07/2026</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    "O produto superou todas as minhas expectativas. O desempenho é impecável e a entrega foi absurdamente rápida, chegou em apenas 2 dias aqui no interior de São Paulo. A embalagem veio super protegida, nota 10!"
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 p-5 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-start gap-4 text-xs">
                    <div>
                      <span className="font-extrabold text-white block">Mariana Ribeiro</span>
                      <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1.5 inline-block">Compradora Verificada</span>
                    </div>
                    <span className="text-gray-500 font-semibold font-mono">08/07/2026</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    "Uso diariamente para trabalhar e a performance é incrível. O acabamento do produto é de altíssimo nível. Recomendo muito para quem busca algo profissional. Valeu cada centavo investido."
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/40 p-5 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-start gap-4 text-xs">
                    <div>
                      <span className="font-extrabold text-white block">Gabriel Santos</span>
                      <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wide bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded mt-1.5 inline-block">Comprador Verificado</span>
                    </div>
                    <span className="text-gray-500 font-semibold font-mono">29/06/2026</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    "Tudo conforme o anunciado. Excelente atendimento da TECHNOVA, responderam todas as minhas dúvidas no suporte de vendas. O produto em si dispensa comentários, simplesmente sensacional!"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. "Quem viu este produto também comprou" (Related products slider list - Magalu/Kabum style) */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                Quem viu este produto também comprou...
              </h3>
              <p className="text-xs text-gray-400 font-semibold">Sugestões inteligentes baseadas em sua navegação</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div 
                key={p.id}
                onClick={() => onViewProduct?.(p)}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-4 hover:border-blue-500 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full group"
                title={`Ver ${p.name}`}
              >
                <div className="relative bg-slate-950 rounded-xl pt-[85%] overflow-hidden mb-3.5">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 z-10 border border-slate-800">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-bold text-white">{p.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-black text-blue-500 tracking-wider block">{p.brand}</span>
                    <h4 className="font-bold text-white text-sm tracking-tight mt-0.5 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-sm font-black text-emerald-400 block">
                      R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-gray-500 block font-semibold">
                      ou 12x de R$ {(p.price / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
