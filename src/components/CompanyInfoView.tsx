import React, { useState } from "react";
import { 
  Shield, FileText, HelpCircle, Info, Tag, Check, ChevronDown, 
  Mail, Phone, MapPin, Building, Globe, Award, ShieldCheck, Heart
} from "lucide-react";
import { Tab } from "../types";

interface CompanyInfoViewProps {
  section: "faq" | "privacidade" | "termos" | "sobre" | "marcas" | "desejos";
  wishlist?: any[];
  onRemoveFromWishlist?: (id: string) => void;
  onAddToCart?: (p: any) => void;
}

export default function CompanyInfoView({ 
  section, 
  wishlist = [], 
  onRemoveFromWishlist, 
  onAddToCart 
}: CompanyInfoViewProps) {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Como funciona a entrega e qual o prazo de envio?",
      a: "Todos os nossos pedidos são faturados em até 24 horas úteis após a aprovação do pagamento. O prazo de entrega varia conforme a sua localidade, sendo calculado na finalização do pedido. Oferecemos FRETE GRÁTIS para todo o Brasil em compras acima de R$ 200,00."
    },
    {
      q: "Os produtos vendidos na TECHNOVA são originais e possuem garantia?",
      a: "Sim, absolutamente. Todos os produtos em nosso catálogo são 100% originais, adquiridos diretamente dos fabricantes ou de distribuidores oficiais autorizados no Brasil. Cada produto acompanha Nota Fiscal Eletrônica (NF-e) e garantia de fábrica de 1 ano."
    },
    {
      q: "Quais são as formas de pagamento aceitas?",
      a: "Aceitamos todos os cartões de crédito (Visa, Mastercard, Elo, American Express) com parcelamento em até 12x sem juros. Também aceitamos Pix com aprovação instantânea e boleto bancário."
    },
    {
      q: "Como faço para rastrear o meu pedido?",
      a: "Assim que o seu pedido for enviado, um código de rastreamento oficial será enviado para seu e-mail cadastrado. Você pode acompanhar em tempo real diretamente na aba 'Meus Pedidos' no topo do site."
    },
    {
      q: "Qual é a política de devolução e troca?",
      a: "Respeitamos integralmente o Código de Defesa do Consumidor. Você pode solicitar a devolução gratuita de qualquer item por arrependimento em até 7 dias corridos após o recebimento, desde que o produto esteja na embalagem original, sem marcas de uso e com todos os acessórios inclusos."
    },
    {
      q: "A TECHNOVA possui loja física?",
      a: "Nossa operação principal é 100% digital, o que nos permite reduzir custos e oferecer preços extremamente competitivos aos nossos clientes. Nossa sede administrativa e centro de distribuição logística ficam localizados na Av. Paulista, 1000, em São Paulo/SP."
    }
  ];

  const brands = [
    { name: "Apple", logo: "🍎", desc: "Inovação tecnológica e design líder em smartphones e notebooks." },
    { name: "Samsung", logo: "📱", desc: "Líder global em telas AMOLED, TVs inteligentes e memórias de alta velocidade." },
    { name: "Intel", logo: "⚙️", desc: "Processadores de alto desempenho e arquitetura de computadores de elite." },
    { name: "AMD", logo: "🚀", desc: "Avanços revolucionários em chips gráficos e processamento gamer multithread." },
    { name: "Logitech", logo: "🖱️", desc: "Periféricos ergonômicos e acessórios gamer com precisão impecável." },
    { name: "LG", logo: "📺", desc: "Pioneira em telas OLED de alta taxa de atualização e monitores ultra-wide." },
    { name: "ASUS", logo: "💻", desc: "Placas-mãe de altíssima durabilidade e notebooks ROG voltados para entusiastas." },
    { name: "Sony", logo: "🎧", desc: "Cancelamento de ruído líder de mercado e áudio de altíssima fidelidade." }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-fade-in text-gray-300">
      
      {/* SECTION: FAQ */}
      {section === "faq" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-blue-500/10 text-blue-400">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Perguntas Frequentes (FAQ)</h2>
            <p className="text-gray-400 text-sm">Encontre respostas rápidas para as principais dúvidas sobre frete, pagamento, garantia e devolução.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 md:p-6 divide-y divide-slate-800/60 shadow-xl">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left font-bold text-white text-sm sm:text-base hover:text-blue-400 transition-colors py-1 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-blue-400" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-gray-400 leading-relaxed font-medium pl-1 animate-slide-down">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: PRIVACY POLICY */}
      {section === "privacidade" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-cyan-500/10 text-cyan-400">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Política de Privacidade</h2>
            <p className="text-gray-400 text-sm">Atualizado em 15 de Julho de 2026 • Em conformidade com a LGPD (Lei Geral de Proteção de Dados).</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-sm leading-relaxed text-gray-300 font-medium shadow-xl">
            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">1. Coleta de Informações</h3>
              <p>Nós coletamos apenas as informações estritamente necessárias para processar, faturar e enviar as suas compras. Isso inclui nome completo, CPF, e-mail, telefone celular, endereço de entrega e dados cadastrais básicos. Seus dados de pagamento (como número do cartão de crédito) são criptografados na origem e processados de forma 100% segura por gateways homologados, não sendo guardados em nossos servidores.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">2. Uso dos Dados Cadastrais</h3>
              <p>Seus dados pessoais são utilizados unicamente para faturar sua compra, emitir as notas fiscais eletrônicas brasileiras (NF-e) correspondentes e gerar os links de rastreamento com as transportadoras. Notificações automáticas de pedido aprovado e link de rastreamento são enviados para o e-mail cadastrado e notificam diretamente nosso canal logístico.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">3. Segurança e Proteção SSL</h3>
              <p>Todo o tráfego de dados entre o seu navegador e a plataforma TECHNOVA é protegido por criptografia de ponta a ponta (Protocolo de Segurança SSL/TLS de 256 bits). Mantemos nossos sistemas auditados e em conformidade estrita com as leis nacionais de proteção de dados.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">4. Seus Direitos</h3>
              <p>Em conformidade com a LGPD, você possui o direito de, a qualquer momento, solicitar o acesso, retificação, limitação ou exclusão definitiva de seus dados do nosso banco de dados. Para qualquer solicitação, entre em contato através de nossa página de suporte ou envie um e-mail para <strong className="text-white">byelsaints17@gmail.com</strong>.</p>
            </section>
          </div>
        </div>
      )}

      {/* SECTION: TERMS OF USE */}
      {section === "termos" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Termos de Uso</h2>
            <p className="text-gray-400 text-sm">Por favor, leia estes termos de uso cuidadosamente antes de comprar em nossa loja.</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 text-sm leading-relaxed text-gray-300 font-medium shadow-xl">
            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">1. Aceitação dos Termos</h3>
              <p>Ao acessar o site da TECHNOVA ou concluir uma compra em nossa plataforma, você declara possuir capacidade jurídica plena e concordar integralmente com as regras, termos e diretrizes de venda expressas neste documento.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">2. Preços e Disponibilidade de Estoque</h3>
              <p>Os preços de venda e ofertas promocionais expostas no site são válidos apenas no momento de sua visualização e para compras finalizadas. A inclusão de produtos no carrinho não garante a reserva do item ou o congelamento do preço promocional. Em caso de divergência de valores, prevalece o preço oficial de faturamento do checkout.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">3. Obrigações do Cliente</h3>
              <p>O cliente é inteiramente responsável pela veracidade e preenchimento correto de seus dados cadastrais (especialmente CPF, e-mail e endereço residencial de entrega). Dados incorretos que resultem em atrasos, devolução postal ou problemas no faturamento fiscal serão de responsabilidade do comprador.</p>
            </section>

            <section className="space-y-2">
              <h3 className="text-white font-extrabold text-base">4. Propriedade Intelectual</h3>
              <p>Todo o conteúdo gráfico, marca TECHNOVA, logos de categorias, layouts de página e banners promocionais são de propriedade exclusiva da TECHNOVA LTDA, protegidos pelas leis nacionais de direitos autorais.</p>
            </section>
          </div>
        </div>
      )}

      {/* SECTION: SOBRE A EMPRESA (WHO WE ARE) */}
      {section === "sobre" && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-400">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Quem Somos (Sobre Nós)</h2>
            <p className="text-gray-400 text-sm">Conheça a história e os valores da TECHNOVA, sua parceira de tecnologia premium.</p>
          </div>

          {/* Grid Layout of about statements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
              <Award className="w-8 h-8 text-blue-400" />
              <h3 className="text-white font-extrabold text-lg">Nossa Missão</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Democratizar o acesso aos produtos de tecnologia mais avançados e inovadores do mundo, oferecendo uma experiência de compra rápida, transparente e incrivelmente segura para o consumidor brasileiro.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-3">
              <ShieldCheck className="w-8 h-8 text-green-400" />
              <h3 className="text-white font-extrabold text-lg">Nosso Compromisso</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Todos os nossos produtos são adquiridos exclusivamente por vias oficiais, garantindo 100% de legitimidade fiscal, 1 ano completo de garantia contratual e suporte total pós-venda.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-white font-extrabold text-xl">Sua Loja de Tecnologia de Ponta</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              Fundada em São Paulo, a <strong className="text-white">TECHNOVA</strong> nasceu da paixão pela inovação digital. Percebemos que o mercado nacional carecia de uma plataforma que unisse agilidade extrema na entrega, catálogo robusto, faturamento transparente e um atendimento humanizado focado de verdade no cliente.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
              Hoje, enviamos para todo o território nacional, trabalhando em estreita colaboração com as melhores marcas internacionais (Apple, Samsung, Intel, Asus, Logitech) e garantindo faturamentos automáticos com envio expresso via correio e transportadoras terrestres e aéreas.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: BRANDS */}
      {section === "marcas" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-purple-500/10 text-purple-400">
              <Tag className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Nossas Marcas Parceiras</h2>
            <p className="text-gray-400 text-sm">Trabalhamos em parceria oficial direta com as maiores gigantes globais de engenharia de computação e design.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {brands.map((b, idx) => (
              <div key={idx} className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl hover:border-blue-500/50 transition-all text-center space-y-2">
                <span className="text-3xl block filter drop-shadow">{b.logo}</span>
                <h3 className="text-white font-extrabold text-base">{b.name}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: WISHLIST */}
      {section === "desejos" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-400">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Sua Lista de Desejos</h2>
            <p className="text-gray-400 text-sm">Seus produtos favoritos salvos para comprar depois com toda comodidade.</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl py-16 text-center space-y-4 shadow-xl">
              <Heart className="w-16 h-16 text-slate-800 mx-auto" />
              <div className="space-y-1">
                <p className="text-white font-bold text-base">Sua lista está vazia</p>
                <p className="text-gray-400 text-xs max-w-xs mx-auto">Navegue pelas abas ou use a barra de busca para encontrar os melhores eletrônicos e salvá-los aqui!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map((p) => (
                <div key={p.id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.imageUrl} alt={p.name} className="w-14 h-14 object-contain bg-slate-850 p-1.5 rounded border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-white text-sm max-w-xs truncate">{p.name}</h4>
                      <p className="text-blue-400 font-extrabold text-sm mt-0.5">R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">Marca: {p.brand}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(p)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all"
                      >
                        Comprar
                      </button>
                    )}
                    {onRemoveFromWishlist && (
                      <button
                        onClick={() => onRemoveFromWishlist(p.id)}
                        className="text-[11px] text-gray-500 hover:text-red-400 transition-colors py-1 text-center font-bold"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
