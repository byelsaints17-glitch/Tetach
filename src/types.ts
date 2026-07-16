export type Tab =
  | "inicio"
  | "celulares"
  | "computadores"
  | "notebooks"
  | "tablets"
  | "monitores"
  | "impressoras"
  | "tvs"
  | "smartwatches"
  | "fones"
  | "perifericos"
  | "pecas"
  | "gamer"
  | "ofertas"
  | "lancamentos"
  | "marcas"
  | "carrinho"
  | "finalizar"
  | "pedidos"
  | "conta"
  | "desejos"
  | "contato"
  | "privacidade"
  | "termos"
  | "faq"
  | "sobre"
  | "admin";

export interface Product {
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

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  orderId: string;
  orderDate: string;
  totalAmount: number;
  customer: {
    name: string;
    cpf: string;
    birthDate: string;
    email: string;
    phone: string;
  };
  deliveryAddress: {
    address: string;
    number: string;
    neighborhood: string;
    complement: string;
    city: string;
    state: string;
    zip: string;
  };
  payment: {
    cardName: string;
    cardNumber: string;
    expiry: string;
    installments?: number;
  };
  cart: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  status: "Pendente" | "Aprovado" | "Preparando" | "Em Transporte" | "Entregue";
  trackingCode: string;
}

