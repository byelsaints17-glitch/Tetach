import { Order, Tab, Product } from "../types";
import { Package, Truck, CheckCircle, Clock, ExternalLink, ArrowRight } from "lucide-react";
import { getLocalProducts } from "../utils/localDb";

interface OrdersTrackingViewProps {
  orders: Order[];
  products: Product[];
  setActiveTab: (tab: Tab) => void;
  onViewProduct?: (product: Product) => void;
}

export default function OrdersTrackingView({ orders, products, setActiveTab, onViewProduct }: OrdersTrackingViewProps) {
  const allAvailableProducts = getLocalProducts();

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-200 rounded-3xl flex flex-col items-center gap-5 shadow-sm">
        <div className="bg-[#0086ff]/10 p-5 rounded-full text-[#0086ff]">
          <Package className="w-10 h-10 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-800">Nenhum pedido efetuado</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Você ainda não realizou compras nesta sessão. Adicione itens ao seu carrinho e acompanhe a entrega em tempo real!
          </p>
        </div>
        <button
          onClick={() => setActiveTab("inicio")}
          className="bg-[#ff6500] hover:bg-[#e05900] text-white font-extrabold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 mt-2 active:scale-95"
        >
          Ir às Compras <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Meus Pedidos</h2>
        <p className="text-xs text-gray-400 mt-1">Acompanhe as suas compras e o status de faturamento e entrega em tempo real.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col text-slate-800"
          >
            {/* Header info */}
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Código do Pedido</span>
                  <p className="text-sm font-black text-gray-700 font-mono leading-none mt-1">{order.orderId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Realizado em</span>
                  <p className="text-sm font-extrabold text-gray-600 leading-none mt-1">{order.orderDate}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Valor Pago</span>
                <p className="text-base font-black text-[#ff6500] leading-none mt-1">
                  R$ {order.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Tracking progress bar */}
            <div className="p-5 sm:p-6 border-b border-gray-150 bg-white">
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-4.5 left-6 right-6 h-1 bg-gray-100 -z-10" />
                <div className={`absolute top-4.5 left-6 h-1 -z-10 transition-all duration-500 ${
                  order.status === "Pendente" 
                    ? "w-[10%] bg-amber-400" 
                    : order.status === "Aprovado"
                    ? "w-[33%] bg-[#0086ff]"
                    : order.status === "Em Transporte"
                    ? "w-[66%] bg-[#0086ff]"
                    : "w-[100%] bg-emerald-500"
                }`} />

                <div className="flex justify-between items-start text-center">
                  {/* Step 1: Pagamento / Recebimento */}
                  <div className="flex flex-col items-center">
                    {order.status === "Pendente" ? (
                      <div className="bg-amber-100 text-amber-600 border-2 border-amber-400 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm animate-pulse z-10">
                        <Clock className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                        <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                    )}
                    <span className="text-xs font-black text-gray-700 mt-2.5 block">
                      {order.status === "Pendente" ? "Pagamento Pendente" : "Pago"}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 max-w-[90px] mx-auto leading-tight">
                      {order.status === "Pendente" ? "Aguardando PIX" : "Aprovado"}
                    </span>
                  </div>

                  {/* Step 2: Preparando */}
                  <div className="flex flex-col items-center">
                    {order.status === "Pendente" ? (
                      <div className="bg-gray-100 text-gray-400 border-2 border-gray-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10">
                        <Package className="w-4.5 h-4.5" />
                      </div>
                    ) : (
                      <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                        <Package className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                    )}
                    <span className={`text-xs mt-2.5 block ${order.status === "Pendente" ? "font-semibold text-gray-400" : "font-black text-gray-700"}`}>
                      Preparando
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 max-w-[90px] mx-auto leading-tight">Embalagem especial</span>
                  </div>

                  {/* Step 3: Transporte */}
                  <div className="flex flex-col items-center">
                    {order.status === "Em Transporte" || order.status === "Entregue" ? (
                      <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                        <Truck className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-400 border-2 border-gray-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10">
                        <Truck className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <span className={`text-xs mt-2.5 block ${(order.status === "Em Transporte" || order.status === "Entregue") ? "font-black text-gray-700" : "font-semibold text-gray-400"}`}>
                      Transporte
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 max-w-[90px] mx-auto leading-tight">Com a transportadora</span>
                  </div>

                  {/* Step 4: Entregue */}
                  <div className="flex flex-col items-center">
                    {order.status === "Entregue" ? (
                      <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                        <CheckCircle className="w-4.5 h-4.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-400 border-2 border-gray-200 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10">
                        <CheckCircle className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <span className={`text-xs mt-2.5 block ${order.status === "Entregue" ? "font-black text-gray-700" : "font-semibold text-gray-400"}`}>
                      Entregue
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 max-w-[90px] mx-auto leading-tight">Entregue ao cliente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra details (Tracking code and items) */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-extrabold text-gray-700 text-sm">Itens Comprados</h4>
                <div className="divide-y divide-gray-150 border-t border-b border-gray-150 py-1.5 space-y-1">
                  {order.cart.map((item, idx) => {
                    // RESILIENT MATCH: Look up first in local DB, then in memory, fallback directly to item cast to Product
                    const matchedProduct = allAvailableProducts.find(p => p.id === item.id) || 
                                           allAvailableProducts.find(p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()) ||
                                           products.find(p => p.id === item.id) || 
                                           products.find(p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim());
                    
                    const fullProduct: Product = matchedProduct || (item as unknown as Product);

                    return (
                      <div 
                        key={idx} 
                        onClick={() => onViewProduct?.(fullProduct)}
                        className="flex items-center justify-between gap-4 py-2.5 hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-all cursor-pointer group"
                        title={`Visualizar especificações de: ${item.name}`}
                      >
                        <div className="flex items-center gap-3">
                          {fullProduct.imageUrl && (
                            <div className="w-11 h-11 bg-white rounded-lg p-1 border border-gray-200 flex items-center justify-center shrink-0">
                              <img 
                                src={fullProduct.imageUrl} 
                                alt={item.name} 
                                className="max-w-full max-h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800 text-xs group-hover:text-[#0086ff] transition-colors flex items-center gap-1.5">
                              {item.name}
                              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#0086ff] transition-colors" />
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                              Qtd: <span className="text-gray-600 font-extrabold">{item.quantity}</span> • R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} un
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-gray-800 text-xs text-right shrink-0">
                          R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery and tracking details panel */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Código de Rastreamento</span>
                  <p className="text-xs font-black text-[#0086ff] font-mono mt-0.5">{order.trackingCode}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Endereço de Entrega</span>
                  <p className="text-gray-700 mt-1 leading-snug font-bold">
                    {order.deliveryAddress.address}, {order.deliveryAddress.number}
                  </p>
                  <p className="text-gray-400 font-bold font-mono mt-0.5 text-[11px]">{order.deliveryAddress.zip}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
