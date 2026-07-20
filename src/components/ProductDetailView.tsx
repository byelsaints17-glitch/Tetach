import { useState } from "react";
import { Star, ShoppingCart, Check, ArrowLeft, Shield, Truck, RefreshCw } from "lucide-react";
import { Product } from "../types";

interface ProductDetailViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailView({ product, onClose, onAddToCart }: ProductDetailViewProps) {
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];
  
  const [activeImage, setActiveImage] = useState(product.imageUrl || imagesList[0]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a Loja
        </button>
        <span className="text-xs font-mono text-gray-500">REF: {product.id}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Left Column: Image Gallery (Span 5) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="relative bg-slate-950/80 border border-slate-800/50 rounded-2xl p-6 flex items-center justify-center min-h-[350px] max-h-[450px] overflow-hidden group">
            <img
              src={activeImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[350px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
            />
            {product.originalPrice && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-lg tracking-wider shadow-lg">
                Oferta Especial
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {imagesList.length > 1 && (
            <div className="bg-slate-950/40 border border-slate-800/40 p-4 rounded-2xl">
              <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Fotos do Produto ({imagesList.length})</span>
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {imagesList.map((img, idx) => {
                  const isSelected = activeImage === img;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border shrink-0 transition-all ${
                        isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information (Span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            {/* Category & Badge */}
            <div>
              <span className="text-[11px] uppercase font-black text-blue-500 tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                {product.category === "celulares" && "Smartphone / Celular"}
                {product.category === "computadores" && "Computador"}
                {product.category === "notebooks" && "Notebook"}
                {product.category === "tablets" && "Tablet"}
                {product.category === "monitores" && "Monitor"}
                {product.category === "impressoras" && "Impressora"}
                {product.category === "tvs" && "Smart TV"}
                {product.category === "smartwatches" && "Smartwatch"}
                {product.category === "fones" && "Áudio / Fone"}
                {product.category === "perifericos" && "Periférico"}
                {product.category === "pecas" && "Peças / Componentes"}
                {product.category === "gamer" && "Espaço Gamer"}
                {product.category === "bicicletas" && "Bicicleta & Mobilidade"}
                {!["celulares", "computadores", "notebooks", "tablets", "monitores", "impressoras", "tvs", "smartwatches", "fones", "perifericos", "pecas", "gamer", "bicicletas"].includes(product.category) && product.category}
              </span>
              <h1 className="font-black text-white text-2xl sm:text-3xl lg:text-4xl mt-3.5 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating System */}
            <div className="flex items-center gap-1.5 bg-slate-950/40 border border-slate-800/40 px-3 py-1.5 rounded-xl w-fit">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-slate-700"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-300">
                {product.rating.toFixed(1)} / 5.0 (Avaliações dos clientes)
              </span>
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrição do Produto</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Technical Specs Checklist */}
            <div className="space-y-3 bg-slate-950/40 border border-slate-800/40 p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Especificações Técnicas Completas
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 leading-normal">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Checkout Block */}
          <div className="border-t border-slate-800/80 pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                {product.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    De: R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg">
                    À Vista ou Pix (-10%)
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  ou em até <strong className="text-blue-400">12x de R$ {(product.price / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> sem juros no cartão
                </p>
              </div>

              {/* Secure Trust Flags */}
              <div className="bg-slate-950/60 border border-slate-800/60 p-4 rounded-xl space-y-2 text-[11px] text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>🚚 Frete Grátis com Seguro Integrado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>🛡️ Garantia de Fábrica Oficial (12 Meses)</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>🔄 7 Dias para Testes e Devolução Grátis</span>
                </div>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/10 text-sm sm:text-base flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
            >
              <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho de Compras
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
