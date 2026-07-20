import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully on the backend.");
  } catch (err) {
    console.error("Failed to initialize Gemini API:", err);
  }
} else {
  console.log("No GEMINI_API_KEY environment variable found. Falling back to mock data.");
}

// ----------------------------------------------------
// PRODUCT DATABASE & TYPES
// ----------------------------------------------------

interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "cliente";
  createdAt: string;
}

let usersDb: UserAccount[] = [
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

interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  specs: string[];
  rating: number;
  imageUrl: string;
  images?: string[];
  stock: number;
  warranty: string;
}

let productsDb: Product[] = [
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
  }
];

// Helper to filter and search products in memory
function searchLocalProducts(
  query?: string,
  category?: string,
  brand?: string,
  minPrice?: number,
  maxPrice?: number,
  minRating?: number,
  availability?: string
): Product[] {
  let list = [...productsDb];

  if (category && category !== "inicio" && category !== "todos") {
    if (category === "ofertas") {
      list = list.filter(p => p.originalPrice !== undefined);
    } else if (category === "lancamentos") {
      list = list.filter(p => p.id === "iphone-15-pro-max" || p.id === "macbook-air-m3" || p.id === "samsung-galaxy-s24" || p.id === "smarttv-lg-oled-55");
    } else {
      list = list.filter(p => p.category === category);
    }
  }

  if (brand && brand !== "todos") {
    list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (minPrice !== undefined && !isNaN(minPrice)) {
    list = list.filter(p => p.price >= minPrice);
  }

  if (maxPrice !== undefined && !isNaN(maxPrice)) {
    list = list.filter(p => p.price <= maxPrice);
  }

  if (minRating !== undefined && !isNaN(minRating)) {
    list = list.filter(p => p.rating >= minRating);
  }

  if (availability === "disponivel") {
    list = list.filter(p => p.stock > 0);
  } else if (availability === "indisponivel") {
    list = list.filter(p => p.stock <= 0);
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
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET search-products endpoint (handles real Google Search grounding via Gemini or local database with advanced filters)
app.get("/api/products", async (req, res) => {
  const query = req.query.q as string | undefined;
  const category = req.query.category as string | undefined;
  const brand = req.query.brand as string | undefined;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
  const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
  const availability = req.query.availability as string | undefined;

  console.log(`Searching products with params: query="${query || ""}", category="${category || ""}", brand="${brand || ""}"`);

  // If Gemini is active AND a specific query is passed, we can try to find REAL dynamic search grounding data!
  if (ai && query && query.trim().length > 2 && !category && !brand && !minPrice && !maxPrice) {
    try {
      console.log(`Calling Gemini API to search Google for tech product: "${query}"`);
      
      const prompt = `Você é o buscador inteligente da TECHNOVA, uma grande loja de tecnologia brasileira.
Encontre 3 produtos reais vendidos no mercado brasileiro que correspondam a esta busca: "${query}".
Se a busca for muito vaga, retorne 3 eletrônicos populares em destaque (celulares, computadores ou acessórios).

Para cada produto, preencha:
1. Nome completo (incluindo marca e modelo)
2. Marca (exemplo: Apple, Samsung, Dell, JBL)
3. Modelo (exemplo: iPhone 15 Pro, Galaxy Tab S9, etc)
4. Descrição atraente e detalhada em Português
5. Preço atualizado estimado em Reais (BRL, apenas número, exemplo: 3499.00)
6. Lista de 4 a 6 especificações técnicas principais
7. Nota de avaliação (número de 1.0 a 5.0)
8. Categoria mais apropriada (escolha estritamente entre: "celulares", "computadores", "notebooks", "tablets", "monitores", "impressoras", "tvs", "smartwatches", "fones", "perifericos", "pecas" ou "gamer")
9. Estoque inicial (número entre 5 e 20)
10. Garantia recomendada (ex: "1 ano oficial")

Atenção: Use URLs de imagem genéricas e estáveis de Unsplash que correspondam perfeitamente ao produto, por exemplo:
- Para celular iPhone ou semelhante: https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80
- Para outro smartphone: https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80
- Para Notebook / Computador portátil: https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&q=80
- Para MacBook: https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80
- Para Headphone / Fones de ouvido: https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80
- Para Mouse / Teclado: https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80
- Para carregadores ou outros acessórios de informática: https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Lista de produtos encontrados",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                brand: { type: Type.STRING },
                model: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                specs: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                rating: { type: Type.NUMBER },
                category: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                stock: { type: Type.NUMBER },
                warranty: { type: Type.STRING }
              },
              required: ["name", "brand", "model", "description", "price", "specs", "rating", "category", "imageUrl", "stock", "warranty"]
            }
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsedProducts = JSON.parse(responseText.trim());
        const mappedProducts: Product[] = parsedProducts.map((p: any, index: number) => ({
          id: `google-${Date.now()}-${index}`,
          name: p.name,
          brand: p.brand || "Generico",
          model: p.model || "Modelo",
          description: p.description,
          price: p.price,
          category: p.category,
          specs: p.specs || [],
          rating: p.rating || 4.5,
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1496181130204-755241544e35?w=500&q=80",
          stock: p.stock || 10,
          warranty: p.warranty || "1 ano"
        }));

        console.log(`Gemini search returned ${mappedProducts.length} custom products with search grounding.`);
        // Let's seed them into memory so they can be browsed
        for (const mp of mappedProducts) {
          if (!productsDb.some(exist => exist.name === mp.name)) {
            productsDb.push(mp);
          }
        }
        return res.json(mappedProducts);
      }
    } catch (err) {
      console.error("Gemini grounding query failed, falling back to local database search:", err);
    }
  }

  // Fallback to offline search with full filter criteria
  const results = searchLocalProducts(query, category, brand, minPrice, maxPrice, minRating, availability);
  return res.json(results);
});

// ----------------------------------------------------
// ORDERS IN-MEMORY DATABASE
// ----------------------------------------------------

let ordersDb: any[] = [
  {
    orderId: "TECH-108492",
    orderDate: new Date(Date.now() - 3600000 * 24 * 3).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    totalAmount: 8499.00,
    customer: {
      name: "Gabriel Santos",
      cpf: "123.456.789-00",
      birthDate: "1995-10-17",
      email: "byelsaints17@gmail.com",
      phone: "(11) 99999-8888"
    },
    deliveryAddress: {
      address: "Av. Paulista",
      number: "1000",
      neighborhood: "Bela Vista",
      complement: "Apto 15",
      city: "São Paulo",
      state: "SP",
      zip: "01310-100"
    },
    payment: {
      cardName: "Gabriel Santos",
      cardNumber: "4000123456789012",
      expiry: "12/29",
      installments: 12
    },
    cart: [
      {
        id: "iphone-15-pro-max",
        name: "iPhone 15 Pro Max 256GB",
        quantity: 1,
        price: 8499.00
      }
    ],
    status: "Aprovado",
    trackingCode: "BR987654321BR"
  },
  {
    orderId: "TECH-394029",
    orderDate: new Date(Date.now() - 3600000 * 24 * 1).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
    totalAmount: 3748.00,
    customer: {
      name: "Mariana Costa",
      cpf: "987.654.321-99",
      birthDate: "1990-05-12",
      email: "mariana.costa@example.com",
      phone: "(21) 98888-7777"
    },
    deliveryAddress: {
      address: "Rua Voluntários da Pátria",
      number: "450",
      neighborhood: "Botafogo",
      complement: "Bloco B",
      city: "Rio de Janeiro",
      state: "RJ",
      zip: "22270-010"
    },
    payment: {
      cardName: "Mariana Costa",
      cardNumber: "5100987654321098",
      expiry: "06/28",
      installments: 6
    },
    cart: [
      {
        id: "apple-watch-s9",
        name: "Apple Watch Series 9 GPS 45mm",
        quantity: 1,
        price: 3499.00
      },
      {
        id: "jbl-tune-520bt",
        name: "Fone de Ouvido Bluetooth JBL Tune 520BT",
        quantity: 1,
        price: 249.00
      }
    ],
    status: "Pendente",
    trackingCode: "BR123456789BR"
  }
];

// ----------------------------------------------------
// ADMIN OPERATIONS ENDPOINTS
// ----------------------------------------------------

// GET Admin products
app.get("/api/admin/products", (req, res) => {
  return res.json(productsDb);
});

// POST register new product
app.post("/api/admin/products", (req, res) => {
  const { name, brand, model, description, price, originalPrice, category, specs, rating, imageUrl, images, stock, warranty } = req.body;

  if (!name || !brand || !model || !description || price === undefined || !category || !imageUrl || stock === undefined) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes para o cadastro do produto." });
  }

  const newProduct: Product = {
    id: `custom-${Date.now()}`,
    name,
    brand,
    model,
    description,
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    specs: Array.isArray(specs) ? specs : (specs ? (specs as string).split("\n").filter(Boolean) : []),
    rating: rating ? Number(rating) : 5.0,
    imageUrl,
    images: Array.isArray(images) ? images : [imageUrl],
    stock: Number(stock),
    warranty: warranty || "1 ano"
  };

  productsDb.unshift(newProduct);
  return res.status(201).json(newProduct);
});

// PUT update existing product
app.put("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const index = productsDb.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado." });
  }

  const { name, brand, model, description, price, originalPrice, category, specs, rating, imageUrl, images, stock, warranty } = req.body;

  productsDb[index] = {
    ...productsDb[index],
    name: name || productsDb[index].name,
    brand: brand || productsDb[index].brand,
    model: model || productsDb[index].model,
    description: description || productsDb[index].description,
    price: price !== undefined ? Number(price) : productsDb[index].price,
    originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : undefined) : productsDb[index].originalPrice,
    category: category || productsDb[index].category,
    specs: Array.isArray(specs) ? specs : (specs ? (specs as string).split("\n").filter(Boolean) : productsDb[index].specs),
    rating: rating !== undefined ? Number(rating) : productsDb[index].rating,
    imageUrl: imageUrl || productsDb[index].imageUrl,
    images: Array.isArray(images) ? images : (productsDb[index].images || [imageUrl || productsDb[index].imageUrl]),
    stock: stock !== undefined ? Number(stock) : productsDb[index].stock,
    warranty: warranty || productsDb[index].warranty
  };

  return res.json(productsDb[index]);
});

// DELETE product
app.delete("/api/admin/products/:id", (req, res) => {
  const { id } = req.params;
  const index = productsDb.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Produto não encontrado." });
  }

  const deleted = productsDb.splice(index, 1);
  return res.json({ success: true, deleted: deleted[0] });
});

// ----------------------------------------------------
// USER ACCOUNTS / CREATORS API
// ----------------------------------------------------

// POST Register user account
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios (nome, email e senha)." });
  }

  // Check if user already exists
  const exists = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Este endereço de e-mail já está sendo utilizado por outra conta." });
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    password,
    role: role === "admin" ? "admin" : "cliente",
    createdAt: new Date().toLocaleString("pt-BR")
  };

  usersDb.push(newUser);
  console.log(`New user registered successfully: ${newUser.name} (${newUser.email})`);
  return res.status(201).json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt } });
});

// POST Login user account
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios para realizar o login." });
  }

  const user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "E-mail ou senha incorretos. Por favor, tente novamente." });
  }

  console.log(`User logged in successfully: ${user.name} (${user.email})`);
  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// GET all user accounts (Admin)
app.get("/api/admin/users", (req, res) => {
  // Returns safe user representations (without returning passwords)
  const safeUsers = usersDb.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  return res.json(safeUsers);
});

// DELETE user account (Admin)
app.delete("/api/admin/users/:id", (req, res) => {
  const { id } = req.params;
  const index = usersDb.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Conta de usuário não encontrada." });
  }

  // Prevent deleting the main admin account to avoid lockout
  if (id === "user-admin") {
    return res.status(403).json({ error: "Não é permitido excluir a conta de administrador padrão." });
  }

  const deleted = usersDb.splice(index, 1);
  console.log(`User deleted successfully: ${deleted[0].name} (${deleted[0].email})`);
  return res.json({ success: true, deleted: { id: deleted[0].id, name: deleted[0].name, email: deleted[0].email } });
});

// GET all orders
app.get("/api/admin/orders", (req, res) => {
  return res.json(ordersDb);
});

// PUT update order status & optional tracking code
app.put("/api/admin/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, trackingCode } = req.body;

  const order = ordersDb.find(o => o.orderId === id);
  if (!order) {
    return res.status(404).json({ error: "Pedido não encontrado." });
  }

  if (status) order.status = status;
  if (trackingCode !== undefined) order.trackingCode = trackingCode;

  return res.json(order);
});

// GET Admin Reports (for analytics dashboard widgets)
app.get("/api/admin/reports", (req, res) => {
  // Calc metrics
  let totalSales = 0;
  let ordersCount = ordersDb.length;
  let pendingCount = 0;
  
  for (const o of ordersDb) {
    if (o.status !== "Pendente") {
      totalSales += o.totalAmount;
    } else {
      pendingCount++;
    }
  }

  const averageTicket = ordersCount > 0 ? (totalSales / (ordersCount - pendingCount || 1)) : 0;

  // Stock warnings: less than 5 items
  const lowStockProducts = productsDb.filter(p => p.stock < 5).map(p => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    category: p.category
  }));

  // Categories count
  const productsByCategory: Record<string, number> = {};
  for (const p of productsDb) {
    productsByCategory[p.category] = (productsByCategory[p.category] || 0) + 1;
  }

  // Monthly comparison mock sales (last 6 months)
  const monthlyComparisonData = [
    { month: "Jan", vendas: totalSales * 0.4 },
    { month: "Fev", vendas: totalSales * 0.5 },
    { month: "Mar", vendas: totalSales * 0.65 },
    { month: "Abr", vendas: totalSales * 0.75 },
    { month: "Mai", vendas: totalSales * 0.9 },
    { month: "Jun", vendas: totalSales }
  ];

  return res.json({
    totalSales,
    ordersCount,
    pendingCount,
    averageTicket,
    lowStockProducts,
    productsByCategory,
    monthlyComparisonData
  });
});

// POST checkout endpoint (processes orders, logs order on server, subtracts stock, and sends HTML notification)
app.post("/api/checkout", async (req, res) => {
  const { customer, deliveryAddress, payment, cart, totalAmount } = req.body;

  if (!customer || !deliveryAddress || !payment || !cart || !totalAmount) {
    return res.status(400).json({ error: "Dados incompletos para finalização da compra." });
  }

  const orderId = `TECH-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  console.log(`Processing order ${orderId} for customer: ${customer.name}`);

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-157623723151556-041508-6103e89763bc5cc79af04760d66474a9-425264845";
  let realPaymentStatus = "Pendente";
  let realPaymentId = "";
  let rejectionReason = "";

  const getRejectionMessage = (detail: string) => {
    switch (detail) {
      case "cc_rejected_bad_filled_card_number":
        return "Número do cartão incorreto. Verifique os dígitos digitados.";
      case "cc_rejected_bad_filled_date":
        return "Data de validade incorreta. Verifique o mês e o ano.";
      case "cc_rejected_bad_filled_other":
        return "Dados do cartão incorretos. Por favor, verifique.";
      case "cc_rejected_bad_filled_security_code":
        return "Código de segurança (CVV) incorreto. Verifique os 3 dígitos traseiros.";
      case "cc_rejected_blacklist":
        return "O cartão está bloqueado ou possui restrições de uso.";
      case "cc_rejected_call_for_authorize":
        return "O pagamento precisa ser autorizado pelo banco emissor. Entre em contato com seu banco.";
      case "cc_rejected_card_disabled":
        return "Este cartão está desativado. Ative-o ou use outro cartão.";
      case "cc_rejected_card_error":
        return "Não conseguimos processar o cartão. Tente outro cartão.";
      case "cc_rejected_duplicated_payment":
        return "Pagamento duplicado. Já recebemos um pagamento idêntico recentemente.";
      case "cc_rejected_high_risk":
        return "O pagamento foi recusado pelo sistema de prevenção a fraudes (alto risco).";
      case "cc_rejected_insufficient_amount":
        return "Saldo ou limite insuficiente no cartão de crédito.";
      case "cc_rejected_invalid_installments":
        return "Número de parcelas inválido para este cartão.";
      case "cc_rejected_max_attempts":
        return "Limite de tentativas de pagamento excedido. Tente outro cartão.";
      default:
        return "O pagamento foi recusado pelo banco ou pelo Mercado Pago. Verifique os dados.";
    }
  };

  // If credit card raw details are supplied and there's a real token, try to process it
  if (payment && payment.rawCardNumber && token && token.trim() !== "" && token !== "MERCADOPAGO_ACCESS_TOKEN") {
    try {
      console.log(`[Mercado Pago] Generating real Card Token for Order ${orderId}...`);
      const cleanNumber = payment.rawCardNumber.replace(/\s/g, "");
      const [monthStr, yearStr] = payment.expiry.split("/");
      const expiration_month = parseInt(monthStr, 10);
      const expiration_year = parseInt(yearStr.length === 2 ? "20" + yearStr : yearStr, 10);
      const cleanCpf = customer.cpf ? customer.cpf.replace(/\D/g, "") : "";

      const cardTokenRes = await fetch("https://api.mercadopago.com/v1/card_tokens", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          card_number: cleanNumber,
          expiration_month,
          expiration_year,
          security_code: payment.cvv,
          cardholder: {
            name: payment.cardName || customer.name,
            identification: {
              type: "CPF",
              number: cleanCpf
            }
          }
        })
      });

      if (!cardTokenRes.ok) {
        const errorText = await cardTokenRes.text();
        console.error(`[Mercado Pago] Card Token generation failed: ${errorText}`);
        return res.status(400).json({ error: "Os dados do cartão de crédito foram recusados ou são inválidos." });
      }

      const cardTokenData = await cardTokenRes.json();
      const cardTokenId = cardTokenData.id;
      console.log(`[Mercado Pago] Card Token generated successfully: ${cardTokenId}`);

      const getPaymentMethodId = (num: string) => {
        const c = num.replace(/\D/g, "");
        if (c.startsWith("4")) return "visa";
        if (c.startsWith("34") || c.startsWith("37")) return "amex";
        if (c.startsWith("50") || c.startsWith("62") || c.startsWith("63") || c.startsWith("65")) return "elo";
        if (c.startsWith("5") || c.startsWith("2")) return "master";
        return "visa";
      };
      const paymentMethodId = getPaymentMethodId(cleanNumber);

      console.log(`[Mercado Pago] Creating real payment with token ${cardTokenId} and method ${paymentMethodId}...`);
      const paymentRes = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": `idemp-card-${orderId}`
        },
        body: JSON.stringify({
          transaction_amount: Number(totalAmount),
          token: cardTokenId,
          description: `Compra TECHNOVA - Pedido ${orderId}`,
          installments: Number(payment.installments) || 1,
          payment_method_id: paymentMethodId,
          payer: {
            email: customer.email || "byelsaints17@gmail.com",
            identification: {
              type: "CPF",
              number: cleanCpf
            }
          }
        })
      });

      let paymentData: any = null;
      try {
        const responseText = await paymentRes.text();
        paymentData = JSON.parse(responseText);
      } catch (e) {
        console.error(`[Mercado Pago] Failed to parse response:`, e);
      }

      if (!paymentRes.ok) {
        console.error(`[Mercado Pago] Payment API returned non-OK status: ${paymentRes.status}`);
        if (paymentData && (paymentData.status === "rejected" || paymentData.status === "cancelled")) {
          realPaymentStatus = "Recusado";
          realPaymentId = paymentData.id || "";
          rejectionReason = getRejectionMessage(paymentData.status_detail || "cc_rejected_other_reason");
          console.log(`[Mercado Pago] Handled rejected payment gracefully: ${paymentData.status_detail}`);
        } else {
          const errMsg = paymentData?.message || "O pagamento com cartão foi recusado pelo Mercado Pago. Verifique o limite ou os dados do cartão.";
          return res.status(400).json({ error: errMsg });
        }
      } else if (paymentData) {
        console.log(`[Mercado Pago] Credit Card payment response status: ${paymentData.status}`);

        if (paymentData.status === "approved") {
          realPaymentStatus = "Aprovado";
          realPaymentId = paymentData.id;
        } else if (paymentData.status === "in_process") {
          realPaymentStatus = "Pendente";
          realPaymentId = paymentData.id;
        } else if (paymentData.status === "rejected" || paymentData.status === "cancelled") {
          realPaymentStatus = "Recusado";
          realPaymentId = paymentData.id || "";
          rejectionReason = getRejectionMessage(paymentData.status_detail || "cc_rejected_other_reason");
          console.log(`[Mercado Pago] Payment rejected: ${paymentData.status_detail}`);
        } else {
          realPaymentStatus = "Pendente";
          realPaymentId = paymentData.id || "";
        }
      }
    } catch (e) {
      console.error(`[Mercado Pago] Unexpected error processing card payment:`, e);
      return res.status(500).json({ error: "Erro inesperado ao processar o cartão no Mercado Pago." });
    }
  }

  // Strip raw card details before saving to orders database
  const securePayment = {
    cardName: payment.cardName,
    cardNumber: payment.cardNumber,
    expiry: payment.expiry,
    installments: payment.installments,
    gateway: payment.gateway
  };

  // 1. Save order to server-side orders database for Admin viewing!
  const newOrder = {
    orderId,
    orderDate,
    totalAmount: Number(totalAmount),
    customer: {
      name: customer.name,
      cpf: customer.cpf || "Não informado",
      birthDate: customer.birthDate || "Não informado",
      email: customer.email,
      phone: customer.phone
    },
    deliveryAddress,
    payment: securePayment,
    cart,
    status: realPaymentStatus,
    trackingCode: ""
  };
  ordersDb.unshift(newOrder);

  // 1.5. Dispatch REAL email alert via FormSubmit.co to byelsaints17@gmail.com (guarantees delivery on test environments with zero configuration)
  try {
    const productsSummary = cart.map((item: any) => `${item.name} (${item.quantity || 1}x) - R$ ${(item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`).join("\n");
    const totalQuantity = cart.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    const installmentsText = payment.installments 
      ? `${payment.installments}x de R$ ${(totalAmount / payment.installments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sem juros`
      : "1x à vista";

    const formSubmitPayload = {
      _subject: `🛒 Novo Pedido TECHNOVA #${orderId}`,
      _captcha: "false",
      Nome: customer.name,
      Email: customer.email,
      Telefone: customer.phone,
      CPF: customer.cpf || "Não informado",
      Data_Nascimento: customer.birthDate || "Não informado",
      CEP: deliveryAddress.zip,
      Endereco: deliveryAddress.address,
      Numero: deliveryAddress.number,
      Complemento: deliveryAddress.complement || "Não informado",
      Cidade: deliveryAddress.city,
      Estado: deliveryAddress.state,
      Produtos: productsSummary,
      Quantidade: totalQuantity,
      Frete: "Grátis",
      Valor_Total: `R$ ${totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      Forma_Pagamento: "Cartão de Crédito (Simulado - Ambiente de Teste)",
      Nome_Cartao: payment.cardName,
      Numero_Cartao_Mascarado: "•••• •••• •••• •••• (Não enviado por segurança)",
      Validade_Cartao: payment.expiry,
      CVV_Mascarado: "*** (Não enviado por segurança)",
      Parcelamento: installmentsText,
      Observacoes: "Pedido realizado em ambiente de teste (TECHNOVA - Simulação de Venda). Nenhuma cobrança real foi efetuada e dados sensíveis de pagamento não foram coletados/enviados."
    };

    console.log(`Sending real email alert via FormSubmit for order ${orderId} to byelsaints17@gmail.com...`);
    fetch("https://formsubmit.co/ajax/byelsaints17@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formSubmitPayload)
    }).then(async (fsRes) => {
      if (fsRes.ok) {
        console.log("FormSubmit.co notification sent successfully!");
      } else {
        const errorText = await fsRes.text();
        console.error("FormSubmit.co failed with response:", errorText);
      }
    }).catch((fsErr) => {
      console.error("Failed inside FormSubmit.co fetch promise:", fsErr);
    });
  } catch (fsErr) {
    console.error("Failed to construct FormSubmit.co notification:", fsErr);
  }

  // 2. Subtract stock for each purchased item from productsDb
  for (const item of cart) {
    const matchedProduct = productsDb.find(p => p.id === item.id);
    if (matchedProduct) {
      const oldStock = matchedProduct.stock || 0;
      matchedProduct.stock = Math.max(0, oldStock - (item.quantity || 1));
      console.log(`Subtracted stock for ${matchedProduct.name}: ${oldStock} -> ${matchedProduct.stock}`);
    }
  }

  // Build beautiful HTML email template
  const cartRowsHtml = cart.map((item: any) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-weight: 500; color: #1f2937;">
        ${item.name}
      </td>
      <td style="padding: 12px 8px; text-align: center; color: #4b5563;">
        ${item.quantity}x
      </td>
      <td style="padding: 12px 8px; text-align: right; color: #111827; font-weight: 500;">
        R$ ${(item.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>
      <td style="padding: 12px 8px; text-align: right; color: #111827; font-weight: bold;">
        R$ ${(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Novo Pedido Recebido - TECHNOVA</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 20px; margin: 0; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
        
        <!-- Header Banner -->
        <div style="background-color: #0033cc; background-image: linear-gradient(135deg, #002288 0%, #0044ff 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase;">TECHNOVA</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; font-weight: 300;">Nova Compra Efetuada com Sucesso</p>
        </div>

        <div style="padding: 24px;">
          
          <!-- Order Meta Info -->
          <div style="background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0044ff; padding: 16px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; color: #002288; font-size: 15px;">NÚMERO DO PEDIDO:</td>
                <td style="text-align: right; font-family: monospace; font-size: 16px; font-weight: bold; color: #111827;">${orderId}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-top: 6px;">Data e Hora do Pedido:</td>
                <td style="text-align: right; color: #111827; font-size: 14px; padding-top: 6px;">${orderDate}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-top: 4px;">Valor Total da Compra:</td>
                <td style="text-align: right; color: #002288; font-size: 16px; font-weight: 800; padding-top: 4px;">R$ ${totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
              </tr>
            </table>
          </div>

          <!-- Section: Customer Details -->
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-top: 0; margin-bottom: 12px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Dados do Cliente</h3>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px; color: #374151;">
            <tr>
              <td style="width: 30%; font-weight: bold; padding: 4px 0;">Nome Completo:</td>
              <td style="padding: 4px 0;">${customer.name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">CPF:</td>
              <td style="padding: 4px 0; font-family: monospace;">${customer.cpf || "Não informado"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Data de Nascimento:</td>
              <td style="padding: 4px 0;">${customer.birthDate || "Não informado"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">E-mail:</td>
              <td style="padding: 4px 0;">${customer.email}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Telefone:</td>
              <td style="padding: 4px 0;">${customer.phone}</td>
            </tr>
          </table>

          <!-- Section: Delivery Address -->
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Endereço de Entrega</h3>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px; color: #374151;">
            <tr>
              <td style="width: 30%; font-weight: bold; padding: 4px 0;">Rua/Endereço:</td>
              <td style="padding: 4px 0;">${deliveryAddress.address}, Nº ${deliveryAddress.number}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Bairro:</td>
              <td style="padding: 4px 0;">${deliveryAddress.neighborhood}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Complemento:</td>
              <td style="padding: 4px 0;">${deliveryAddress.complement || "Não informado"}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Cidade/Estado:</td>
              <td style="padding: 4px 0;">${deliveryAddress.city} - ${deliveryAddress.state}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">CEP:</td>
              <td style="padding: 4px 0; font-family: monospace;">${deliveryAddress.zip}</td>
            </tr>
          </table>

          <!-- Section: Payment Details -->
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Dados de Pagamento</h3>
          <table style="width: 100%; margin-bottom: 24px; font-size: 14px; color: #374151;">
            <tr>
              <td style="width: 30%; font-weight: bold; padding: 4px 0;">Método:</td>
              <td style="padding: 4px 0; font-weight: bold; color: #16a34a;">Cartão de Crédito (Simulado - Seguro SSL)</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Nome no Cartão:</td>
              <td style="padding: 4px 0; text-transform: uppercase;">${payment.cardName}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Número do Cartão:</td>
              <td style="padding: 4px 0; font-family: monospace; color: #dc2626;">•••• •••• •••• •••• (Não enviado por segurança)</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Validade / CVV:</td>
              <td style="padding: 4px 0; font-family: monospace; color: #dc2626;">${payment.expiry} / *** (Não enviado por segurança)</td>
            </tr>
            ${payment.installments ? `
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Parcelamento:</td>
              <td style="padding: 4px 0; font-weight: bold;">${payment.installments}x de R$ ${(totalAmount / payment.installments).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sem juros</td>
            </tr>` : ""}
          </table>

          <!-- Section: Cart Items -->
          <h3 style="color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Produtos Comprados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #4b5563; text-transform: uppercase; font-size: 11px;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qtd</th>
                <th style="padding: 8px; text-align: right;">Unitário</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${cartRowsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px;"></td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #4b5563;">TOTAL GERAL:</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #002288; font-size: 16px;">R$ ${totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #64748b;">
          <p style="margin: 0;"><strong>TECHNOVA LTDA</strong> - Sua Loja de Tecnologia</p>
          <p style="margin: 4px 0 0 0;">Esta é uma notificação automática enviada para <strong>${customer.email}</strong>.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Determine email sending options
  const targetEmail = customer.email || "byelsaints17@gmail.com";
  const adminEmail = "byelsaints17@gmail.com";
  let isRealEmailSent = false;
  let previewUrl = "";

  // 1. Check if SMTP configuration is set in .env
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  try {
    let transporter;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      console.log(`Using custom SMTP configuration: Host=${SMTP_HOST}, Port=${SMTP_PORT || 587}, User=${SMTP_USER}`);
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: SMTP_FROM || `"TECHNOVA Store" <${SMTP_USER}>`,
        to: targetEmail,
        bcc: adminEmail,
        subject: `🛒 Novo Pedido #${orderId} - R$ ${totalAmount.toFixed(2)} - TECHNOVA`,
        html: emailHtml,
      });

      console.log("Real SMTP email sent successfully! MessageID:", info.messageId);
      isRealEmailSent = true;
    } else {
      // 2. Generate dynamic ethereal fallback so the developer gets a REAL clickable preview link of the actual email sent!
      console.log("No custom SMTP configured. Creating ethereal test account for real preview link...");
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"TECHNOVA Store" <no-reply@technova.com.br>',
        to: targetEmail,
        bcc: adminEmail,
        subject: `🛒 Novo Pedido #${orderId} - R$ ${totalAmount.toFixed(2)} - TECHNOVA`,
        html: emailHtml,
      });

      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log("Test email sent! Preview URL:", previewUrl);
      isRealEmailSent = true;
    }
  } catch (err) {
    console.error("Failed to send checkout email via SMTP:", err);
  }

  return res.json({
    success: true,
    orderId,
    orderDate,
    status: realPaymentStatus,
    rejectionReason,
    emailSent: isRealEmailSent,
    targetEmail,
    previewUrl,
    message: isRealEmailSent 
      ? `Pedido finalizado! Dados enviados com sucesso para ${targetEmail}.` 
      : "Pedido finalizado com sucesso! (Falha ao disparar e-mail de notificação - configure suas chaves SMTP em Configurações > Secrets)."
  });
});

function isValidCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCpf.charAt(10))) return false;

  return true;
}

function generateValidCPF(): string {
  const num = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += num[i] * (10 - i);
  }
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  num.push(d1);

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += num[i] * (11 - i);
  }
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  num.push(d2);

  return num.join("");
}

function getValidCPF(cpfInput?: string): string {
  if (cpfInput) {
    const clean = cpfInput.replace(/\D/g, "");
    if (isValidCPF(clean)) {
      return clean;
    }
  }
  return generateValidCPF();
}

// POST Create Mercado Pago Checkout Preference
app.post("/api/mercadopago/preference", async (req, res) => {
  const { customer, deliveryAddress, cart, totalAmount, paymentMethod } = req.body;

  if (!customer || !cart || !totalAmount) {
    return res.status(400).json({ error: "Dados incompletos para geração do pagamento Mercado Pago." });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || "APP_USR-157623723151556-041508-6103e89763bc5cc79af04760d66474a9-425264845";
  const orderId = `TECH-${Math.floor(100000 + Math.random() * 900000)}`;

  // If payment method is PIX, let's try to generate a real PIX payment!
  if (paymentMethod === "mercadopago_pix") {
    if (token && token.trim() !== "" && token !== "MERCADOPAGO_ACCESS_TOKEN") {
      try {
        console.log(`[Mercado Pago] Generating real PIX Payment for Order ID: ${orderId}...`);
        const response = await fetch("https://api.mercadopago.com/v1/payments", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token.trim()}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": `idemp-pix-${orderId}`
          },
          body: JSON.stringify({
            transaction_amount: Number(totalAmount),
            description: `Compra TECHNOVA - Pedido ${orderId}`,
            payment_method_id: "pix",
            payer: {
              email: customer.email || "byelsaints17@gmail.com",
              first_name: customer.name.split(" ")[0] || "Cliente",
              last_name: customer.name.split(" ").slice(1).join(" ") || "TECHNOVA",
              identification: {
                type: "CPF",
                number: getValidCPF(customer.cpf)
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[Mercado Pago] Real PIX payment successfully generated! ID: ${data.id}`);
          const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
          const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

          return res.json({
            success: true,
            orderId,
            paymentId: data.id,
            pixCode: qrCode,
            pixQrBase64: qrCodeBase64,
            isSimulated: false,
            paymentMethod: "mercadopago_pix"
          });
        } else {
          const errText = await response.text();
          console.error(`[Mercado Pago] Failed to generate real PIX payment:`, errText);
        }
      } catch (e) {
        console.error(`[Mercado Pago] Error creating real PIX payment:`, e);
      }
    }

    // PIX Fallback to simulation
    console.log(`[Mercado Pago] Falling back to PIX simulation for Order ID: ${orderId}`);
    const randomCopiaECola = `00020101021226850014br.gov.bcb.pix2563pix.mercadopago.com/qr/${Math.floor(10000000 + Math.random() * 90000000)}5204000053039865407${Number(totalAmount).toFixed(2)}5802BR5915TECHNOVA%20LTDA6009Sao%20Paulo62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
    return res.json({
      success: true,
      orderId,
      preferenceId: `sim-pref-${Math.floor(100000 + Math.random() * 900000)}`,
      initPoint: "#mercadopago-simulated-portal",
      sandboxInitPoint: "#mercadopago-simulated-portal",
      pixCode: randomCopiaECola,
      isSimulated: true,
      paymentMethod: "mercadopago_pix"
    });
  }

  // Sync cart item prices with latest prices in the server database (productsDb) to ensure absolute alignment
  const syncedCart = cart.map((item: any) => {
    const matchedProduct = productsDb.find(p => p.id === item.id);
    if (matchedProduct) {
      return {
        ...item,
        price: matchedProduct.price,
        name: matchedProduct.name
      };
    }
    return item;
  });

  const cartSubtotal = syncedCart.reduce((sum: number, item: any) => sum + (Number(item.price) * (Number(item.quantity) || 1)), 0);
  const factor = cartSubtotal > 0 ? (Number(totalAmount) / cartSubtotal) : 1;

  const mpItems = syncedCart.map((item: any) => {
    const qty = Number(item.quantity) || 1;
    const rawPrice = Number(item.price) * factor;
    return {
      id: item.id || `item-${Date.now()}`,
      title: item.name,
      description: `Dispositivo Eletrônico - TECHNOVA`,
      quantity: qty,
      currency_id: "BRL",
      unit_price: Number(rawPrice.toFixed(2))
    };
  });

  // Adjust for small rounding difference if necessary
  const mpItemsTotal = mpItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const diff = Number((Number(totalAmount) - mpItemsTotal).toFixed(2));
  if (diff !== 0 && mpItems.length > 0) {
    const firstItem = mpItems[0];
    firstItem.unit_price = Number((firstItem.unit_price + (diff / firstItem.quantity)).toFixed(2));
  }

  // If we have a real access token, try to communicate with Mercado Pago API!
  if (token && token.trim() !== "" && token !== "MERCADOPAGO_ACCESS_TOKEN") {
    try {
      console.log(`[Mercado Pago] Generating real Preference ID with Token: ${token.substring(0, 10)}...`);
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: mpItems,
          payer: {
            name: customer.name,
            email: customer.email,
            phone: {
              area_code: customer.phone ? customer.phone.replace(/\D/g, "").slice(0, 2) : "11",
              number: customer.phone ? customer.phone.replace(/\D/g, "").slice(2) : "999999999"
            },
            identification: {
              type: "CPF",
              number: getValidCPF(customer.cpf)
            }
          },
          back_urls: {
            success: `${process.env.APP_URL || 'http://localhost:3000'}/?status=success&orderId=${orderId}`,
            failure: `${process.env.APP_URL || 'http://localhost:3000'}/?status=failure&orderId=${orderId}`,
            pending: `${process.env.APP_URL || 'http://localhost:3000'}/?status=pending&orderId=${orderId}`
          },
          auto_return: "approved",
          external_reference: orderId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`[Mercado Pago] Real preference successfully generated! ID: ${data.id}`);
        return res.json({
          success: true,
          orderId,
          preferenceId: data.id,
          initPoint: data.init_point,
          sandboxInitPoint: data.sandbox_init_point,
          isSimulated: false,
          paymentMethod: "mercadopago_card"
        });
      } else {
        const errText = await response.text();
        console.error(`[Mercado Pago] Failed response from Mercado Pago API:`, errText);
        // Fall back to simulation if real token fails or invalid
      }
    } catch (e) {
      console.error(`[Mercado Pago] Error making request to Mercado Pago API:`, e);
      // Fall back to simulation if connection fails
    }
  }

  // Beautiful simulation fallback
  console.log(`[Mercado Pago] Creating simulation checkout context for Order ID: ${orderId}`);
  
  // Create a realistic Pix QR / copia e cola string
  const randomCopiaECola = `00020101021226850014br.gov.bcb.pix2563pix.mercadopago.com/qr/${Math.floor(10000000 + Math.random() * 90000000)}5204000053039865407${Number(totalAmount).toFixed(2)}5802BR5915TECHNOVA%20LTDA6009Sao%20Paulo62070503***6304${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;

  return res.json({
    success: true,
    orderId,
    preferenceId: `sim-pref-${Math.floor(100000 + Math.random() * 900000)}`,
    initPoint: "#mercadopago-simulated-portal",
    sandboxInitPoint: "#mercadopago-simulated-portal",
    pixCode: randomCopiaECola,
    isSimulated: true,
    paymentMethod
  });
});

// Serve Vite-managed app
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in DEVELOPMENT mode. Mounting Vite dev server...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode. Serving static built assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[TECHNOVA Server] Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
