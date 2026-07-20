import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";

export default function BenefitsBar() {
  const benefits = [
    {
      icon: Truck,
      title: "Frete Grátis",
      desc: "Em compras acima de R$ 200,00",
      color: "text-[#ff6500] bg-orange-50",
    },
    {
      icon: CreditCard,
      title: "Parcelamento até 12x",
      desc: "Sem juros em todo o site",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: ShieldCheck,
      title: "Compra Segura",
      desc: "Seus dados 100% protegidos (SSL)",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      desc: "Atendimento online especializado",
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${b.color} border border-gray-100`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-800 leading-tight">{b.title}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-400 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
