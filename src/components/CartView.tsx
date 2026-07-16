import { CartItem, Product, Tab } from "../types";
import { Plus, Minus, Trash2, ArrowLeft, CreditCard, ShoppingBag, ShieldCheck } from "lucide-react";

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, amount: number) => void;
  onRemoveItem: (id: string) => void;
  setActiveTab: (tab: Tab) => void;
  onProceedToCheckout: () => void;
}

export default function CartView({ cart, onUpdateQuantity, onRemoveItem, setActiveTab, onProceedToCheckout }: CartViewProps) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Shipping: free above R$ 200, else R$ 15
  const shippingFee = subtotal >= 200 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center gap-5 shadow-lg">
        <div className="bg-slate-800 p-5 rounded-full text-blue-500 animate-bounce">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white">Seu carrinho está vazio</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Parece que você ainda não adicionou nenhum smartphone, notebook ou acessório TECHNOVA ao seu carrinho de compras.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("inicio")}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar às Compras
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          Meu Carrinho
          <span className="text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-bold">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </span>
        </h2>
        <p className="text-xs text-gray-400">Verifique os itens e prossiga para a finalização segura.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-md hover:border-slate-700 transition-all duration-250"
            >
              {/* Product Thumbnail */}
              <div className="w-20 h-20 bg-slate-950 rounded-xl overflow-hidden shrink-0 relative border border-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug truncate">
                  {item.name}
                </h3>
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider block mt-0.5">
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-gray-400 block mt-1.5 sm:mt-1">
                  R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} cada
                </span>
              </div>

              {/* Quantity selectors */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  disabled={item.quantity <= 1}
                  className="text-gray-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-white w-6 text-center select-none">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Price / Delete */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-gray-500 block sm:hidden">Subtotal:</span>
                  <span className="text-lg font-black text-white">
                    R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"
                  title="Remover produto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Keep shopping link */}
          <button
            onClick={() => setActiveTab("inicio")}
            className="text-sm text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1.5 transition-colors pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Adicionar mais produtos...
          </button>
        </div>

        {/* Summary sidebar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />

          <h3 className="text-xl font-extrabold text-white tracking-tight border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Resumo do Pedido</span>
            <span className="text-xs bg-slate-800 text-gray-300 font-mono px-2.5 py-0.5 rounded-md">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </span>
          </h3>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span className="font-bold text-white">
                R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Frete:</span>
              {shippingFee === 0 ? (
                <span className="font-black text-green-500 uppercase text-xs">Grátis</span>
              ) : (
                <span className="font-bold text-white">
                  R$ {shippingFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {shippingFee > 0 && (
              <p className="text-[10px] text-gray-500 text-right">
                Adicione mais R$ {(200 - subtotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} para ganhar Frete Grátis!
              </p>
            )}

            <div className="border-t border-slate-800 pt-4 flex justify-between items-end text-white">
              <span className="font-extrabold">Total Geral:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-white block">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  ou até 12x de R$ {(total / 12).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/10 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
          >
            <CreditCard className="w-4 h-4" /> Finalizar Compra
          </button>

          {/* Secure SSL Info badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Ambiente 100% Seguro (SSL)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
