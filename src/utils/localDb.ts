import { Product, Order, UserAccount } from "../types";

// Check if we are running in the AI Studio environment or local development
export const isDevEnv = (): boolean => {
  return true; // Permanently visible/unlocked so the admin panel button is always available in any environment, including Vercel
};

// Default Products List matching server.ts
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max 256GB",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    description: "O mais poderoso iPhone com acabamento em Titânio, câmera inovadora de 48 MP e chip A17 Pro super veloz para jogos e produtividade.",
    price: 8499.00,
    originalPrice: 12749.00,
    category: "celulares",
    specs: ["Tela de 6.7\" Super Retina XDR OLED", "Câmera Tripla: 48MP + 12MP + 12MP", "RAM: 8GB", "Armazenamento: 256GB", "Processador: Apple A17 Pro", "Bateria: 4441 mAh"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80",
    stock: 14,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "samsung-galaxy-s24",
    name: "Samsung Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    description: "Smartphone com inteligência artificial Galaxy AI integrada para tradução simultânea, fotos de 200MP e zoom ótico extraordinário de 10x.",
    price: 6599.00,
    originalPrice: 9899.00,
    category: "celulares",
    specs: ["Tela de 6.8\" Dynamic AMOLED 2X", "Câmera: 200MP + 50MP + 12MP + 10MP", "RAM: 12GB", "Armazenamento: 512GB", "Bateria: 5000 mAh", "Processador: Snapdragon 8 Gen 3"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80",
    stock: 25,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "macbook-air-m3",
    name: "MacBook Air M3 13 polegadas",
    brand: "Apple",
    model: "MacBook Air M3",
    description: "Ultrafino, incrivelmente rápido e com autonomia de bateria de até 18 horas graças ao inovador processador M3 da Apple.",
    price: 7999.00,
    originalPrice: 11999.00,
    category: "notebooks",
    specs: ["Tela Retina de 13.6\" de alta fidelidade", "Processador Apple M3 de 8 núcleos", "RAM: 8GB unificada", "Armazenamento: 256GB SSD super rápido", "Bateria com duração de até 18 horas", "Sistema Operacional macOS"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    stock: 8,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "dell-inspiron-15",
    name: "Notebook Dell Inspiron 15 i5",
    brand: "Dell",
    model: "Inspiron 15 3000",
    description: "O notebook ideal para trabalhar, estudar e se divertir com processador Intel Core de 12ª Geração, tela Full HD e SSD ultra veloz.",
    price: 3299.00,
    originalPrice: 4949.00,
    category: "notebooks",
    specs: ["Processador: Intel Core i5-1235U", "RAM: 8GB DDR4", "SSD: 512GB NVMe M.2", "Tela: 15.6\" Full HD WVA", "Sistema: Windows 11 Home", "Gráficos Intel UHD"],
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&q=80",
    stock: 18,
    warranty: "1 ano com assistência local"
  },
  {
    id: "ipad-air-m2",
    name: "iPad Air M2 11\" Apple Wi-Fi",
    brand: "Apple",
    model: "iPad Air M2",
    description: "iPad Air redesenhado com o chip M2, oferecendo velocidade absurda para ilustração, edição de vídeo e jogos de última geração.",
    price: 4999.00,
    originalPrice: 7499.00,
    category: "tablets",
    specs: ["Tela Liquid Retina de 11\"", "Processador Apple M2 Octa-Core", "Armazenamento: 128GB", "Câmera Traseira de 12MP com gravação 4K", "Compatível com Apple Pencil Pro"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80",
    stock: 12,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "galaxy-tab-s9-fe",
    name: "Samsung Galaxy Tab S9 FE 128GB",
    brand: "Samsung",
    model: "Galaxy Tab S9 FE",
    description: "Aproveite a resistência à água IP68, caneta S-Pen inclusa na caixa, tela fluida de 90Hz e bateria de longa duração para estudar ou produzir.",
    price: 2499.00,
    originalPrice: 3749.00,
    category: "tablets",
    specs: ["Tela de 10.9\" IPS 90Hz", "Processador Exynos 1380", "Armazenamento: 128GB + Slot MicroSD", "RAM: 6GB", "Resistência à água e poeira IP68", "Acompanha S-Pen inteligente"],
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=500&q=80",
    stock: 15,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "monitor-ultragear-27",
    name: "Monitor Gamer LG UltraGear 27\" IPS 144Hz",
    brand: "LG",
    model: "UltraGear 27GN650",
    description: "Desempenho profissional de alto nível com painel IPS de 1ms real, taxa de atualização de 144Hz fluida e compatibilidade com G-Sync/FreeSync.",
    price: 1399.00,
    originalPrice: 2099.00,
    category: "monitores",
    specs: ["Tamanho: 27 polegadas IPS", "Taxa de Atualização: 144Hz", "Tempo de Resposta: 1ms (GtG)", "Resolução: Full HD (1920x1080)", "Suporte ajustável de altura e rotação (Pivot)"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
    stock: 10,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "epson-ecotank-l3250",
    name: "Impressora Multifuncional Epson EcoTank L3250",
    brand: "Epson",
    model: "EcoTank L3250",
    description: "Líder de mercado em economia: sistema de tanques de tinta 100% sem cartuchos, conexão Wi-Fi Direct integrada e cópia inteligente por app.",
    price: 1099.00,
    originalPrice: 1649.00,
    category: "impressoras",
    specs: ["Tecnologia de Jato de Tinta MicroPiezo", "Conectividade Wi-Fi e Wi-Fi Direct", "Rendimento: até 4.500 páginas em preto", "Multifuncional: Imprime, Copia e Digitaliza"],
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80",
    stock: 22,
    warranty: "2 anos mediante registro"
  },
  {
    id: "smart-tv-lg-oled-55",
    name: "Smart TV 55\" LG OLED evo C3 4K",
    brand: "LG",
    model: "OLED55C3PSA",
    description: "A melhor TV Gamer e Cinematográfica do mundo. Pixels que se autoiluminam para preto puro, painel OLED evo brilhante, 120Hz e som imersivo Dolby Atmos.",
    price: 5499.00,
    originalPrice: 8249.00,
    category: "tvs",
    specs: ["Tela de 55 polegadas OLED evo 4K", "Frequência nativa de 120Hz", "Processador α9 Gen6 AI 4K", "4 entradas HDMI 2.1 completas", "G-Sync, FreeSync e VRR de fábrica"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&q=80",
    stock: 6,
    warranty: "1 ano com assistência premium"
  },
  {
    id: "apple-watch-s9",
    name: "Apple Watch Series 9 GPS 45mm",
    brand: "Apple",
    model: "Series 9",
    description: "Processador S9 super veloz, gesto de toque duplo mágico, brilho de tela duplicado e monitoramento avançado de oxigênio no sangue e sono.",
    price: 3499.00,
    originalPrice: 5249.00,
    category: "smartwatches",
    specs: ["Caixa de Alumínio de 45mm", "Tela Retina Sempre Ativa de 2000 nits", "Sensor de temperatura corporal e Oxímetro", "Gesto de Toque Duplo revolucionário"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&q=80",
    stock: 16,
    warranty: "1 ano oficial Apple"
  },
  {
    id: "jbl-tune-520bt",
    name: "Fone de Ouvido Bluetooth JBL Tune 520BT",
    brand: "JBL",
    model: "Tune 520BT",
    description: "Som JBL Pure Bass potente, bateria com duração extraordinária de até 57 horas e recarga rápida em apenas 5 minutos.",
    price: 249.00,
    originalPrice: 373.00,
    category: "fones",
    specs: ["Conexão Bluetooth 5.3 estável", "Até 57 horas de reprodução contínua", "Recarga rápida por USB-C (5 min = 3h)", "Design dobrável e extremamente leve"],
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    stock: 45,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "logitech-mx-master-3s",
    name: "Mouse Ergonômico Logitech MX Master 3S",
    brand: "Logitech",
    model: "MX Master 3S",
    description: "O mouse definitivo para desenvolvedores, designers e criadores. Sensor silencioso de 8000 DPI que funciona em qualquer superfície, até vidro.",
    price: 599.00,
    originalPrice: 899.00,
    category: "perifericos",
    specs: ["Sensor óptico Darkfield de 8.000 DPI", "Cliques super silenciosos", "Roda MagSpeed metálica de rolagem rápida", "Bateria recarregável via USB-C (até 70 dias)"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
    stock: 30,
    warranty: "1 ano nacional"
  },
  {
    id: "nvidia-rtx-4070-ti",
    name: "Placa de Vídeo ASUS ROG Strix RTX 4070 Ti 12GB",
    brand: "ASUS",
    model: "ROG Strix GeForce RTX 4070 Ti",
    description: "Arquitetura ultra-eficiente NVIDIA Ada Lovelace com Ray Tracing de 3ª geração e DLSS 3 por inteligência artificial para taxas de quadro monstruosas.",
    price: 5999.00,
    originalPrice: 8999.00,
    category: "pecas",
    specs: ["Memória de Vídeo: 12GB GDDR6X", "Interface de Memória: 192-bit", "Suporte a DLSS 3.0 e Ray Tracing nativo", "Conexões: 3x DisplayPort 1.4, 2x HDMI 2.1"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80",
    stock: 5,
    warranty: "3 anos com o fabricante"
  },
  {
    id: "ps5-slim-slim",
    name: "PlayStation 5 Slim 1TB Edição Digital",
    brand: "Sony",
    model: "PlayStation 5 Slim",
    description: "Experimente o carregamento super rápido do SSD ultra-veloz, imersão total com feedback tátil, gatilhos adaptáveis e áudio 3D 3D imersivo.",
    price: 3799.00,
    originalPrice: 5699.00,
    category: "gamer",
    specs: ["Armazenamento: 1TB SSD customizado", "Gatilhos Adaptáveis no controle DualSense", "Suporte a Ray Tracing e resolução de até 4K 120Hz", "Tecnologia de Áudio 3D Tempest"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&q=80",
    stock: 12,
    warranty: "1 ano Sony Brasil"
  },
  {
    id: "pc-gamer-infinity",
    name: "PC Gamer TECHNOVA Infinity Core i9 RTX 4080",
    brand: "TECHNOVA",
    model: "Infinity Pro-X",
    description: "Computador topo de linha montado com refrigeração líquida líquida, pronto para os jogos em 4K no ultra e renderizações pesadas de vídeo.",
    price: 14999.00,
    originalPrice: 22499.00,
    category: "computadores",
    specs: ["Processador Intel Core i9-14900K", "Placa de Vídeo RTX 4080 Super 16GB", "Memória RAM: 64GB DDR5 RGB", "Armazenamento: 2TB SSD NVMe Gen4", "Watercooler RGB de 360mm"],
    rating: 5.0,
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80",
    stock: 3,
    warranty: "1 ano de montagem e suporte técnico"
  },
  {
    id: "bike-electric-evolt",
    name: "Bicicleta Elétrica TECHNOVA E-Volt X",
    brand: "TECHNOVA",
    model: "E-Volt X-200",
    description: "Bicicleta elétrica inteligente de última geração com bateria integrada de longa duração, painel digital em LED, freios a disco hidráulicos e autonomia de até 60km por carga assistida.",
    price: 4899.00,
    originalPrice: 6999.00,
    category: "bicicletas",
    specs: ["Motor: 350W Hub Motor traseiro", "Bateria: Lítio-Ion 36V 10.4Ah integrada", "Autonomia: Até 60 km no modo assistido", "Velocidade Máxima: 25 km/h", "Painel LCD multifunções com porta USB", "Quadro em Alumínio de alta resistência"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1571068316341-2501006fa4ee?w=500&q=80",
    stock: 7,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "bike-specialized-mtb",
    name: "Mountain Bike Specialized Rockhopper Elite 29",
    brand: "Specialized",
    model: "Rockhopper Elite",
    description: "Ideal para trilhas técnicas e aventuras fora da estrada. Equipada com suspensão dianteira RockShox, transmissão Shimano Deore de 11 marchas e freios hidráulicos potentes.",
    price: 6200.00,
    originalPrice: 8500.00,
    category: "bicicletas",
    specs: ["Transmissão: Shimano Deore M5100 11v", "Suspensão: RockShox Judy Solo Air (100mm)", "Freios: Disco Hidráulico Shimano MT200", "Aros: Double-wall alloy tubeless-ready", "Quadro: Alumínio Premium A1 butted"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&q=80",
    stock: 5,
    warranty: "Garantia Vitalícia para o quadro"
  },
  {
    id: "bike-cannondale-quick",
    name: "Bicicleta Urbana Cannondale Quick 5",
    brand: "Cannondale",
    model: "Quick 5",
    description: "Uma bicicleta híbrida extremamente ágil, leve e confortável, ideal para exercitar-se, rodar na cidade ou passear no fim de semana.",
    price: 3890.00,
    originalPrice: 4990.00,
    category: "bicicletas",
    specs: ["Transmissão: Shimano Tourney 14 velocidades", "Quadro: SmartForm C3 Alloy com grafismos refletivos", "Freios: Promax mechanical disc", "Pneus: Kenda Khan II 700x35c", "Sensor de roda integrado Cannondale App"],
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&q=80",
    stock: 9,
    warranty: "Garantia de 2 anos"
  },
  {
    id: "xiaomi-scooter-pro",
    name: "Patinete Elétrico Xiaomi Mi Scooter Pro 2",
    brand: "Xiaomi",
    model: "Mi Scooter Pro 2",
    description: "A solução perfeita para micromobilidade urbana rápida. Dobrável em 3 segundos, sistema de freio duplo E-ABS e painel digital de alta resolução completo.",
    price: 3499.00,
    originalPrice: 4799.00,
    category: "bicicletas",
    specs: ["Motor: 300W nominal (600W pico)", "Autonomia: Até 45 km", "Velocidade Máxima: 25 km/h", "Pneus pneumáticos de 8.5 polegadas", "Painel digital de controle integrado"],
    rating: 4.7,
    imageUrl: "https://images.unsplash.com/photo-1558244402-286df5f65379?w=500&q=80",
    stock: 12,
    warranty: "1 ano com assistência nacional"
  },
  {
    id: "projector-samsung-freestyle",
    name: "Projetor Smart Portátil Samsung The Freestyle 2nd Gen",
    brand: "Samsung",
    model: "The Freestyle Gen 2",
    description: "Sua tela gigante em qualquer lugar: imagem de até 100 polegadas, ajuste de foco automático e áudio 360 premium com sistema operacional Tizen.",
    price: 3999.00,
    originalPrice: 5999.00,
    category: "tvs",
    specs: ["Resolução: Full HD nativa com HDR10+", "Tamanho da tela: 30 a 100 polegadas", "Foco e nivelamento automático instantâneo", "Áudio: 5W RMS 360 Graus", "Assistentes de voz Alexa e Bixby integrados"],
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&q=80",
    stock: 8,
    warranty: "1 ano de garantia nacional"
  },
  {
    id: "speaker-jbl-boombox-3",
    name: "Caixa de Som Bluetooth JBL Boombox 3",
    brand: "JBL",
    model: "Boombox 3",
    description: "Som massivo e graves mais profundos com o novo sistema de 3 vias. À prova de poeira e água IP67, bateria gigante para até 24 horas de reprodução.",
    price: 2499.00,
    originalPrice: 3299.00,
    category: "fones",
    specs: ["Potência: 1x 80W RMS subwoofer + 2x 40W midrange + 2x 10W tweeter", "Autonomia de bateria: Até 24 horas", "Classificação IP67 (resistente à água e poeira)", "Tecnologia JBL PartyBoost para pareamento"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80",
    stock: 15,
    warranty: "1 ano com o fabricante"
  },
  {
    id: "keyboard-keychron-q6",
    name: "Teclado Mecânico Premium Keychron Q6 Pro",
    brand: "Keychron",
    model: "Q6 Pro ISO layout",
    description: "Teclado mecânico customizado em alumínio completo CNC, hot-swappable, compatível com QMK/VIA para programação completa de teclas e conexão Bluetooth ou cabo.",
    price: 1899.00,
    originalPrice: 2499.00,
    category: "perifericos",
    specs: ["Layout: Full-size (100% com teclado numérico)", "Conexão: Sem fio Bluetooth 5.1 ou USB-C", "Corpo de Alumínio anodizado usinado em CNC", "Switches: Keychron K Pro Mecânicos Lubrificados", "Iluminação RGB voltada para o sul"],
    rating: 4.9,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80",
    stock: 6,
    warranty: "1 ano com a marca"
  }
];

// Get products from localStorage. Initializes with DEFAULT_PRODUCTS if empty.
export const getLocalProducts = (): Product[] => {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  const stored = localStorage.getItem("technova_products_db");
  if (!stored) {
    localStorage.setItem("technova_products_db", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.setItem("technova_products_db", JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    return parsed;
  } catch (e) {
    console.error("Failed to parse local products, resetting to defaults", e);
    localStorage.setItem("technova_products_db", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
};

// Filter products locally (mimicking backend endpoint filtering)
export const filterLocalProducts = (query: string = "", category: string = "todos"): Product[] => {
  let list = getLocalProducts();
  
  if (category && category !== "inicio" && category !== "todos") {
    if (category === "ofertas") {
      list = list.filter(p => p.originalPrice !== undefined);
    } else if (category === "lancamentos") {
      list = list.filter(p => ["iphone-15-pro-max", "macbook-air-m3", "samsung-galaxy-s24", "smarttv-lg-oled-55"].includes(p.id));
    } else {
      list = list.filter(p => p.category === category);
    }
  }

  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.specs.some(s => s.toLowerCase().includes(q))
    );
  }

  return list;
};

// Save a product to localStorage (Insert or Update)
export const saveLocalProduct = (productData: Omit<Product, "id"> & { id?: string }): Product => {
  const products = getLocalProducts();
  let savedProduct: Product;

  if (productData.id) {
    // Edit existing
    const idx = products.findIndex(p => p.id === productData.id);
    savedProduct = {
      ...productData,
      id: productData.id,
      rating: productData.id ? (products[idx]?.rating || 4.7) : 4.7
    } as Product;
    if (idx !== -1) {
      products[idx] = savedProduct;
    } else {
      products.push(savedProduct);
    }
  } else {
    // Create new
    const newId = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    savedProduct = {
      ...productData,
      id: newId,
      rating: 4.8
    } as Product;
    products.push(savedProduct);
  }

  localStorage.setItem("technova_products_db", JSON.stringify(products));
  return savedProduct;
};

// Delete a product from localStorage
export const deleteLocalProduct = (id: string): boolean => {
  const products = getLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem("technova_products_db", JSON.stringify(filtered));
  return products.length !== filtered.length;
};

// Get orders list from localStorage
export const getLocalOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("technova_orders");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse local orders", e);
    return [];
  }
};

// Save order to localStorage
export const saveLocalOrder = (order: Order): void => {
  const orders = getLocalOrders();
  const existsIdx = orders.findIndex(o => o.orderId === order.orderId);
  if (existsIdx !== -1) {
    orders[existsIdx] = order;
  } else {
    orders.unshift(order);
  }
  localStorage.setItem("technova_orders", JSON.stringify(orders));
};

// Update order status in localStorage
export const updateLocalOrderStatus = (orderId: string, status: Order["status"], trackingCode?: string): Order | null => {
  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    if (trackingCode) {
      orders[idx].trackingCode = trackingCode;
    }
    localStorage.setItem("technova_orders", JSON.stringify(orders));
    return orders[idx];
  }
  return null;
};

// Calculate Local Report metrics
export const getLocalReports = () => {
  const orders = getLocalOrders();
  const products = getLocalProducts();

  // Filter approved/shipped orders for financial metrics
  const validOrders = orders.filter(o => ["Aprovado", "Preparando", "Em Transporte", "Entregue"].includes(o.status));
  
  const totalRevenue = validOrders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingRevenue = orders.filter(o => o.status === "Pendente").reduce((acc, o) => acc + o.totalAmount, 0);

  // Sales by Category
  const categorySales: Record<string, number> = {};
  const productSalesCount: Record<string, { name: string; quantity: number; revenue: number; imageUrl: string }> = {};

  validOrders.forEach(order => {
    order.cart.forEach(item => {
      // Find full product details for category
      const prodDetails = products.find(p => p.id === item.id);
      const cat = prodDetails?.category || "outros";
      
      categorySales[cat] = (categorySales[cat] || 0) + (item.price * item.quantity);

      if (!productSalesCount[item.id]) {
        productSalesCount[item.id] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
          imageUrl: prodDetails?.imageUrl || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7"
        };
      }
      productSalesCount[item.id].quantity += item.quantity;
      productSalesCount[item.id].revenue += (item.price * item.quantity);
    });
  });

  const salesByCategory = Object.entries(categorySales).map(([category, value]) => ({
    category: category.toUpperCase(),
    value
  }));

  // Top Selling Products
  const topProducts = Object.entries(productSalesCount)
    .map(([id, stats]) => ({
      id,
      ...stats
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Daily Sales last 7 days
  const dailySales: { date: string; vendas: number; faturamento: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    
    // Sum for this date
    let count = 0;
    let rev = 0;
    validOrders.forEach(o => {
      // Parse orderDate (assuming format DD/MM/YYYY or similar, check if matches day/month)
      if (o.orderDate.includes(dateStr)) {
        count++;
        rev += o.totalAmount;
      }
    });

    dailySales.push({
      date: dateStr,
      vendas: count,
      faturamento: rev
    });
  }

  // Low stock warning list
  const lowStockProducts = products
    .filter(p => p.stock <= 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      price: p.price
    }));

  const productsByCategory: Record<string, number> = {};
  products.forEach(p => {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
  });

  const pendingCount = orders.filter(o => o.status === "Pendente").length;
  const averageTicket = orders.length > 0 ? (totalRevenue / (orders.length - pendingCount || 1)) : 0;

  const monthlyComparisonData = [
    { month: "Jan", vendas: totalRevenue * 0.4 },
    { month: "Fev", vendas: totalRevenue * 0.5 },
    { month: "Mar", vendas: totalRevenue * 0.65 },
    { month: "Abr", vendas: totalRevenue * 0.75 },
    { month: "Mai", vendas: totalRevenue * 0.9 },
    { month: "Jun", vendas: totalRevenue }
  ];

  return {
    totalSales: totalRevenue,
    ordersCount: orders.length,
    pendingCount,
    averageTicket,
    lowStockProducts,
    productsByCategory,
    monthlyComparisonData,
    metrics: {
      totalRevenue,
      pendingRevenue,
      orderCount: orders.length,
      productsCount: products.length,
      customersCount: new Set(orders.map(o => o.customer.email)).size,
    },
    salesByCategory,
    dailySales,
    topProducts,
    recentOrders: orders.slice(0, 5)
  };
};

// Simple User Account Database Storage
const DEFAULT_USERS: UserAccount[] = [
  {
    id: "user-admin",
    name: "Gabriel Santos (Admin)",
    email: "byelsaints17@gmail.com",
    password: "Pg87456123!",
    role: "admin",
    createdAt: "17/07/2026 10:00:00"
  },
  {
    id: "user-democliente",
    name: "Marcos Silva (Admin)",
    email: "marcynhosilva25@gmail.com",
    password: "admin",
    role: "admin",
    createdAt: "17/07/2026 12:30:00"
  }
];

export const getLocalUsers = (): UserAccount[] => {
  if (typeof window === "undefined") return DEFAULT_USERS;
  const stored = localStorage.getItem("technova_users_db");
  if (!stored) {
    localStorage.setItem("technova_users_db", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed: UserAccount[] = JSON.parse(stored);
    let modified = false;
    
    // Automatically configure Marcos's account as admin
    const marcos = parsed.find(u => u.email.toLowerCase() === "marcynhosilva25@gmail.com");
    if (marcos && (marcos.role !== "admin" || marcos.password !== "admin")) {
      marcos.role = "admin";
      marcos.password = "admin";
      marcos.name = "Marcos Silva (Admin)";
      modified = true;
    }
    
    // Automatically configure Gabriel's account as Admin with password Pg87456123!
    const gabriel = parsed.find(u => u.email.toLowerCase() === "byelsaints17@gmail.com");
    if (gabriel && (gabriel.role !== "admin" || gabriel.password !== "Pg87456123!")) {
      gabriel.role = "admin";
      gabriel.password = "Pg87456123!";
      gabriel.name = "Gabriel Santos (Admin)";
      modified = true;
    }

    if (modified) {
      localStorage.setItem("technova_users_db", JSON.stringify(parsed));
    }
    
    return parsed;
  } catch (e) {
    console.error("Failed to parse local users, resetting to default", e);
    localStorage.setItem("technova_users_db", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
};

export const saveLocalUser = (userData: Omit<UserAccount, "id" | "createdAt"> & { id?: string; createdAt?: string }): UserAccount => {
  const users = getLocalUsers();
  let savedUser: UserAccount;

  if (userData.id) {
    const idx = users.findIndex(u => u.id === userData.id);
    savedUser = {
      ...users[idx],
      ...userData,
      id: userData.id,
      createdAt: userData.createdAt || (users[idx]?.createdAt || new Date().toLocaleString("pt-BR"))
    } as UserAccount;
    if (idx !== -1) {
      users[idx] = savedUser;
    } else {
      users.push(savedUser);
    }
  } else {
    const newId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    savedUser = {
      ...userData,
      id: newId,
      createdAt: new Date().toLocaleString("pt-BR")
    } as UserAccount;
    users.push(savedUser);
  }

  localStorage.setItem("technova_users_db", JSON.stringify(users));
  return savedUser;
};

export const deleteLocalUser = (id: string): boolean => {
  const users = getLocalUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem("technova_users_db", JSON.stringify(filtered));
  return users.length !== filtered.length;
};

export const getLocalCurrentUser = (): UserAccount | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("technova_current_user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

export const setLocalCurrentUser = (user: UserAccount | null): void => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("technova_current_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("technova_current_user");
  }
};

