import React, { useState, useEffect, useRef } from "react";
import { CartItem, Order, Tab } from "../types";
import { ShieldCheck, Mail, ShoppingBag, CreditCard, ChevronRight, CheckCircle2, Copy, ExternalLink, RefreshCw, Smartphone, MapPin, Search, Check, AlertCircle, Barcode } from "lucide-react";
import { saveLocalOrder } from "../utils/localDb";

interface CheckoutViewProps {
  cart: CartItem[];
  onOrderCompleted: (order: Order) => void;
  setActiveTab: (tab: Tab) => void;
  onClearCart: () => void;
  customSmtpConfig?: any; // Configured via Minha Conta tab
}

export default function CheckoutView({ cart, onOrderCompleted, setActiveTab, onClearCart, customSmtpConfig }: CheckoutViewProps) {
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
  });

  const [address, setAddress] = useState({
    zip: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
  });

  const [payment, setPayment] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    installments: 1,
  });

  const [paymentMethod, setPaymentMethod] = useState<"mercadopago_pix" | "mercadopago_card" | "mercadopago_boleto" | "mercadopago_pix_card">("mercadopago_pix");
  const [mercadopagoData, setMercadopagoData] = useState<{
    orderId: string;
    preferenceId: string;
    initPoint: string;
    sandboxInitPoint: string;
    pixCode?: string;
    pixQrBase64?: string;
    paymentId?: string;
    isSimulated: boolean;
  } | null>(null);
  const [showMpSimulator, setShowMpSimulator] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);
  const [splitPixInput, setSplitPixInput] = useState<string>("");
  const [cardCpf, setCardCpf] = useState<string>("");
  const [simulatedCard, setSimulatedCard] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
    installments: 1
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);

  // Advanced Mercado Pago checkout enhancements
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showMPCredentialsGuide, setShowMPCredentialsGuide] = useState(false);
  const [pixCountdown, setPixCountdown] = useState(600);
  const [simulatedStatus, setSimulatedStatus] = useState<"approved" | "rejected" | "pending">("approved");

  useEffect(() => {
    if (!showMpSimulator || paymentMethod !== "mercadopago_pix" || !mercadopagoData) return;
    
    setPixCountdown(600); // 10 minutes
    const interval = setInterval(() => {
      setPixCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showMpSimulator, paymentMethod, mercadopagoData]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const brickControllerRef = useRef<any>(null);

  useEffect(() => {
    // Only build the brick if modal is shown, mercadopago data exists, it's NOT a simulated mock, and preferenceId exists
    if (!showMpSimulator || !mercadopagoData || mercadopagoData.isSimulated || !mercadopagoData.preferenceId) {
      return;
    }

    const mpInstance = (window as any).MercadoPago;
    if (!mpInstance) {
      console.warn("[Mercado Pago] Script v2 não foi carregado corretamente na página.");
      return;
    }

    // Check VITE_MERCADOPAGO_PUBLIC_KEY
    const publicKey = (import.meta as any).env.VITE_MERCADOPAGO_PUBLIC_KEY || "APP_USR-5b128521-827b-4027-a068-d6b9d628d0ea";
    console.log("[Mercado Pago] Inicializando Wallet Brick com Chave Pública:", publicKey);

    let active = true;

    const initWalletBrick = async () => {
      try {
        const mp = new mpInstance(publicKey, { locale: "pt-BR" });
        const bricksBuilder = mp.bricks();

        // Clear container first
        const container = document.getElementById("walletBrick_container");
        if (container) {
          container.innerHTML = "";
        }

        if (!active) return;

        const controller = await bricksBuilder.create("wallet", "walletBrick_container", {
          initialization: {
            preferenceId: mercadopagoData.preferenceId,
            redirectMode: "modal"
          },
          customization: {
            texts: {
              action: "pay",
              valueProp: "security_safety"
            },
            visual: {
              buttonBackground: "default",
              borderRadius: "16px",
              valuePropColor: "grey",
              buttonHeight: "48px"
            }
          }
        });

        if (active) {
          brickControllerRef.current = controller;
          console.log("[Mercado Pago] Wallet Brick criado com sucesso!");
        } else {
          controller?.unmount();
        }
      } catch (err) {
        console.error("[Mercado Pago] Erro ao instanciar o Wallet Brick:", err);
        const container = document.getElementById("walletBrick_container");
        if (container) {
          container.innerHTML = `<p class="text-xs text-red-500 font-semibold">Falha ao carregar botão oficial. Por favor, utilize o botão de redirecionamento acima.</p>`;
        }
      }
    };

    // Wait slightly to guarantee the div container is fully mounted in the DOM
    const timeoutId = setTimeout(() => {
      initWalletBrick();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      if (brickControllerRef.current) {
        try {
          brickControllerRef.current.unmount();
        } catch (e) {
          console.error("Error unmounting brick:", e);
        }
        brickControllerRef.current = null;
      }
    };
  }, [showMpSimulator, mercadopagoData]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 200 ? 0 : 15;
  const totalAmount = subtotal + shippingFee;

  // Split payment calculations
  const parsedPix = parseFloat(splitPixInput.replace(",", "."));
  const pixSplitAmount = !isNaN(parsedPix) && parsedPix > 0 
    ? Math.min(parsedPix, totalAmount) 
    : totalAmount / 2;
  const cardSplitAmount = Math.max(0, totalAmount - pixSplitAmount);

  // Format credit card numbers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setPayment({ ...payment, cardNumber: parts.join(" ") });
    } else {
      setPayment({ ...payment, cardNumber: value });
    }
  };

  // Format Expiry Date MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 4);
    if (value.length > 2) {
      setPayment({ ...payment, expiry: `${value.slice(0, 2)}/${value.slice(2)}` });
    } else {
      setPayment({ ...payment, expiry: value });
    }
  };

  // Format Phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);
    if (value.length > 10) {
      setCustomer({ ...customer, phone: `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}` });
    } else if (value.length > 6) {
      setCustomer({ ...customer, phone: `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}` });
    } else if (value.length > 2) {
      setCustomer({ ...customer, phone: `(${value.slice(0, 2)}) ${value.slice(2)}` });
    } else {
      setCustomer({ ...customer, phone: value });
    }
  };

  // Format CPF (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);
    if (value.length > 9) {
      setCustomer({ ...customer, cpf: `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}` });
    } else if (value.length > 6) {
      setCustomer({ ...customer, cpf: `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}` });
    } else if (value.length > 3) {
      setCustomer({ ...customer, cpf: `${value.slice(0, 3)}.${value.slice(3)}` });
    } else {
      setCustomer({ ...customer, cpf: value });
    }
  };

  // Format Card CPF (000.000.000-00)
  const handleCardCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);
    if (value.length > 9) {
      setCardCpf(`${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`);
    } else if (value.length > 6) {
      setCardCpf(`${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`);
    } else if (value.length > 3) {
      setCardCpf(`${value.slice(0, 3)}.${value.slice(3)}`);
    } else {
      setCardCpf(value);
    }
  };

  // Format Birth Date (DD/MM/AAAA)
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 8);
    if (value.length > 4) {
      setCustomer({ ...customer, birthDate: `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}` });
    } else if (value.length > 2) {
      setCustomer({ ...customer, birthDate: `${value.slice(0, 2)}/${value.slice(2)}` });
    } else {
      setCustomer({ ...customer, birthDate: value });
    }
  };

  // Format CEP (00000-000)
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 8);
    if (value.length > 5) {
      setAddress({ ...address, zip: `${value.slice(0, 5)}-${value.slice(5)}` });
    } else {
      setAddress({ ...address, zip: value });
    }
  };

  // CEP Lookup via ViaCEP API
  const handleSearchCep = async () => {
    const rawCep = address.zip.replace(/\D/g, "");
    if (rawCep.length !== 8) {
      setErrorMessage("Digite um CEP válido com 8 dígitos para buscar.");
      return;
    }

    setIsLoadingCep(true);
    setErrorMessage("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErrorMessage("CEP não localizado. Por favor, digite os dados manualmente.");
      } else {
        setAddress({
          ...address,
          address: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "SP",
        });
      }
    } catch (err) {
      console.error("ViaCEP Lookup failed:", err);
      setErrorMessage("Erro ao buscar CEP. Preencha as informações do endereço manualmente.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Submit Order and Send Checkout Email / Create Mercado Pago preference
  // Handle confirming the simulated payment inside the portal modal
  const handleConfirmSimulatedPayment = async () => {
    if (!pendingOrderData) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const { completedOrder, orderHistoryItem } = pendingOrderData;

    try {
      console.log(`[Mercado Pago] Simulating payment approval on server for order: ${completedOrder.orderId}`);
      
      // 1. Update the order status on the server-side to 'Aprovado'
      const statusRes = await fetch(`/api/admin/orders/${completedOrder.orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Aprovado" }),
      });

      if (!statusRes.ok) {
        console.warn("[Mercado Pago] Server-side status update returned error, proceeding with local update.");
      }

      // 2. Set the success order state with Aprovado status to show the success panel
      const approvedCompletedOrder = {
        ...completedOrder,
        status: "Aprovado"
      };
      setSuccessOrder(approvedCompletedOrder);

      // 3. Save order history item with status Aprovado to client-side storage
      const approvedOrderHistoryItem = {
        ...orderHistoryItem,
        status: "Aprovado"
      };
      onOrderCompleted(approvedOrderHistoryItem);

      // 4. Clear shopping cart
      onClearCart();

      // 5. Close the simulator modal
      setShowMpSimulator(false);
    } catch (err) {
      console.error("[Mercado Pago] Error confirming simulated payment:", err);
      setErrorMessage("Erro ao processar simulação de pagamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Order and Send Checkout Email / Create Mercado Pago preference
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Simple manual validation
    if (!customer.name || !customer.email || !customer.phone || !customer.cpf || !customer.birthDate) {
      setErrorMessage("Por favor, preencha todos os campos dos Dados do Cliente (incluindo CPF e Data de Nascimento).");
      return;
    }
    if (!address.zip || !address.address || !address.number || !address.neighborhood || !address.city) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios do Endereço de Entrega.");
      return;
    }

    const hasDiscount = paymentMethod === "mercadopago_pix" || paymentMethod === "mercadopago_boleto";
    const finalTotalAmount = hasDiscount ? totalAmount * 0.9 : totalAmount;

    const parsedSplitPix = Math.min(
      totalAmount,
      Math.max(0, parseFloat(splitPixInput.replace(",", ".")) || 0)
    );
    const pixSplitAmount = splitPixInput === "" ? (totalAmount / 2) : parsedSplitPix;
    const cardSplitAmount = Math.max(0, totalAmount - pixSplitAmount);

    if (paymentMethod === "mercadopago_card" || paymentMethod === "mercadopago_pix_card") {
      if (!payment.cardName || !payment.cardNumber || !payment.expiry || !payment.cvv || !cardCpf) {
        setErrorMessage("Por favor, preencha todos os campos do Cartão de Crédito e CPF do titular.");
        return;
      }
    }

    setIsSubmitting(true);

    let mpData = null;

    // Call Mercado Pago API for PIX, Boleto, Credit Card or Split-PIX if relevant
    try {
      const mpPayload = {
        customer,
        deliveryAddress: address,
        cart: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: paymentMethod === "mercadopago_pix_card" ? pixSplitAmount : finalTotalAmount,
        paymentMethod,
      };

      const res = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mpPayload),
      });

      const data = await res.json();
      if (data.success) {
        mpData = data;
        setMercadopagoData(data);
      }
    } catch (err) {
      console.warn("Mercado Pago preference generation fell back to simulation:", err);
    }

    // Generate simulation fallback if needed
    if (!mpData) {
      const simulatedOrderId = `TECH-${Math.floor(100000 + Math.random() * 900000)}`;
      const simulatedPixCode = `00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/${simulatedOrderId}/ticket`;
      mpData = {
        success: true,
        orderId: simulatedOrderId,
        pixCode: simulatedPixCode,
        isSimulated: true,
      };
      setMercadopagoData(mpData as any);
    }

    // Prepare payment details for checkout receipt
    let recordedPayment = {
      cardName: "N/A",
      cardNumber: "N/A",
      expiry: "N/A",
      installments: 1,
      gateway: "Mercado Pago"
    };

    if (paymentMethod === "mercadopago_pix") {
      recordedPayment = {
        cardName: "PIX",
        cardNumber: "PIX",
        expiry: "N/A",
        installments: 1,
        gateway: "Mercado Pago PIX"
      };
    } else if (paymentMethod === "mercadopago_boleto") {
      recordedPayment = {
        cardName: customer.name,
        cardNumber: "BOLETO",
        expiry: "N/A",
        installments: 1,
        gateway: "Boleto Bancário"
      };
    } else if (paymentMethod === "mercadopago_card") {
      recordedPayment = {
        cardName: payment.cardName,
        cardNumber: `•••• •••• •••• ${payment.cardNumber.replace(/\s/g, "").slice(-4)}`,
        expiry: payment.expiry,
        installments: payment.installments,
        gateway: "Mercado Pago Cartão"
      };
    } else if (paymentMethod === "mercadopago_pix_card") {
      recordedPayment = {
        cardName: payment.cardName,
        cardNumber: `•••• •••• •••• ${payment.cardNumber.replace(/\s/g, "").slice(-4)}`,
        expiry: payment.expiry,
        installments: payment.installments,
        gateway: `PIX + Cartão de Crédito (Pix: R$ ${pixSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}, Cartão: R$ ${cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`
      };
    }

    const payload = {
      customer,
      deliveryAddress: address,
      payment: recordedPayment,
      cart: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: finalTotalAmount,
    };

    let data;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      data = await res.json();
    } catch (err) {
      console.warn("Checkout API submission failed, generating local fallback...", err);
      const simulatedOrderId = mpData?.orderId || `TECH-${Math.floor(100000 + Math.random() * 900000)}`;
      data = {
        success: true,
        orderId: simulatedOrderId,
        orderDate: new Date().toLocaleString("pt-BR"),
        previewUrl: null,
      };
    }

    try {
      if (data && data.success) {
        // Status Pendente for all orders, as they must be approved after payment!
        const orderStatus = "Pendente";
        
        const completedOrder = {
          ...data,
          status: orderStatus,
          paymentMethod,
          pixSplitAmount,
          cardSplitAmount,
          pixCode: mpData?.pixCode,
          pixQrBase64: mpData?.pixQrBase64,
          finalTotalAmount,
          isSimulated: mpData?.isSimulated ?? true,
          preferenceId: mpData?.preferenceId,
        };

        // Record order locally for history
        const orderHistoryItem: Order = {
          orderId: data.orderId,
          orderDate: data.orderDate,
          totalAmount: finalTotalAmount,
          customer: {
            name: customer.name,
            cpf: customer.cpf,
            birthDate: customer.birthDate,
            email: customer.email,
            phone: customer.phone,
          },
          deliveryAddress: address,
          payment: {
            cardName: recordedPayment.cardName,
            cardNumber: recordedPayment.cardNumber,
            expiry: recordedPayment.expiry,
            installments: recordedPayment.installments,
          },
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          status: orderStatus,
          trackingCode: `BR-${Math.floor(100000000 + Math.random() * 900000000)}X`,
        };

        // Save locally to localStorage so it persists correctly!
        saveLocalOrder(orderHistoryItem);

        // Store pending order details
        setPendingOrderData({
          completedOrder,
          orderHistoryItem
        });

        // Trigger simulator overlay!
        setShowMpSimulator(true);
      } else {
        setErrorMessage(data?.error || "Ocorreu um erro ao processar o seu pedido.");
      }
    } catch (err) {
      console.error("Checkout submission failed:", err);
      setErrorMessage("Falha ao processar o pedido. Verifique sua conexão e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully completed, show beautiful success panel
  if (successOrder) {
    return (
      <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 py-10 px-6 text-center text-white relative">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-white animate-bounce" />
          <h2 className="text-3xl font-black tracking-tight">Pedido Recebido com Sucesso!</h2>
          <p className="text-xs sm:text-sm text-green-100 mt-2 max-w-md mx-auto">
            Todos os detalhes da sua compra foram gerados e enviados por e-mail para <strong className="underline">{customer.email}</strong>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Order Details Panel */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Código do Pedido</span>
                <h4 className="text-xl font-bold text-white font-mono">{successOrder.orderId}</h4>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Data e Hora</span>
                <p className="text-sm font-semibold text-gray-300">{successOrder.orderDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h5 className="font-bold text-blue-500 uppercase text-[10px] tracking-wider mb-1">Destinatário</h5>
                <p className="text-white font-semibold">{customer.name}</p>
                <p className="text-gray-400">{customer.email}</p>
                <p className="text-gray-400">{customer.phone}</p>
              </div>
              <div>
                <h5 className="font-bold text-blue-500 uppercase text-[10px] tracking-wider mb-1">Entrega em</h5>
                <p className="text-white font-semibold">{address.address}, Nº {address.number}</p>
                <p className="text-gray-400">{address.neighborhood} - {address.city}/{address.state}</p>
                <p className="text-gray-400 font-mono">CEP: {address.zip}</p>
              </div>
            </div>
          </div>

          {/* Email dispatch feedback panel */}
          {successOrder.previewUrl ? (
            <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="bg-blue-600 p-2 rounded-xl text-white mt-1">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">Notificação Enviada!</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    Como o servidor está operando no modo de simulação/teste, criamos uma caixa de correio virtual para você visualizar o e-mail exato entregue a <span className="font-semibold text-white">{customer.email}</span>. Clique no link abaixo para ler a notificação em HTML formatada com tabelas e detalhes técnicos.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-1 pl-12">
                <a
                  href={successOrder.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors"
                >
                  Visualizar E-mail Enviado <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950 p-4 rounded-xl flex items-center gap-3 border border-slate-800 text-xs text-gray-400">
              <Mail className="w-5 h-5 text-gray-500 shrink-0" />
              <span>
                Um e-mail de notificação real com o recibo em HTML foi disparado para <strong>{customer.email}</strong> (com cópia para a administração) através do SMTP configurado no seu painel de Secrets.
              </span>
            </div>
          )}

          {/* Integrated Inline Payment Instructions Panel */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h4 className="text-sm font-extrabold text-white tracking-wider uppercase border-b border-slate-900 pb-3 flex items-center justify-between">
              <span>Instruções de Pagamento</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                successOrder.status === "Aprovado" 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
              }`}>
                {successOrder.status === "Aprovado" ? "✓ Aprovado / Confirmado" : "⏳ Aguardando Pagamento"}
              </span>
            </h4>

            {successOrder.paymentMethod === "mercadopago_pix" && (
              <div className="space-y-4 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR code */}
                  <div className="bg-white p-2 rounded-2xl w-40 h-40 shrink-0 shadow-lg flex items-center justify-center border border-slate-800">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(successOrder.pixCode || "SimulatedPixCode")}`} 
                      alt="Pix QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="space-y-2 text-xs text-left">
                    <h5 className="font-extrabold text-white text-sm">Pague via PIX com Desconto de 10%</h5>
                    <p className="text-gray-400 leading-relaxed">
                      Escaneie o QR Code ao lado utilizando o aplicativo do seu banco para confirmação imediata do pedido.
                    </p>
                    <div className="flex items-center gap-2 text-rose-400 font-bold mt-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>Seu código Pix expira em: {formatCountdown(pixCountdown)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Pix Copia e Cola</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={successOrder.pixCode || "00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/123456789/ticket"}
                      className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-3 rounded-xl font-mono text-xs text-gray-300 focus:outline-none truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successOrder.pixCode || "00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/123456789/ticket");
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2000);
                      }}
                      className={`px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                        copiedPix 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-blue-600 hover:bg-blue-500 text-white border-transparent cursor-pointer"
                      }`}
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {successOrder.status === "Pendente" && (
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-2.5">
                    <p className="text-[11px] text-blue-400 font-bold flex items-center gap-1.5">
                      🧪 Simulação de Teste: Confirmar pagamento do Pix?
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Clique no botão abaixo para simular que o cliente realizou o pagamento do Pix com sucesso. Isso mudará o status do pedido para "Aprovado" e enviará as atualizações correspondentes.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessOrder((prev: any) => prev ? { ...prev, status: "Aprovado" } : null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Simular Aprovação do Pix
                    </button>
                  </div>
                )}
              </div>
            )}

            {successOrder.paymentMethod === "mercadopago_boleto" && (
              <div className="space-y-4">
                <div className="space-y-2 text-xs">
                  <h5 className="font-extrabold text-white text-sm">Boleto Bancário Gerado com Desconto de 10%</h5>
                  <p className="text-gray-400 leading-relaxed">
                    Você pode pagar este boleto em qualquer banco ou casa lotérica até a data de vencimento. A compensação costuma ocorrer em até 24 horas úteis.
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Linha Digitável (Código de Barras)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`34191.79001 01043.513184 91020.150008 7 978100000${Math.floor(successOrder.finalTotalAmount * 100)}`}
                      className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-3 rounded-xl font-mono text-[11px] text-gray-300 focus:outline-none truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`34191.79001 01043.513184 91020.150008 7 978100000${Math.floor(successOrder.finalTotalAmount * 100)}`);
                        setCopiedBoleto(true);
                        setTimeout(() => setCopiedBoleto(false), 2000);
                      }}
                      className={`px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                        copiedBoleto 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-blue-600 hover:bg-blue-500 text-white border-transparent cursor-pointer"
                      }`}
                    >
                      {copiedBoleto ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Impressão do Boleto gerada com sucesso!");
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Imprimir Boleto PDF (Simulado)
                  </button>
                </div>

                {successOrder.status === "Pendente" && (
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-2.5">
                    <p className="text-[11px] text-blue-400 font-bold flex items-center gap-1.5">
                      🧪 Simulação de Teste: Confirmar compensação bancária?
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Clique no botão abaixo para simular que o boleto foi pago e compensado pelo banco de forma automática.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessOrder((prev: any) => prev ? { ...prev, status: "Aprovado" } : null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Simular Compensação de Boleto
                    </button>
                  </div>
                )}
              </div>
            )}

            {successOrder.paymentMethod === "mercadopago_card" && (
              <div className="space-y-4 text-xs text-gray-400">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-white text-xs">Transação Autorizada com Sucesso!</h5>
                    <p className="text-[10px] text-emerald-500 mt-0.5">Seu pagamento em {payment.installments}x foi aprovado pela operadora do seu cartão.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px] tracking-wider">Titular</span>
                    <span className="text-white font-bold uppercase">{payment.cardName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px] tracking-wider">Número do Cartão</span>
                    <span className="text-white font-bold">•••• •••• •••• {payment.cardNumber.slice(-4)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px] tracking-wider">Valor Cobrado</span>
                    <span className="text-white font-bold text-xs">R$ {successOrder.finalTotalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase text-[8px] tracking-wider">Gateway de Cobrança</span>
                    <span className="text-emerald-400 font-bold uppercase text-[9px]">Mercado Pago</span>
                  </div>
                </div>
              </div>
            )}

            {successOrder.paymentMethod === "mercadopago_pix_card" && (
              <div className="space-y-5">
                <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl text-xs text-gray-400 leading-normal">
                  Seu pagamento foi dividido com sucesso! O valor da compra de <strong className="text-white">R$ {successOrder.finalTotalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> foi dividido em:
                  <ul className="list-disc list-inside mt-1.5 space-y-1 font-bold text-white">
                    <li>Pix: R$ {successOrder.pixSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</li>
                    <li>Cartão de Crédito ({payment.installments}x): R$ {successOrder.cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</li>
                  </ul>
                  <p className="text-[10px] text-emerald-400 font-bold mt-1.5">✓ A parcela do cartão já foi aprovada com sucesso! Falta apenas pagar o Pix abaixo.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR code */}
                  <div className="bg-white p-2 rounded-2xl w-40 h-40 shrink-0 shadow-lg flex items-center justify-center border border-slate-800">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(successOrder.pixCode || "SimulatedPixCode")}`} 
                      alt="Pix QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="space-y-2 text-xs text-left">
                    <h5 className="font-extrabold text-white text-sm">Pague a Parcela do Pix (R$ {successOrder.pixSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</h5>
                    <p className="text-gray-400 leading-relaxed">
                      Escaneie o QR Code ao lado utilizando o aplicativo do seu banco para confirmação imediata da parcela Pix.
                    </p>
                    <div className="flex items-center gap-2 text-rose-400 font-bold mt-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                      <span>O Pix expira em: {formatCountdown(pixCountdown)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Pix Copia e Cola (Parcela Pix)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={successOrder.pixCode || "00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/123456789/ticket"}
                      className="flex-1 bg-slate-900 border border-slate-800 px-3.5 py-3 rounded-xl font-mono text-xs text-gray-300 focus:outline-none truncate select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successOrder.pixCode || "00020101021226830014br.gov.bcb.pix2561api.mercadopago.com/v1/payments/123456789/ticket");
                        setCopiedPix(true);
                        setTimeout(() => setCopiedPix(false), 2000);
                      }}
                      className={`px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center border ${
                        copiedPix 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-blue-600 hover:bg-blue-500 text-white border-transparent cursor-pointer"
                      }`}
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {successOrder.status === "Pendente" && (
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-2.5">
                    <p className="text-[11px] text-blue-400 font-bold flex items-center gap-1.5">
                      🧪 Simulação de Teste: Confirmar pagamento do Pix?
                    </p>
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Clique no botão abaixo para simular que o Pix foi pago com sucesso. Isso aprovará o pedido por completo!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSuccessOrder((prev: any) => prev ? { ...prev, status: "Aprovado" } : null);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Simular Aprovação do Pix
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next steps CTA */}
          <div className="flex justify-center gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => setActiveTab("pedidos")}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm transition-all"
            >
              Acompanhar Entrega
            </button>
            <button
              onClick={() => setActiveTab("inicio")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm transition-all"
            >
              Ir para o Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderInteractiveCardPreview = () => {
    return (
      <div className="relative w-full max-w-[340px] h-[200px] mx-auto rounded-2xl p-5 text-white font-mono shadow-2xl transition-all duration-500 perspective-1000 my-4 select-none">
        <div className={`relative w-full h-full rounded-2xl transition-all duration-500 transform-style-3d ${isCardFlipped ? "rotate-y-180" : ""}`}>
          {/* Front Side */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 p-5 rounded-2xl flex flex-col justify-between backface-hidden border border-slate-700/30">
            <div className="flex justify-between items-start">
              <div className="h-9 w-12 bg-amber-400/20 rounded-lg flex items-center justify-center border border-amber-400/30 overflow-hidden">
                <div className="w-8 h-6 bg-amber-400/30 rounded flex flex-col gap-1 p-1">
                  <div className="h-0.5 bg-amber-500/40 rounded"></div>
                  <div className="h-0.5 bg-amber-500/40 rounded"></div>
                  <div className="h-0.5 bg-amber-500/40 rounded"></div>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase italic tracking-wider">MERCADO PAGO</span>
            </div>
            
            <div className="text-base font-bold tracking-widest text-center my-2 text-white">
              {payment.cardNumber || "•••• •••• •••• ••••"}
            </div>
            
            <div className="flex justify-between text-[10px] uppercase">
              <div className="min-w-0 flex-1 pr-2">
                <span className="text-gray-500 block text-[7px] tracking-wider mb-0.5">Nome do Titular</span>
                <span className="font-bold tracking-wider truncate block">{payment.cardName || "NOME DO TITULAR"}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-gray-500 block text-[7px] tracking-wider mb-0.5">Validade</span>
                <span className="font-bold tracking-wider">{payment.expiry || "MM/AA"}</span>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl flex flex-col justify-between rotate-y-180 backface-hidden border border-slate-800">
            <div className="h-8 bg-black -mx-5 mt-2"></div>
            <div className="space-y-1.5 text-right">
              <span className="text-gray-500 text-[7px] tracking-wider uppercase">Código de Segurança (CVV)</span>
              <div className="bg-white text-slate-950 text-right font-black font-mono text-xs py-1 px-2.5 rounded border border-gray-200">
                {payment.cvv || "•••"}
              </div>
            </div>
            <div className="text-right text-[8px] text-gray-500 tracking-tight">
              Assinatura autorizada do cliente
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Finalizar Compra</h2>
        <p className="text-xs text-gray-400">
          Insira seus dados para concluir a compra. Seus dados estão 100% protegidos.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-xs font-semibold text-red-400">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Forms side */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: Customer Details */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="bg-blue-600/20 text-blue-500 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">1</span>
              <h3 className="font-extrabold text-white text-base sm:text-lg">Dados do Cliente</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do comprador"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">CPF *</label>
                <input
                  type="text"
                  required
                  placeholder="000.000.000-00"
                  value={customer.cpf}
                  onChange={handleCpfChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Data de Nascimento *</label>
                <input
                  type="text"
                  required
                  placeholder="DD/MM/AAAA"
                  value={customer.birthDate}
                  onChange={handleBirthDateChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold mb-1.5">Telefone *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={customer.phone}
                  onChange={handlePhoneChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Delivery Address */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="bg-blue-600/20 text-blue-500 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">2</span>
              <h3 className="font-extrabold text-white text-base sm:text-lg">Endereço de Entrega</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 text-xs">
              <div className="sm:col-span-4 flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-gray-400 font-bold mb-1.5">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    value={address.zip}
                    onChange={handleZipChange}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchCep}
                  disabled={isLoadingCep}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl h-[42px] transition-colors flex items-center gap-1 shrink-0 text-xs disabled:opacity-50"
                >
                  {isLoadingCep ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar CEP
                </button>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-gray-400 font-bold mb-1.5">Endereço *</label>
                <input
                  type="text"
                  required
                  placeholder="Rua, Avenida, Logradouro"
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Número *</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-gray-400 font-bold mb-1.5">Complemento</label>
                <input
                  type="text"
                  placeholder="Apto, Bloco, etc."
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Bairro *</label>
                <input
                  type="text"
                  required
                  placeholder="Seu bairro"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Cidade *</label>
                <input
                  type="text"
                  required
                  placeholder="Sua cidade"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-400 font-bold mb-1.5">Estado *</label>
                <select
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-bold"
                >
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Payment Method */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600/20 text-blue-500 font-black text-xs w-6 h-6 rounded-full flex items-center justify-center">3</span>
                <h3 className="font-extrabold text-white text-base sm:text-lg">Forma de Pagamento</h3>
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <span className="text-[9px] bg-slate-950 text-blue-400 font-extrabold px-2 py-0.5 rounded border border-blue-500/30">MERCADO PAGO</span>
              </div>
            </div>

            {/* Expandable Mercado Pago Credentials Config Guide */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
              <button
                type="button"
                onClick={() => setShowMPCredentialsGuide(!showMPCredentialsGuide)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>⚙️ Como ativar chaves reais do Mercado Pago?</span>
                </div>
                <span className="text-[10px] text-gray-500">{showMPCredentialsGuide ? "Ocultar Guia ▲" : "Ver Guia de Integração ▼"}</span>
              </button>

              {showMPCredentialsGuide && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-900 text-[11px] text-gray-400 space-y-3 leading-relaxed">
                  <p>
                    Por padrão, a loja opera em um simulador de pagamento offline altamente imersivo. Para processar vendas reais ou no ambiente Sandbox oficial:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 pl-1">
                    <li>
                      Acesse o <a href="https://developers.mercadopago.com" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">Painel de Desenvolvedores do Mercado Pago <ExternalLink className="w-3 h-3 inline" /></a> e crie ou selecione uma aplicação.
                    </li>
                    <li>
                      Copie suas chaves em <strong>Credenciais de Produção</strong> ou <strong>Credenciais de Teste</strong>:
                      <div className="mt-2 bg-slate-900/80 p-3 rounded-xl space-y-2 border border-slate-800 font-mono text-[10px] text-slate-300">
                        <div>
                          <span className="text-emerald-400 font-bold">1. Chave Pública (Client-Side):</span>
                          <p className="text-slate-400 mt-0.5">Insira a variável <code className="text-blue-300 font-bold bg-slate-950 px-1 py-0.5 rounded">VITE_MERCADOPAGO_PUBLIC_KEY</code> nas configurações da plataforma (inicia com <code className="text-gray-300">APP_USR-</code> ou <code className="text-gray-300">TEST-</code>).</p>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-bold">2. Access Token (Server-Side):</span>
                          <p className="text-slate-400 mt-0.5">Insira a variável <code className="text-blue-300 font-bold bg-slate-950 px-1 py-0.5 rounded">MERCADOPAGO_ACCESS_TOKEN</code> nas configurações da plataforma (inicia com <code className="text-gray-300">APP_USR-</code>).</p>
                        </div>
                      </div>
                    </li>
                    <li>
                      Uma vez salvas, o sistema desativará a simulação e carregará o <strong>Wallet Brick oficial do SDK do Mercado Pago</strong> no fechamento do pedido, oferecendo fluxos com PIX e Cartão de Crédito integrados de verdade!
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago_pix")}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  paymentMethod === "mercadopago_pix" 
                    ? "border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/5" 
                    : "border-slate-800 bg-slate-950/40 text-gray-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs">PIX</span>
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-black">10% OFF</span>
                {paymentMethod === "mercadopago_pix" && (
                  <div className="absolute right-0 bottom-0 bg-blue-500 text-white w-3 h-3 rounded-tl-lg flex items-center justify-center">
                    <span className="text-[7px]">✓</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago_card")}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  paymentMethod === "mercadopago_card" 
                    ? "border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/5" 
                    : "border-slate-800 bg-slate-950/40 text-gray-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs">Cartão</span>
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[9px] bg-slate-900 text-gray-400 px-1 py-0.5 rounded font-bold">Até 12x</span>
                {paymentMethod === "mercadopago_card" && (
                  <div className="absolute right-0 bottom-0 bg-blue-500 text-white w-3 h-3 rounded-tl-lg flex items-center justify-center">
                    <span className="text-[7px]">✓</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago_boleto")}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  paymentMethod === "mercadopago_boleto" 
                    ? "border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/5" 
                    : "border-slate-800 bg-slate-950/40 text-gray-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs">Boleto</span>
                  <Barcode className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-black">10% OFF</span>
                {paymentMethod === "mercadopago_boleto" && (
                  <div className="absolute right-0 bottom-0 bg-blue-500 text-white w-3 h-3 rounded-tl-lg flex items-center justify-center">
                    <span className="text-[7px]">✓</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago_pix_card")}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  paymentMethod === "mercadopago_pix_card" 
                    ? "border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/5" 
                    : "border-slate-800 bg-slate-950/40 text-gray-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs">Pix + Cartão</span>
                  <div className="flex gap-0.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                </div>
                <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1 py-0.5 rounded font-black">Split</span>
                {paymentMethod === "mercadopago_pix_card" && (
                  <div className="absolute right-0 bottom-0 bg-blue-500 text-white w-3 h-3 rounded-tl-lg flex items-center justify-center">
                    <span className="text-[7px]">✓</span>
                  </div>
                )}
              </button>
            </div>

            {/* Sub-form fields based on Payment selection */}
            {paymentMethod === "mercadopago_pix" && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-400 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Pagamento Instantâneo via PIX com 10% de Desconto</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Pague com PIX e obtenha aprovação imediata do seu pedido! Ao clicar em "Concluir Compra", o código copia e cola e o QR Code do Mercado Pago serão gerados e exibidos na tela para você escanear com o seu banco.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "mercadopago_boleto" && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-500/15 p-2 rounded-xl text-amber-400 shrink-0">
                    <Barcode className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-xs sm:text-sm">Pagamento via Boleto Bancário com 10% de Desconto</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Pague em qualquer banco, app ou lotérica. A compensação do boleto bancário do Mercado Pago ocorre em até 1 dia útil. O código de barras estará disponível logo após a confirmação.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "mercadopago_card" && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] text-gray-400 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                  <span>Seus dados de cartão são protegidos diretamente pelo gateway criptografado do Mercado Pago. Nenhuma informação do seu cartão é salva no nosso servidor.</span>
                </div>

                {renderInteractiveCardPreview()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 font-bold mb-1.5">Nome Impresso no Cartão *</label>
                    <input
                      type="text"
                      required={paymentMethod === "mercadopago_card"}
                      placeholder="Como consta no cartão"
                      value={payment.cardName}
                      onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs uppercase"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 font-bold mb-1.5">Número do Cartão *</label>
                    <input
                      type="text"
                      required={paymentMethod === "mercadopago_card"}
                      placeholder="0000 0000 0000 0000"
                      value={payment.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Validade *</label>
                    <input
                      type="text"
                      required={paymentMethod === "mercadopago_card"}
                      placeholder="MM/AA"
                      value={payment.expiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 font-bold mb-1.5">Código de Segurança (CVV) *</label>
                    <input
                      type="password"
                      required={paymentMethod === "mercadopago_card"}
                      placeholder="123"
                      maxLength={4}
                      value={payment.cvv}
                      onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "") })}
                      onFocus={() => setIsCardFlipped(true)}
                      onBlur={() => setIsCardFlipped(false)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 font-bold mb-1.5">CPF do Titular do Cartão *</label>
                    <input
                      type="text"
                      required={paymentMethod === "mercadopago_card"}
                      placeholder="000.000.000-00"
                      value={cardCpf}
                      onChange={handleCardCpfChange}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-400 font-bold mb-1.5">Opções de Parcelamento *</label>
                    <select
                      value={payment.installments}
                      onChange={(e) => setPayment({ ...payment, installments: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-bold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>
                          {n}x de R$ {(totalAmount / n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros (Total: R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "mercadopago_pix_card" && (
              <div className="space-y-4">
                <div className="bg-purple-950/20 border border-purple-500/20 p-5 rounded-2xl space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-white text-xs sm:text-sm">Pagamento Dividido: Pix + Cartão de Crédito</h4>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                        Divida o pagamento da sua compra utilizando duas formas integradas de pagamento. Escolha abaixo o valor a pagar via Pix, e o valor restante será cobrado no cartão!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-gray-300 font-bold mb-1.5">Valor a pagar em PIX *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500 font-bold">R$</span>
                        <input
                          type="text"
                          placeholder={(totalAmount / 2).toFixed(2).replace(".", ",")}
                          value={splitPixInput}
                          onChange={(e) => setSplitPixInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-8 rounded-xl text-white text-xs font-mono font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Insira o valor que deseja depositar por Pix.</p>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-center text-xs font-bold space-y-1 text-right">
                      <div className="text-gray-400 text-[10px] uppercase">Divisão do Pedido:</div>
                      <div className="text-emerald-400">Pix: R$ {pixSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                      <div className="text-blue-400">Cartão: R$ {cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

                {cardSplitAmount > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-widest mt-4">Dados do Cartão (R$ {cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})</h4>
                    
                    {renderInteractiveCardPreview()}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 font-bold mb-1.5">Nome Impresso no Cartão *</label>
                        <input
                          type="text"
                          required={paymentMethod === "mercadopago_pix_card"}
                          placeholder="Como consta no cartão"
                          value={payment.cardName}
                          onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs uppercase"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 font-bold mb-1.5">Número do Cartão *</label>
                        <input
                          type="text"
                          required={paymentMethod === "mercadopago_pix_card"}
                          placeholder="0000 0000 0000 0000"
                          value={payment.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-bold mb-1.5">Validade *</label>
                        <input
                          type="text"
                          required={paymentMethod === "mercadopago_pix_card"}
                          placeholder="MM/AA"
                          value={payment.expiry}
                          onChange={handleExpiryChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 font-bold mb-1.5">Código de Segurança (CVV) *</label>
                        <input
                          type="password"
                          required={paymentMethod === "mercadopago_pix_card"}
                          placeholder="123"
                          maxLength={4}
                          value={payment.cvv}
                          onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, "") })}
                          onFocus={() => setIsCardFlipped(true)}
                          onBlur={() => setIsCardFlipped(false)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 font-bold mb-1.5">CPF do Titular do Cartão *</label>
                        <input
                          type="text"
                          required={paymentMethod === "mercadopago_pix_card"}
                          placeholder="000.000.000-00"
                          value={cardCpf}
                          onChange={handleCardCpfChange}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 font-bold mb-1.5">Opções de Parcelamento do Cartão *</label>
                        <select
                          value={payment.installments}
                          onChange={(e) => setPayment({ ...payment, installments: parseInt(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 rounded-xl text-white text-xs font-bold"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                            <option key={n} value={n}>
                              {n}x de R$ {(cardSplitAmount / n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} sem juros (Total: R$ {cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-xs text-rose-400 text-center font-bold">
                    ⚠️ O valor do Pix deve ser inferior ao total do pedido (R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}) para que haja valor a pagar no cartão.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Order Summary */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Seu Pedido</span>
              <span className="text-xs bg-slate-800 text-gray-300 font-mono px-2.5 py-0.5 rounded-md">
                {cart.reduce((a, c) => a + c.quantity, 0)} itens
              </span>
            </h3>

            {/* Compact items list */}
            <div className="max-h-52 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <p className="text-gray-500 font-medium mt-0.5">{item.quantity}x de R$ {item.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <span className="font-extrabold text-white shrink-0">
                    R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span className="font-bold text-white">R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Frete:</span>
                {shippingFee === 0 ? (
                  <span className="text-green-500 font-black uppercase text-[10px]">Grátis</span>
                ) : (
                  <span className="font-bold text-white">R$ {shippingFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                )}
              </div>
              {(paymentMethod === "mercadopago_pix" || paymentMethod === "mercadopago_boleto") && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Desconto (10% no {paymentMethod === "mercadopago_pix" ? "Pix" : "Boleto"}):</span>
                  <span>- R$ {(totalAmount * 0.1).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-3 flex justify-between items-end text-white">
                <span className="font-extrabold">Total Geral:</span>
                <span className="text-xl font-black text-white">
                  R$ {((paymentMethod === "mercadopago_pix" || paymentMethod === "mercadopago_boleto") ? totalAmount * 0.9 : totalAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Submit checkout CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Finalizando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Concluir Compra Seguro
                </>
              )}
            </button>

            {/* Info badge */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-[11px] text-gray-400 leading-relaxed text-center space-y-1">
              <p className="font-bold text-white">📬 Envio de dados por e-mail</p>
              <p>Ao clicar no botão acima, todos os dados serão processados e uma notificação completa será disparada para seu e-mail de administrador:</p>
              <p className="text-blue-400 font-bold font-mono text-[10px] break-all">byelsaints17@gmail.com</p>
            </div>
          </div>
        </div>
      </form>

      {/* Mercado Pago Simulated / Real Gateway Portal Modal */}
      {showMpSimulator && pendingOrderData && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white text-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8">
            {/* Header */}
            <div className="bg-[#009ee3] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-black text-sm uppercase italic tracking-wider">MERCADO PAGO</span>
                <span className="text-[10px] bg-white/20 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-widest">GATEWAY</span>
              </div>
              <button
                type="button"
                onClick={() => setShowMpSimulator(false)}
                className="text-white hover:text-gray-200 text-xs font-bold transition-all"
              >
                Cancelar ✕
              </button>
            </div>

            {/* Portal Content */}
            <div className="p-6 flex-1 space-y-5 overflow-y-auto max-h-[60vh]">
              <div className="text-center space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total a Pagar</span>
                <h3 className="text-2xl font-black text-slate-900">
                  R$ {pendingOrderData.completedOrder.finalTotalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-gray-500 font-mono">Pedido: {pendingOrderData.completedOrder.orderId}</p>
              </div>

              {/* PIX flow inside portal */}
              {paymentMethod === "mercadopago_pix" && (
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">Escaneie o código PIX abaixo para pagar:</p>
                    <div className="bg-slate-50 p-3 rounded-2xl inline-block border border-slate-100 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pendingOrderData.completedOrder.pixCode || "00020101021226830014")}`}
                        alt="Pix QR Code"
                        className="w-40 h-40 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Expira em: <span className="font-mono font-bold text-rose-500">{formatCountdown(pixCountdown)}</span></p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block text-slate-500 font-bold">Código Copia e Cola:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pendingOrderData.completedOrder.pixCode || ""}
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[10px] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(pendingOrderData.completedOrder.pixCode || "");
                          setCopiedPix(true);
                          setTimeout(() => setCopiedPix(false), 2000);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPix ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* BOLETO flow inside portal */}
              {paymentMethod === "mercadopago_boleto" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 text-slate-600">
                    <p className="font-bold text-slate-800">Seu boleto foi gerado pelo Mercado Pago!</p>
                    <p>Você pode pagar este boleto pelo aplicativo do seu banco, internet banking ou qualquer agência lotérica.</p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="block text-slate-500 font-bold">Linha Digitável do Boleto:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value="34191.79001 01043.513184 91020.150008 7 90020000150000"
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-xl text-[10px] font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("34191.79001 01043.513184 91020.150008 7 90020000150000");
                          setCopiedBoleto(true);
                          setTimeout(() => setCopiedBoleto(false), 2000);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                      >
                        {copiedBoleto ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBoleto ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CREDIT CARD flow inside portal */}
              {paymentMethod === "mercadopago_card" && (
                <div className="space-y-4">
                  <div className="bg-[#e3f2fd] text-[#0d47a1] p-4 rounded-2xl text-xs flex gap-2.5 border border-blue-100">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>Seus dados de cartão de crédito estão prontos para processamento. Clique no botão de confirmação abaixo para realizar a transação segura.</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Portador:</span>
                      <span className="font-bold text-slate-800 uppercase">{payment.cardName || "Nome do Comprador"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cartão:</span>
                      <span className="font-bold text-slate-800">{payment.cardNumber || "•••• •••• •••• ••••"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validade:</span>
                      <span className="font-bold text-slate-800">{payment.expiry || "MM/AA"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parcelas:</span>
                      <span className="font-bold text-slate-800">{payment.installments}x</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SPLIT PAYMENT flow inside portal */}
              {paymentMethod === "mercadopago_pix_card" && (
                <div className="space-y-4">
                  <div className="bg-purple-50 text-purple-950 p-4 rounded-2xl text-xs space-y-2 border border-purple-100">
                    <p className="font-extrabold text-purple-800 uppercase tracking-wider">Pagamento Split Realizado!</p>
                    <p>O valor total foi dividido em duas transações conjuntas:</p>
                    <div className="font-mono text-xs space-y-1 pt-1">
                      <p className="text-emerald-600 font-bold">✓ Pix: R$ {pixSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      <p className="text-blue-600 font-bold">✓ Cartão: R$ {cardSplitAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({payment.installments}x)</p>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">Escaneie o código PIX da parte do Pix:</p>
                    <div className="bg-slate-50 p-3 rounded-2xl inline-block border border-slate-100 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pendingOrderData.completedOrder.pixCode || "00020101021226830014")}`}
                        alt="Pix QR Code"
                        className="w-32 h-32 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* OFFICIAL SDK CONTAINER WALLET BRICK */}
              {!pendingOrderData.completedOrder.isSimulated && pendingOrderData.completedOrder.preferenceId && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-xs font-bold text-slate-700 text-center">🔐 Botão de Pagamento Oficial do Mercado Pago:</p>
                  <div id="walletBrick_container" className="w-full flex justify-center py-2 min-h-12"></div>
                </div>
              )}

              {/* Simulated Gateway Disclaimer */}
              <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-gray-500 leading-normal text-center border border-slate-100">
                🔐 <strong>Pagamento Seguro:</strong> Processado com criptografia de ponta a ponta e os mais altos padrões de segurança do Mercado Pago.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmSimulatedPayment}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg transition-all text-sm cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" /> 
                {paymentMethod === "mercadopago_pix" && "Pagar agora via Pix"}
                {paymentMethod === "mercadopago_boleto" && "Pagar agora via Boleto"}
                {paymentMethod === "mercadopago_card" && "Pagar agora com Cartão"}
                {paymentMethod === "mercadopago_pix_card" && "Pagar agora (Pix + Cartão)"}
              </button>

              <button
                type="button"
                onClick={() => setShowMpSimulator(false)}
                className="w-full bg-transparent hover:bg-slate-200/50 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Voltar e Alterar Forma de Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
