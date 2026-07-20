import { useState, useEffect } from "react";
import { Tab, Product, CartItem, Order } from "./types";
import Header from "./components/Header";
import BenefitsBar from "./components/BenefitsBar";
import HomeView from "./components/HomeView";
import CategoryView from "./components/CategoryView";
import CartView from "./components/CartView";
import CheckoutView from "./components/CheckoutView";
import OrdersTrackingView from "./components/OrdersTrackingView";
import MyAccountView from "./components/MyAccountView";
import ContactView from "./components/ContactView";
import ProductDetailView from "./components/ProductDetailView";
import AdminDashboard from "./components/AdminDashboard";
import CompanyInfoView from "./components/CompanyInfoView";
import { ShieldCheck, Truck, RotateCcw, Calendar, ShoppingCart, Info, Check } from "lucide-react";
import { filterLocalProducts, getLocalProducts } from "./utils/localDb";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("inicio");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. Fetch initial products or perform query search
  const fetchProducts = async (query = "", category = "todos") => {
    setIsLoading(true);

    let loaded = false;
    try {
      const url = `/api/products?category=${category}&q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data && data.length > 0 && !query && (category === "todos" || category === "inicio")) {
          localStorage.setItem("technova_products_db", JSON.stringify(data));
        }
        loaded = true;
      }
    } catch (err) {
      console.error("Error fetching products from server, falling back to localDb:", err);
    }

    if (!loaded) {
      setProducts(filterLocalProducts(query, category));
    }
    setIsLoading(false);
  };

  // Trigger loading products on mount and when query changes
  useEffect(() => {
    // Only query with category value if activeTab is a product/catalog category.
    const isProductCategory = [
      "inicio", "celulares", "notebooks", "computadores", "tablets", 
      "monitores", "impressoras", "tvs", "smartwatches", "fones", 
      "perifericos", "pecas", "gamer", "bicicletas", "ofertas", "lancamentos"
    ].includes(activeTab);

    const categoryParam = isProductCategory 
      ? (activeTab === "inicio" ? "todos" : activeTab) 
      : "todos";

    fetchProducts(searchQuery, categoryParam);
  }, [searchQuery, activeTab]);

  // 2. Load Cart, Orders & Wishlist from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("technova_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart localstorage", e);
      }
    }

    const savedOrders = localStorage.getItem("technova_orders");
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error("Failed to parse orders localstorage", e);
      }
    }

    const savedWishlist = localStorage.getItem("technova_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Failed to parse wishlist localstorage", e);
      }
    }
  }, []);

  // Check URL parameters on mount to activate administrative panel if ?admin=true is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search.toLowerCase();
      if (search.includes("admin=true")) {
        try {
          localStorage.setItem("technova_admin_unlocked", "true");
        } catch (e) {
          console.error("Failed to write to localStorage", e);
        }
        setActiveTab("admin");
      }
    }
  }, []);

  const [isFirstRender, setIsFirstRender] = useState(true);

  // Check URL parameters on mount to load a specific product directly (Deep Linking)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("p") || params.get("produto") || params.get("product");
      if (productId) {
        // Fetch from API to get up-to-date data (and support custom database products on Vercel)
        fetch(`/api/products/${productId}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error("Product not found on server");
          })
          .then(prod => {
            setSelectedProduct(prod);
          })
          .catch(err => {
            console.warn("Could not load product from API, falling back to local DB:", err);
            const localProds = getLocalProducts();
            const found = localProds.find(p => p.id === productId);
            if (found) {
              setSelectedProduct(found);
            }
          });
      }
    }
  }, []);

  // Listen to popstate (browser back/forward buttons) to synchronize with URL product ID
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("p") || params.get("produto") || params.get("product");
      if (productId) {
        fetch(`/api/products/${productId}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error("Product not found on server");
          })
          .then(prod => {
            setSelectedProduct(prod);
          })
          .catch(err => {
            console.warn("Could not load product from API popstate, falling back to local DB:", err);
            const localProds = getLocalProducts();
            const found = localProds.find(p => p.id === productId);
            if (found) {
              setSelectedProduct(found);
            } else {
              setSelectedProduct(null);
            }
          });
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update URL search parameters when selectedProduct changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const currentParamId = params.get("p") || params.get("produto") || params.get("product");
      
      if (selectedProduct) {
        if (currentParamId !== selectedProduct.id) {
          const newUrl = `${window.location.pathname}?p=${selectedProduct.id}`;
          window.history.pushState({ p: selectedProduct.id }, "", newUrl);
        }
      } else {
        if (currentParamId) {
          const url = new URL(window.location.href);
          url.searchParams.delete("p");
          url.searchParams.delete("produto");
          url.searchParams.delete("product");
          const newUrl = url.search.trim() ? `${window.location.pathname}${url.search}` : window.location.pathname;
          window.history.pushState({}, "", newUrl);
        }
      }
    }
  }, [selectedProduct]);

  // Scroll to top smoothly on page/tab changes and close product detail page unless it's initial render
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (isFirstRender) {
      setIsFirstRender(false);
    } else {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  // Scroll to top smoothly on product details select
  useEffect(() => {
    if (selectedProduct) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedProduct]);

  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    let updated;
    if (exists) {
      updated = wishlist.filter((item) => item.id !== product.id);
    } else {
      updated = [...wishlist, product];
    }
    setWishlist(updated);
    localStorage.setItem("technova_wishlist", JSON.stringify(updated));
  };

  // 3. Sync cart with LocalStorage on update
  const handleSetCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("technova_cart", JSON.stringify(newCart));
  };

  // Synchronize cart item prices with current products list when products change
  useEffect(() => {
    if (products.length === 0 || cart.length === 0) return;
    
    let cartUpdated = false;
    const updatedCart = cart.map((item) => {
      const currentProduct = products.find((p) => p.id === item.id);
      if (currentProduct && (currentProduct.price !== item.price || currentProduct.name !== item.name || currentProduct.imageUrl !== item.imageUrl)) {
        cartUpdated = true;
        return {
          ...item,
          price: currentProduct.price,
          name: currentProduct.name,
          imageUrl: currentProduct.imageUrl,
        };
      }
      return item;
    });

    if (cartUpdated) {
      console.log("Synchronizing cart item prices with updated product database");
      handleSetCart(updatedCart);
    }
  }, [products]);

  // Add to cart function
  const handleAddToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      handleSetCart(updated);
    } else {
      handleSetCart([...cart, { ...product, quantity: 1 }]);
    }
    setActiveTab("carrinho");
  };

  // Update cart quantity
  const handleUpdateQuantity = (id: string, amount: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const qty = item.quantity + amount;
          return qty > 0 ? { ...item, quantity: qty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    handleSetCart(updated);
  };

  // Remove from cart
  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    handleSetCart(updated);
  };

  // Clear entire cart
  const handleClearCart = () => {
    handleSetCart([]);
  };

  // 4. Handle completed orders
  const handleOrderCompleted = (newOrder: Order) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("technova_orders", JSON.stringify(updatedOrders));
    setActiveTab("pedidos"); // Take user directly to tracing view
  };

  // Filter products by searching
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col font-sans select-none selection:bg-[#0086ff]/20">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery(""); // Reset search on tab switch
        }}
        cartCount={cartCount}
        onSearch={handleSearch}
        wishlistCount={wishlist.length}
      />

      {/* Benefits bar (Visible under header on home/category/catalog) */}
      {(activeTab === "inicio" ||
        activeTab === "celulares" ||
        activeTab === "notebooks" ||
        activeTab === "computadores" ||
        activeTab === "tablets" ||
        activeTab === "monitores" ||
        activeTab === "impressoras" ||
        activeTab === "tvs" ||
        activeTab === "smartwatches" ||
        activeTab === "fones" ||
        activeTab === "perifericos" ||
        activeTab === "pecas" ||
        activeTab === "gamer" ||
        activeTab === "bicicletas" ||
        activeTab === "ofertas" ||
        activeTab === "lancamentos") && <BenefitsBar />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            allProducts={products}
            onViewProduct={(p) => setSelectedProduct(p)}
          />
        ) : (
          <>
            {activeTab === "inicio" && (
          <HomeView
            products={products}
            setActiveTab={setActiveTab}
            onAddToCart={handleAddToCart}
            onViewProduct={(p) => setSelectedProduct(p)}
            isLoading={isLoading}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        )}

        {[
          "celulares", "notebooks", "computadores", "tablets", "monitores", 
          "impressoras", "tvs", "smartwatches", "fones", "perifericos", 
          "pecas", "gamer", "bicicletas", "ofertas", "lancamentos"
        ].includes(activeTab) && (
          <CategoryView
            products={products}
            category={activeTab}
            onAddToCart={handleAddToCart}
            onViewProduct={(p) => setSelectedProduct(p)}
            isLoading={isLoading}
            onToggleWishlist={handleToggleWishlist}
            wishlist={wishlist}
          />
        )}

        {activeTab === "carrinho" && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            setActiveTab={setActiveTab}
            onProceedToCheckout={() => setActiveTab("finalizar")}
          />
        )}

        {activeTab === "finalizar" && (
          <CheckoutView
            cart={cart}
            onOrderCompleted={handleOrderCompleted}
            setActiveTab={setActiveTab}
            onClearCart={handleClearCart}
          />
        )}

        {activeTab === "pedidos" && (
          <OrdersTrackingView 
            orders={orders} 
            products={products}
            setActiveTab={setActiveTab} 
            onViewProduct={setSelectedProduct} 
          />
        )}

        {activeTab === "conta" && <MyAccountView />}

        {activeTab === "contato" && <ContactView />}

        {[
          "faq", "privacidade", "termos", "sobre", "marcas", "desejos"
        ].includes(activeTab) && (
          <CompanyInfoView
            section={activeTab as any}
            wishlist={wishlist}
            onRemoveFromWishlist={(id) => {
              const item = wishlist.find((p) => p.id === id);
              if (item) handleToggleWishlist(item);
            }}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboard
            onProductChanged={() => {
              fetchProducts(searchQuery, activeTab === "inicio" ? "todos" : activeTab);
            }}
          />
        )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-gray-400 mt-20">
        {/* Top footer details */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <button 
                onClick={() => setActiveTab("inicio")} 
                className="flex items-center gap-3 hover:opacity-95 transition-opacity cursor-pointer group text-left"
              >
                <div className="bg-blue-600 p-2 rounded-lg text-white group-hover:bg-blue-500 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  TECH<span className="text-blue-500">NOVA</span>
                </h3>
              </button>
              <p className="text-xs leading-relaxed font-medium">
                Sua loja de tecnologia premium no Brasil. Levando a inovação, velocidade e o futuro até a porta da sua casa.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Loja Segura</h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" />
                  <span>Ambiente Seguro SSL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Entrega Rápida com Rastreio</span>
                </li>
                <li className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-green-500" />
                  <span>Devolução Facilitada (7 dias)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Informações</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <button onClick={() => setActiveTab("sobre")} className="hover:text-white transition-colors text-left">
                    Sobre a Empresa
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("marcas")} className="hover:text-white transition-colors text-left">
                    Marcas Parceiras
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("faq")} className="hover:text-white transition-colors text-left">
                    Dúvidas (FAQ)
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("privacidade")} className="hover:text-white transition-colors text-left">
                    Política de Privacidade
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab("termos")} className="hover:text-white transition-colors text-left">
                    Termos de Uso
                  </button>
                </li>
                <li className="pt-2 border-t border-slate-800/40">
                  <button 
                    onClick={() => setActiveTab("admin")} 
                    className="text-slate-600/50 hover:text-slate-400 transition-all text-left text-[10px] font-normal tracking-wide uppercase"
                    title="Painel Administrativo"
                  >
                    Painel Administrativo
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Suporte</h4>
              <ul className="space-y-2 text-xs">
                <li>Central de Relacionamento:</li>
                <li className="font-bold text-white font-mono break-all text-[11px] pb-1">suporte@technova.com.br</li>
                <li>
                  <button onClick={() => setActiveTab("contato")} className="text-blue-500 hover:underline text-left">
                    Fale com nosso Atendimento
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright line */}
          <div className="border-t border-slate-800/60 mt-10 pt-6 text-center text-xs space-y-2">
            <p className="font-bold text-gray-500">
              © {new Date().getFullYear()} TECHNOVA LTDA. Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-gray-600">
              Av. Paulista, 1000, Bela Vista, São Paulo/SP - CNPJ: 12.345.678/0001-99
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
