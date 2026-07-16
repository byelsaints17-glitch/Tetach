import { useState } from "react";
import { X, Star, ShoppingCart, Check } from "lucide-react";
import { Product } from "../types";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];
  
  const [activeImage, setActiveImage] = useState(product.imageUrl || imagesList[0]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
      />

      {/* Content modal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full relative z-10 text-white animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-850 hover:bg-slate-800 text-gray-400 hover:text-white p-2 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="bg-slate-950 flex flex-col justify-between p-4 min-h-[320px] md:min-h-[400px]">
            <div className="relative flex-1 flex items-center justify-center max-h-[280px] md:max-h-[320px] overflow-hidden rounded-xl">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-xl transition-all duration-300"
              />
              {product.originalPrice && (
                <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow z-10">
                  Oferta Limitada
                </span>
              )}
            </div>

            {/* Thumbnails row */}
            {imagesList.length > 1 && (
              <div className="mt-4 pt-3 border-t border-slate-900">
                <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Fotos do produto ({imagesList.length})</span>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                  {imagesList.map((img, idx) => {
                    const isSelected = activeImage === img;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(img)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border shrink-0 transition-all ${
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

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-black text-blue-500 tracking-wider">
                  Ficha Técnica Oficial
                </span>
                <h3 className="font-extrabold text-white text-xl sm:text-2xl mt-1 tracking-tight leading-tight">
                  {product.name}
                </h3>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) 
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-600"
                    }`} 
                  />
                ))}
                <span className="text-xs font-bold text-gray-300 ml-1">
                  {product.rating.toFixed(1)} / 5.0
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed">
                {product.description}
              </p>

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Especificações Principais</h4>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {product.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-300 leading-tight">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                {product.originalPrice && (
                  <p className="text-xs text-gray-500 line-through">
                    De: R$ {product.originalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-green-500 font-bold">À Vista ou no Cartão</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  ou em até <strong className="text-blue-400">12x de R$ {(product.price / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> sem juros
                </p>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-600/10 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Comprar Produto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
