import { Order, Tab } from "../types";
import { Package, Truck, CheckCircle, Calendar, DollarSign, ArrowLeft, ArrowRight, HelpCircle, Clock } from "lucide-react";

interface OrdersTrackingViewProps {
  orders: Order[];
  setActiveTab: (tab: Tab) => void;
}

export default function OrdersTrackingView({ orders, setActiveTab }: OrdersTrackingViewProps) {
  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center gap-5 shadow-lg">
        <div className="bg-slate-800 p-5 rounded-full text-blue-500">
          <Package className="w-10 h-10" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white">Nenhum pedido efetuado</h3>
          <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
            Você ainda não realizou compras nesta sessão. Experimente comprar algum item e confira o acompanhamento de entrega!
          </p>
        </div>
        <button
          onClick={() => setActiveTab("inicio")}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 mt-2"
        >
          Ir às Compras <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Meus Pedidos</h2>
        <p className="text-xs text-gray-400">Acompanhe as suas compras e o status de entrega em tempo real.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.orderId}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col"
          >
            {/* Header info */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Código</span>
                  <p className="text-sm font-extrabold text-white font-mono leading-none mt-0.5">{order.orderId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Realizado em</span>
                  <p className="text-sm font-semibold text-gray-300 leading-none mt-0.5">{order.orderDate}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Valor Pago</span>
                <p className="text-sm font-extrabold text-blue-500 leading-none mt-0.5">
                  R$ {order.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Tracking progress bar */}
            <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/50">
              <div className="relative">
                {/* Connector line */}
                <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 h-1 bg-slate-800 -z-10" />
                <div className={`absolute top-4 left-4 h-1 -z-10 transition-all duration-500 ${
                  order.status === "Pendente" 
                    ? "w-[12%] bg-amber-500 animate-pulse" 
                    : order.status === "Aprovado"
                    ? "w-[38%] bg-green-500"
                    : order.status === "Em Transporte"
                    ? "w-[66%] bg-blue-500"
                    : "w-[100%] bg-emerald-500"
                }`} />

                <div className="flex justify-between items-start text-center">
                  {/* Step 1: Pagamento / Recebimento */}
                  <div className="flex flex-col items-center">
                    {order.status === "Pendente" ? (
                      <div className="bg-amber-500/20 text-amber-400 border border-amber-500 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
                        <Clock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-green-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-green-600/15">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-white mt-2 block">
                      {order.status === "Pendente" ? "Pagamento Pendente" : "Pago"}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">
                      {order.status === "Pendente" ? "Aguardando aprovação" : "Aprovado pelo MP"}
                    </span>
                  </div>

                  {/* Step 2: Preparando */}
                  <div className="flex flex-col items-center">
                    {order.status === "Pendente" ? (
                      <div className="bg-slate-800 text-gray-500 border border-slate-700 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm">
                        <Package className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/15">
                        <Package className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`text-xs mt-2 block ${order.status === "Pendente" ? "font-semibold text-gray-500" : "font-bold text-white"}`}>
                      Preparando
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Embalagem de segurança</span>
                  </div>

                  {/* Step 3: Transporte */}
                  <div className="flex flex-col items-center">
                    {order.status === "Em Transporte" || order.status === "Entregue" ? (
                      <div className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-blue-600/15">
                        <Truck className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-gray-500 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border border-slate-700">
                        <Truck className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`text-xs mt-2 block ${(order.status === "Em Transporte" || order.status === "Entregue") ? "font-bold text-white" : "font-semibold text-gray-500"}`}>
                      Transporte
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Com a transportadora</span>
                  </div>

                  {/* Step 4: Entregue */}
                  <div className="flex flex-col items-center">
                    {order.status === "Entregue" ? (
                      <div className="bg-emerald-600 text-white w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/15">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="bg-slate-800 text-gray-500 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border border-slate-700">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`text-xs mt-2 block ${order.status === "Entregue" ? "font-bold text-white" : "font-semibold text-gray-500"}`}>
                      Entregue
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">Em mãos do cliente</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extra details (Tracking code and items) */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="md:col-span-2 space-y-3">
                <h4 className="font-extrabold text-white text-sm">Itens Comprados</h4>
                <div className="divide-y divide-slate-800 border-t border-b border-slate-800 py-1.5 space-y-1.5">
                  {order.cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 text-gray-300">
                      <span>{item.name} <strong className="text-gray-500">x{item.quantity}</strong></span>
                      <span className="font-bold text-white">R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Código de Rastreamento</span>
                  <p className="text-sm font-extrabold text-blue-400 font-mono mt-0.5">{order.trackingCode}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Endereço de Entrega</span>
                  <p className="text-gray-300 mt-0.5 leading-snug font-medium">
                    {order.deliveryAddress.address}, {order.deliveryAddress.number}
                  </p>
                  <p className="text-gray-400 font-mono mt-0.5">{order.deliveryAddress.zip}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
