import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";

export default function BenefitsBar() {
  const benefits = [
    {
      icon: Truck,
      title: "Frete Grátis",
      desc: "Em compras acima de R$ 200,00",
      color: "text-green-500",
    },
    {
      icon: CreditCard,
      title: "Parcelamento até 12x",
      desc: "Sem juros em todo o site",
      color: "text-blue-500",
    },
    {
      icon: ShieldCheck,
      title: "Compra Segura",
      desc: "Seus dados 100% protegidos (SSL)",
      color: "text-cyan-500",
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      desc: "Atendimento online especializado",
      color: "text-yellow-500",
    },
  ];

  return (
    <div className="bg-slate-900 border-y border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`p-2 bg-slate-800 rounded-xl ${b.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm sm:text-base leading-tight">{b.title}</h4>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
