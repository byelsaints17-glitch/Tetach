import React, { useState, useEffect } from "react";
import { 
  TrendingUp, ShoppingBag, Clock, DollarSign, AlertTriangle, Plus, 
  Edit2, Trash2, Check, RefreshCw, ChevronRight, Package, Truck, 
  MapPin, User, ArrowLeft, Search, Filter, Sparkles, Image, Key, 
  Settings, HelpCircle, Upload, Star, Lock, Eye, EyeOff, Shield
} from "lucide-react";
import { Product, Order } from "../types";
import { 
  getLocalProducts, 
  saveLocalProduct, 
  deleteLocalProduct, 
  getLocalOrders, 
  updateLocalOrderStatus, 
  getLocalReports,
  getLocalCurrentUser,
  setLocalCurrentUser,
  getLocalUsers
} from "../utils/localDb";

interface AdminDashboardProps {
  onProductChanged?: () => void;
}

export default function AdminDashboard({ onProductChanged }: AdminDashboardProps) {
  // Admin Authorization Gate State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<"reports" | "products" | "orders">("reports");
  const [reports, setReports] = useState<any>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state for product management
  const [prodSearch, setProdSearch] = useState("");
  const [prodCatFilter, setProdCatFilter] = useState("todos");

  // Product CRUD states
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formCategory, setFormCategory] = useState("celulares");
  const [formPrice, setFormPrice] = useState("");
  const [formOriginalPrice, setFormOriginalPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formWarranty, setFormWarranty] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [formSpecs, setFormSpecs] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // API Import Wizard States
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [apiSource, setApiSource] = useState<"dummyjson" | "fakestore" | "mercadolibre">("dummyjson");
  const [apiSearchResults, setApiSearchResults] = useState<any[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [apiSearchError, setApiSearchError] = useState("");

  // Image Search States
  const [imgSearchQuery, setImgSearchQuery] = useState("");
  const [imgSource, setImgSource] = useState<"unsplash" | "pexels" | "pixabay">("unsplash");
  const [imgSearchResults, setImgSearchResults] = useState<string[]>([]);
  const [isSearchingImg, setIsSearchingImg] = useState(false);
  const [imgSearchError, setImgSearchError] = useState("");
  const [apiKeyUnsplash, setApiKeyUnsplash] = useState(() => localStorage.getItem("technova_unsplash_key") || "");
  const [apiKeyPexels, setApiKeyPexels] = useState(() => localStorage.getItem("technova_pexels_key") || "");
  const [apiKeyPixabay, setApiKeyPixabay] = useState(() => localStorage.getItem("technova_pixabay_key") || "");
  const [showImgSearchPanel, setShowImgSearchPanel] = useState(false);
  const [showProductImportPanel, setShowProductImportPanel] = useState(false);

  // Order detail state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [trackingCodeInput, setTrackingCodeInput] = useState("");

  // Fetch admin report & data
  const loadReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        return;
      }
    } catch (e) {
      console.warn("Error loading reports from API, using local fallback:", e);
    }
    const localRep = getLocalReports();
    setReports(localRep);
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
        return;
      }
    } catch (e) {
      console.warn("Error loading products from API, using local fallback:", e);
    }
    setProductsList(getLocalProducts());
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
        return;
      }
    } catch (e) {
      console.warn("Error loading orders from API, using local fallback:", e);
    }
    setOrdersList(getLocalOrders());
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([loadReports(), loadProducts(), loadOrders()]);
    setIsLoading(false);
  };

  useEffect(() => {
    const user = getLocalCurrentUser();
    if (user && user.role === "admin") {
      setIsAdmin(true);
      loadAllData();
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setIsAuthLoading(true);

    let apiLoggedInUser = null;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });

      if (res.ok) {
        const data = await res.json();
        apiLoggedInUser = data.user;
      } else if (res.status === 401 || res.status === 400) {
        const err = await res.json();
        setAdminError(err.error || "E-mail ou senha incorretos.");
        setIsAuthLoading(false);
        return;
      }
    } catch (err) {
      console.warn("API login failed, logging in via localStorage fallback.", err);
    }

    if (apiLoggedInUser && apiLoggedInUser.role === "admin") {
      setLocalCurrentUser(apiLoggedInUser);
      setIsAdmin(true);
      setIsLoading(true);
      await Promise.all([loadReports(), loadProducts(), loadOrders()]);
      setIsLoading(false);
    } else if (apiLoggedInUser && apiLoggedInUser.role !== "admin") {
      setAdminError("Esta conta não possui perfil de Administrador.");
    } else {
      // Local database check fallback
      const localUsers = getLocalUsers();
      const matched = localUsers.find(
        u => u.email.toLowerCase() === adminEmail.toLowerCase().trim() && u.password === adminPassword
      );

      if (matched) {
        if (matched.role === "admin") {
          setLocalCurrentUser(matched);
          setIsAdmin(true);
          setIsLoading(true);
          await Promise.all([loadReports(), loadProducts(), loadOrders()]);
          setIsLoading(false);
        } else {
          setAdminError("Esta conta não possui perfil de Administrador.");
        }
      } else {
        setAdminError("E-mail ou senha incorretos. Por favor, tente novamente.");
      }
    }

    setIsAuthLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadReports(), loadProducts(), loadOrders()]);
    setIsRefreshing(false);
  };

  // Create or Update Product
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("");
    setFormModel("");
    setFormCategory("celulares");
    setFormPrice("");
    setFormOriginalPrice("");
    setFormStock("");
    setFormWarranty("1 Ano de Garantia Oficial");
    setFormImageUrl("https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600");
    setFormImages(["https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600"]);
    setGalleryUrlInput("");
    setFormSpecs("Processador de última geração\nTela AMOLED de alta definição\nBateria de longa duração");
    setFormDescription("Dispositivo premium de alta performance projetado para oferecer a melhor experiência.");
    setErrorMessage("");
    // Reset wizard
    setApiSearchQuery("");
    setApiSearchResults([]);
    setApiSearchError("");
    setImgSearchQuery("");
    setImgSearchResults([]);
    setImgSearchError("");
    setShowProductImportPanel(false);
    setShowImgSearchPanel(false);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormModel(product.model);
    setFormCategory(product.category);
    setFormPrice(product.price.toString());
    setFormOriginalPrice((product.originalPrice || "").toString());
    setFormStock(product.stock.toString());
    setFormWarranty(product.warranty);
    setFormImageUrl(product.imageUrl);
    setFormImages(product.images && product.images.length > 0 ? [...product.images] : [product.imageUrl]);
    setGalleryUrlInput("");
    setFormSpecs(product.specs.join("\n"));
    setFormDescription(product.description);
    setErrorMessage("");
    // Reset wizard
    setApiSearchQuery("");
    setApiSearchResults([]);
    setApiSearchError("");
    setImgSearchQuery(product.name);
    setImgSearchResults([]);
    setImgSearchError("");
    setShowProductImportPanel(false);
    setShowImgSearchPanel(false);
    setShowProductModal(true);
  };

  // Helper mappings for external product APIs
  const mapDummyJsonCategory = (cat: string): string => {
    const c = (cat || "").toLowerCase();
    if (c.includes("phone") || c.includes("mobile")) return "celulares";
    if (c.includes("laptop") || c.includes("computer") || c.includes("pc")) return "notebooks";
    if (c.includes("tablet") || c.includes("ipad")) return "tablets";
    if (c.includes("watch") || c.includes("wearable")) return "smartwatches";
    if (c.includes("tv") || c.includes("television")) return "tvs";
    if (c.includes("audio") || c.includes("headphone") || c.includes("earbud") || c.includes("speaker") || c.includes("sound")) return "fones";
    if (c.includes("monitor") || c.includes("display")) return "monitores";
    if (c.includes("printer")) return "impressoras";
    if (c.includes("accessory") || c.includes("keyboard") || c.includes("mouse")) return "perifericos";
    if (c.includes("game") || c.includes("console") || c.includes("playstation") || c.includes("xbox")) return "gamer";
    if (c.includes("hardware") || c.includes("gpu") || c.includes("cpu") || c.includes("ram") || c.includes("ssd") || c.includes("storage")) return "pecas";
    return "celulares";
  };

  const mapFakeStoreCategory = (cat: string): string => {
    const c = (cat || "").toLowerCase();
    if (c.includes("electronics")) return "computadores";
    return "perifericos";
  };

  const mapMercadoLivreCategory = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes("celular") || t.includes("smartphone") || t.includes("iphone")) return "celulares";
    if (t.includes("notebook") || t.includes("laptop") || t.includes("macbook") || t.includes("dell")) return "notebooks";
    if (t.includes("computador") || t.includes("pc gamer") || t.includes("desktop")) return "computadores";
    if (t.includes("tablet") || t.includes("ipad")) return "tablets";
    if (t.includes("monitor")) return "monitores";
    if (t.includes("tv") || t.includes("televisão")) return "tvs";
    if (t.includes("impressora") || t.includes("multifuncional")) return "impressoras";
    if (t.includes("watch") || t.includes("relógio") || t.includes("smartwatch")) return "smartwatches";
    if (t.includes("fone") || t.includes("headset") || t.includes("headphone") || t.includes("earbud") || t.includes("jbl")) return "fones";
    if (t.includes("teclado") || t.includes("mouse") || t.includes("periferico") || t.includes("teclados") || t.includes("mouses")) return "perifericos";
    if (t.includes("placa de vídeo") || t.includes("rtx") || t.includes("processador") || t.includes("ram") || t.includes("ssd") || t.includes("peças") || t.includes("pecas")) return "pecas";
    if (t.includes("gamer") || t.includes("console") || t.includes("playstation") || t.includes("xbox") || t.includes("nintendo")) return "gamer";
    return "celulares";
  };

  // Search products from public DummyJSON/FakeStore
  const handleSearchApiProducts = async () => {
    if (!apiSearchQuery.trim()) {
      setApiSearchError("Por favor, digite um termo para pesquisar.");
      return;
    }
    setIsSearchingApi(true);
    setApiSearchError("");
    setApiSearchResults([]);
    try {
      if (apiSource === "dummyjson") {
        const res = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(apiSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            setApiSearchResults(data.products.map((p: any) => ({
              id: p.id,
              name: p.title,
              brand: p.brand || "Generico",
              model: p.title.split(" ").slice(1).join(" ") || "Padrão",
              category: mapDummyJsonCategory(p.category),
              price: Math.round((p.price * 5.5) / 3),
              originalPrice: Math.round(((p.price * 5.5) / (1 - (p.discountPercentage || 10) / 100)) / 3),
              stock: p.stock || 15,
              warranty: p.warrantyInformation || "1 Ano de Garantia Nacional",
              imageUrl: p.images?.[0] || p.thumbnail,
              description: p.description,
              specs: [
                `Marca: ${p.brand || "N/A"}`,
                `Categoria original: ${p.category}`,
                `Avaliação: ${p.rating || "4.5"}/5.0`,
                `Garantia: ${p.warrantyInformation || "1 Ano"}`,
                `Entrega: ${p.shippingInformation || "Pronta entrega"}`
              ]
            })));
          } else {
            setApiSearchError("Nenhum produto encontrado com este termo.");
          }
        } else {
          setApiSearchError("Erro na resposta da API DummyJSON.");
        }
      } else if (apiSource === "fakestore") {
        const res = await fetch("https://fakestoreapi.com/products");
        if (res.ok) {
          const data = await res.json();
          const queryLower = apiSearchQuery.toLowerCase();
          const filtered = data.filter((p: any) => 
            p.title.toLowerCase().includes(queryLower) || 
            p.description.toLowerCase().includes(queryLower)
          );
          if (filtered.length > 0) {
            setApiSearchResults(filtered.map((p: any) => ({
              id: p.id,
              name: p.title,
              brand: "Importado",
              model: "Modelo " + p.id,
              category: mapFakeStoreCategory(p.category),
              price: Math.round((p.price * 5.5) / 3),
              originalPrice: Math.round((p.price * 5.5 * 1.25) / 3),
              stock: 12,
              warranty: "3 Meses de Garantia",
              imageUrl: p.image,
              description: p.description,
              specs: [
                `Categoria original: ${p.category}`,
                `Avaliação: ${p.rating?.rate || "4.2"}/5.0 (${p.rating?.count || 10} avaliações)`
              ]
            })));
          } else {
            setApiSearchError("Nenhum produto correspondente na FakeStore API.");
          }
        } else {
          setApiSearchError("Erro na resposta da FakeStore API.");
        }
      } else if (apiSource === "mercadolibre") {
        const res = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(apiSearchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setApiSearchResults(data.results.map((p: any) => {
              const brandAttr = p.attributes?.find((attr: any) => attr.id === "BRAND" || attr.name?.toLowerCase() === "marca");
              const brand = brandAttr ? brandAttr.value_name : (p.title.split(" ")[0] || "Importado");
              
              const modelAttr = p.attributes?.find((attr: any) => attr.id === "MODEL" || attr.name?.toLowerCase() === "modelo");
              const model = modelAttr ? modelAttr.value_name : "Padrão";

              let imageUrl = p.thumbnail || "";
              if (imageUrl.startsWith("http://")) {
                imageUrl = imageUrl.replace("http://", "https://");
              }
              if (imageUrl.includes("-I.jpg")) {
                imageUrl = imageUrl.replace("-I.jpg", "-O.jpg");
              }

              return {
                id: p.id,
                name: p.title,
                brand: brand,
                model: model,
                category: mapMercadoLivreCategory(p.title),
                price: Math.round(p.price / 3),
                originalPrice: Math.round(p.price),
                stock: p.available_quantity || 15,
                warranty: "6 Meses de Garantia",
                imageUrl: imageUrl,
                description: `Produto de alta qualidade: ${p.title}. Integrado diretamente para venda promocional com desconto fantástico de 1/3 do preço original.`,
                specs: [
                  `Marca: ${brand}`,
                  `Modelo: ${model}`,
                  `Origem: Mercado Livre MLB`,
                  `Código de Referência: ${p.id}`
                ]
              };
            }));
          } else {
            setApiSearchError("Nenhum produto correspondente no Mercado Livre.");
          }
        } else {
          setApiSearchError("Erro na resposta do Mercado Livre.");
        }
      }
    } catch (e) {
      console.error("API product search failed:", e);
      setApiSearchError("Falha de rede ao conectar com as APIs de importação.");
    } finally {
      setIsSearchingApi(false);
    }
  };

  // Search Images from Unsplash/Pexels/Pixabay
  const handleSearchImages = async () => {
    if (!imgSearchQuery.trim()) {
      setImgSearchError("Por favor, digite um termo para buscar.");
      return;
    }
    setIsSearchingImg(true);
    setImgSearchError("");
    setImgSearchResults([]);

    try {
      if (imgSource === "unsplash") {
        const key = apiKeyUnsplash.trim();
        if (!key) {
          setImgSearchResults([
            `https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=600&q=80&auto=format&fit=crop&q=${encodeURIComponent(imgSearchQuery)}`,
            `https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop&q=${encodeURIComponent(imgSearchQuery)}`,
            `https://images.unsplash.com/photo-1496181130204-7552cc14f1d0?w=600&q=80&auto=format&fit=crop&q=${encodeURIComponent(imgSearchQuery)}`,
            `https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80&auto=format&fit=crop&q=${encodeURIComponent(imgSearchQuery)}`
          ]);
          setImgSearchError("Como você não inseriu uma API Key, exibimos sugestões baseadas no Unsplash. Para buscas reais precisas, insira sua API Key ao lado.");
          return;
        }

        const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(imgSearchQuery)}&per_page=8`, {
          headers: {
            "Authorization": `Client-ID ${key}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setImgSearchResults(data.results.map((r: any) => r.urls.regular || r.urls.small));
          } else {
            setImgSearchError("Nenhuma imagem encontrada no Unsplash para este termo.");
          }
        } else {
          setImgSearchError("Erro na API do Unsplash. Verifique sua chave.");
        }
      } else if (imgSource === "pexels") {
        const key = apiKeyPexels.trim();
        if (!key) {
          setImgSearchError("Por favor, insira sua chave da API Pexels.");
          return;
        }
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(imgSearchQuery)}&per_page=8`, {
          headers: {
            "Authorization": key
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            setImgSearchResults(data.photos.map((p: any) => p.src.large || p.src.medium));
          } else {
            setImgSearchError("Nenhuma imagem encontrada no Pexels para este termo.");
          }
        } else {
          setImgSearchError("Erro na API do Pexels. Verifique sua chave.");
        }
      } else if (imgSource === "pixabay") {
        const key = apiKeyPixabay.trim();
        if (!key) {
          setImgSearchError("Por favor, insira sua chave da API Pixabay.");
          return;
        }
        const res = await fetch(`https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(imgSearchQuery)}&image_type=photo&per_page=8`);
        if (res.ok) {
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            setImgSearchResults(data.hits.map((h: any) => h.largeImageURL || h.webformatURL));
          } else {
            setImgSearchError("Nenhuma imagem encontrada no Pixabay para este termo.");
          }
        } else {
          setImgSearchError("Erro na API do Pixabay. Verifique sua chave.");
        }
      }
    } catch (e) {
      console.error("Image search failed:", e);
      setImgSearchError("Falha ao buscar imagens nas APIs.");
    } finally {
      setIsSearchingImg(false);
    }
  };

  const handleSelectApiProduct = (prod: any) => {
    setFormName(prod.name);
    setFormBrand(prod.brand);
    setFormModel(prod.model);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormOriginalPrice((prod.originalPrice || "").toString());
    setFormStock(prod.stock.toString());
    setFormWarranty(prod.warranty);
    setFormImageUrl(prod.imageUrl);
    setFormSpecs(prod.specs.join("\n"));
    setFormDescription(prod.description);
    
    // Auto-fill image search query too for ease
    setImgSearchQuery(prod.name);
    setShowProductImportPanel(false);
  };

  const handleSaveApiKeyUnsplash = (val: string) => {
    setApiKeyUnsplash(val);
    localStorage.setItem("technova_unsplash_key", val);
  };

  const handleSaveApiKeyPexels = (val: string) => {
    setApiKeyPexels(val);
    localStorage.setItem("technova_pexels_key", val);
  };

  const handleSaveApiKeyPixabay = (val: string) => {
    setApiKeyPixabay(val);
    localStorage.setItem("technova_pixabay_key", val);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("A imagem é muito grande. Escolha uma foto de até 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormImages(prev => {
        const updated = [...prev, base64String];
        if (!formImageUrl || formImageUrl.startsWith("https://images.unsplash.com/photo-1546054454-aa26e2b734c7")) {
          setFormImageUrl(base64String);
        }
        return updated;
      });
    };
    reader.onerror = () => {
      setErrorMessage("Ocorreu um erro ao ler o arquivo de imagem.");
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageFromSearch = (url: string) => {
    setFormImages(prev => {
      if (prev.includes(url)) return prev;
      return [...prev, url];
    });
    setFormImageUrl(prev => {
      if (!prev || prev.startsWith("https://images.unsplash.com/photo-1546054454-aa26e2b734c7")) {
        return url;
      }
      return prev;
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBrand || !formModel || !formPrice || !formStock) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const finalImageUrl = formImageUrl || (formImages.length > 0 ? formImages[0] : "");
    const finalImages = formImages.length > 0 ? formImages : (finalImageUrl ? [finalImageUrl] : []);

    const payload = {
      name: formName,
      brand: formBrand,
      model: formModel,
      category: formCategory,
      price: parseFloat(formPrice),
      originalPrice: formOriginalPrice ? parseFloat(formOriginalPrice) : undefined,
      stock: parseInt(formStock),
      warranty: formWarranty,
      imageUrl: finalImageUrl,
      images: finalImages,
      specs: formSpecs.split("\n").filter(line => line.trim() !== ""),
      description: formDescription
    };

    let apiSaved = null;
    try {
      let res;
      if (editingProduct) {
        // Edit product
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // Create product
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        apiSaved = await res.json();
      }
    } catch (e) {
      console.warn("API save product failed, using local database fallback:", e);
    }

    // Save to local database (localStorage) as fallback/sync
    const productToSave = apiSaved || {
      ...payload,
      id: editingProduct?.id
    };
    saveLocalProduct(productToSave);

    setShowProductModal(false);
    loadAllData();
    if (onProductChanged) onProductChanged();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este produto definitivamente?")) return;

    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("API delete product failed, using local database fallback:", e);
    }

    deleteLocalProduct(id);
    loadAllData();
    if (onProductChanged) onProductChanged();
  };

  // Update order status & tracking code
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderStatus(true);
    let apiUpdated = null;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        apiUpdated = await res.json();
      }
    } catch (e) {
      console.warn("API update order status failed, using local database fallback:", e);
    }

    const updated = updateLocalOrderStatus(orderId, status as any);
    if (updated) {
      setSelectedOrder(updated);
    } else if (apiUpdated) {
      setSelectedOrder(apiUpdated);
    }

    loadOrders();
    loadReports();
    setUpdatingOrderStatus(false);
  };

  const handleUpdateTrackingCode = async (e: React.FormEvent, orderId: string) => {
    e.preventDefault();
    let apiUpdated = null;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode: trackingCodeInput })
      });
      if (res.ok) {
        apiUpdated = await res.json();
      }
    } catch (e) {
      console.warn("API save tracking code failed, using local database fallback:", e);
    }

    const updated = updateLocalOrderStatus(orderId, undefined, trackingCodeInput);
    if (updated) {
      setSelectedOrder(updated);
    } else if (apiUpdated) {
      setSelectedOrder(apiUpdated);
    }

    alert("Código de rastreamento salvo com sucesso!");
    loadOrders();
  };

  // Filtering products listed in table
  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          p.brand.toLowerCase().includes(prodSearch.toLowerCase()) || 
                          p.model.toLowerCase().includes(prodSearch.toLowerCase());
    const matchesCategory = prodCatFilter === "todos" || p.category === prodCatFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
        
        <div className="text-center mb-6 space-y-2">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-white">Painel Administrativo</h3>
          <p className="text-xs text-gray-400">
            Acesso restrito para administradores do sistema. Por favor, autentique-se abaixo.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">E-mail de Login</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="administrador@technova.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-10 rounded-xl text-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showAdminPass ? "text" : "password"}
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none p-3 pl-10 pr-10 rounded-xl text-white text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowAdminPass(!showAdminPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {adminError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{adminError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            {isAuthLoading ? "Verificando Credenciais..." : "Acessar Painel"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide border border-blue-500/20">
              Módulo de Gestão
            </span>
            <span className="bg-amber-600/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide border border-amber-500/20">
              Lojista
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Painel Administrativo TECHNOVA</h2>
          <p className="text-xs text-gray-400">Controle de catálogo de produtos, rastreamento de pedidos e relatórios de faturamento em tempo real.</p>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-slate-700/60 hover:bg-slate-700 text-gray-200 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
          {isRefreshing ? "Atualizando..." : "Atualizar Dados"}
        </button>
      </div>

      {/* Reports Metrics Summary Cards */}
      {reports && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-400 shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Faturamento</p>
              <p className="text-lg sm:text-xl font-extrabold text-white">
                R$ {reports.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Pedidos</p>
              <p className="text-lg sm:text-xl font-extrabold text-white">{reports.ordersCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pendentes</p>
              <p className="text-lg sm:text-xl font-extrabold text-white">{reports.pendingCount}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ticket Médio</p>
              <p className="text-lg sm:text-xl font-extrabold text-white">
                R$ {reports.averageTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-1">
        <button 
          onClick={() => { setActiveSubTab("reports"); setSelectedOrder(null); }}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeSubTab === "reports" 
              ? "border-blue-500 text-blue-500 font-black" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Estatísticas & Alertas
        </button>
        <button 
          onClick={() => { setActiveSubTab("products"); setSelectedOrder(null); }}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeSubTab === "products" 
              ? "border-blue-500 text-blue-500 font-black" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Gerenciar Produtos ({productsList.length})
        </button>
        <button 
          onClick={() => { setActiveSubTab("orders"); setSelectedOrder(null); }}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeSubTab === "orders" 
              ? "border-blue-500 text-blue-500 font-black" 
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Gerenciar Pedidos ({ordersList.length})
        </button>
      </div>

      {/* SUBTAB CONTENT: REPORTS & ALERTS */}
      {activeSubTab === "reports" && reports && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Low Stock Warnings list */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-white text-base">Alertas de Estoque Baixo</h3>
            </div>

            {reports.lowStockProducts.length === 0 ? (
              <p className="text-gray-400 text-sm py-4">Tudo sob controle! Nenhum produto com estoque crítico (&lt; 5 unidades).</p>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[300px] overflow-y-auto pr-2">
                {reports.lowStockProducts.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-white text-sm">{p.name}</p>
                      <p className="text-gray-400 font-mono text-[10px] mt-0.5 uppercase">Categoria: {p.category}</p>
                    </div>
                    <span className="bg-red-500/10 text-red-400 font-bold border border-red-500/20 px-3 py-1 rounded-full shrink-0">
                      Estoque: {p.stock}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories distribution list */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-white text-base">Mix de Produtos</h3>
            </div>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
              {Object.entries(reports.productsByCategory).map(([cat, count]: [string, any]) => (
                <div key={cat} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-300 capitalize">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (count / 15) * 100)}%` }} />
                    </div>
                    <span className="bg-slate-800 text-gray-200 px-2 py-0.5 rounded font-mono text-[11px]">{count} itens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: PRODUCTS LIST & CRUD */}
      {activeSubTab === "products" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search inputs */}
            <div className="flex flex-1 gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome, marca ou modelo..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={prodCatFilter}
                onChange={(e) => setProdCatFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 capitalize"
              >
                <option value="todos">Todas Categorias</option>
                <option value="celulares">Celulares</option>
                <option value="notebooks">Notebooks</option>
                <option value="computadores">Computadores (Desktops)</option>
                <option value="tablets">Tablets</option>
                <option value="monitores">Monitores</option>
                <option value="impressoras">Impressoras</option>
                <option value="tvs">Smart TVs</option>
                <option value="smartwatches">Smartwatches</option>
                <option value="fones">Áudio / Fones</option>
                <option value="perifericos">Periféricos</option>
                <option value="pecas">Peças</option>
                <option value="gamer">Gamer</option>
              </select>
            </div>

            <button
              onClick={openAddProductModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </button>
          </div>

          {/* Table display */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-slate-800 text-gray-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4">Marca / Modelo</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Estoque</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto cadastrado corresponde aos critérios.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-contain bg-slate-850 p-1 rounded border border-slate-800 shrink-0" />
                            <div>
                              <p className="font-extrabold text-white text-sm max-w-xs truncate">{p.name}</p>
                              <p className="text-gray-500 text-[10px] font-mono mt-0.5">ID: {p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-200">{p.brand}</p>
                          <p className="text-gray-400 text-[11px]">{p.model}</p>
                        </td>
                        <td className="p-4 capitalize text-gray-300 font-medium">{p.category}</td>
                        <td className="p-4 font-extrabold text-white">R$ {p.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4">
                          <span className={`font-bold px-2.5 py-1 rounded text-[10px] ${
                            p.stock === 0 
                              ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                              : p.stock < 5 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : "bg-green-500/10 text-green-400"
                          }`}>
                            {p.stock} unidades
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 hover:bg-blue-600/15 text-blue-400 hover:text-white rounded transition-colors"
                              title="Editar Produto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 hover:bg-red-600/15 text-red-400 hover:text-white rounded transition-colors"
                              title="Remover Produto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB CONTENT: ORDERS LIST */}
      {activeSubTab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List Table */}
          <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-sm">Histórico de Pedidos Recebidos</h3>
              <span className="text-xs text-gray-400">{ordersList.length} pedidos</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-gray-400 font-bold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">ID Pedido</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Rastreio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {ordersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum pedido efetuado no servidor ainda.</td>
                    </tr>
                  ) : (
                    ordersList.map((o) => (
                      <tr 
                        key={o.orderId} 
                        onClick={() => {
                          setSelectedOrder(o);
                          setTrackingCodeInput(o.trackingCode || "");
                        }}
                        className={`cursor-pointer transition-colors ${
                          selectedOrder?.orderId === o.orderId 
                            ? "bg-blue-600/10 border-l-2 border-blue-500" 
                            : "hover:bg-slate-900/40"
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-blue-400">{o.orderId}</td>
                        <td className="p-4 text-gray-400">{o.orderDate.split(" ")[0]}</td>
                        <td className="p-4 text-gray-200 font-semibold">{o.customer.name}</td>
                        <td className="p-4 font-extrabold text-white">R$ {o.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "Aprovado" ? "bg-green-600/10 text-green-400 border border-green-500/20" :
                            o.status === "Preparando" ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" :
                            o.status === "Em Transporte" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" :
                            o.status === "Entregue" ? "bg-emerald-600 text-slate-950" :
                            "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-gray-400">{o.trackingCode || "Nenhum"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Order Details Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-5">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Pedido {selectedOrder.orderId}</h4>
                    <p className="text-[11px] text-gray-400 font-medium">Data: {selectedOrder.orderDate}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Shipping workflow status updater */}
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Status de Envio</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["Pendente", "Aprovado", "Preparando", "Em Transporte", "Entregue"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, st)}
                        disabled={updatingOrderStatus}
                        className={`text-[11px] font-bold py-1.5 px-2 rounded-md transition-all border ${
                          selectedOrder.status === st 
                            ? "bg-blue-600 text-white border-blue-500" 
                            : "bg-slate-800 text-gray-300 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tracking Code Form */}
                <form 
                  onSubmit={(e) => handleUpdateTrackingCode(e, selectedOrder.orderId)}
                  className="space-y-1.5"
                >
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Adicionar Código de Rastreamento</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: BR123456789NL"
                      value={trackingCodeInput}
                      onChange={(e) => setTrackingCodeInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 text-white font-mono text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition-all"
                    >
                      Salvar
                    </button>
                  </div>
                </form>

                <div className="border-t border-slate-800 pt-3 space-y-3">
                  {/* Customer info */}
                  <div>
                    <h5 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Dados do Cliente
                    </h5>
                    <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg space-y-1">
                      <p className="font-semibold text-white">{selectedOrder.customer.name}</p>
                      <p className="text-gray-400">CPF: <span className="font-mono">{selectedOrder.customer.cpf}</span></p>
                      <p className="text-gray-400">Nascimento: {selectedOrder.customer.birthDate}</p>
                      <p className="text-gray-400">Email: {selectedOrder.customer.email}</p>
                      <p className="text-gray-400">Tel: {selectedOrder.customer.phone}</p>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div>
                    <h5 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" /> Endereço de Entrega
                    </h5>
                    <div className="text-xs bg-slate-900/60 p-2.5 rounded-lg space-y-1 text-gray-300">
                      <p className="font-medium text-white">{selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.number}</p>
                      <p>{selectedOrder.deliveryAddress.neighborhood} - {selectedOrder.deliveryAddress.complement || "Nenhum compl."}</p>
                      <p>{selectedOrder.deliveryAddress.city} - {selectedOrder.deliveryAddress.state}</p>
                      <p className="font-mono text-gray-400">CEP: {selectedOrder.deliveryAddress.zip}</p>
                    </div>
                  </div>

                  {/* Cart products */}
                  <div>
                    <h5 className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-400" /> Itens do Pedido
                    </h5>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg divide-y divide-slate-800 text-xs">
                      {selectedOrder.cart.map((item) => (
                        <div key={item.id} className="py-1.5 first:pt-0 last:pb-0 flex justify-between items-center">
                          <div className="truncate max-w-[150px] pr-2">
                            <p className="font-bold text-white truncate">{item.name}</p>
                            <p className="text-gray-500 text-[10px]">Qtd: {item.quantity}x</p>
                          </div>
                          <p className="font-extrabold text-blue-400 shrink-0">
                            R$ {(item.price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 flex justify-between text-sm font-black border-t border-slate-800">
                        <span className="text-white">TOTAL DO PEDIDO</span>
                        <span className="text-green-400">R$ {selectedOrder.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-800 mx-auto" />
                <p className="text-xs font-semibold max-w-[180px] mx-auto">Selecione um pedido no histórico ao lado para detalhar, faturar ou rastrear.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRUD MODAL: ADD / EDIT PRODUCT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl relative my-8">
            <h3 className="text-lg font-black text-white tracking-tight mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              {editingProduct ? `Editar Produto: ${editingProduct.name}` : "Adicionar Novo Produto ao Catálogo"}
            </h3>

            {/* INTEGRATED API AUTO-FILL & IMAGE SEARCH WIZARD */}
            <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" /> Assistente de Cadastro Automatizado
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductImportPanel(!showProductImportPanel);
                      setShowImgSearchPanel(false);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-black transition-all flex items-center gap-1 ${
                      showProductImportPanel
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 text-gray-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <Search className="w-3 h-3" /> Auto-Preencher
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImgSearchPanel(!showImgSearchPanel);
                      setShowProductImportPanel(false);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-black transition-all flex items-center gap-1 ${
                      showImgSearchPanel
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900 text-gray-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    <Image className="w-3 h-3" /> Buscar Imagens
                  </button>
                </div>
              </div>

              {/* PANEL 1: PRODUCT IMPORT (DUMMYJSON & FAKE STORE API) */}
              {showProductImportPanel && (
                <div className="pt-2 border-t border-slate-800/60 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-1 shrink-0 bg-slate-900 px-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-gray-400">Origem:</span>
                      <select
                        value={apiSource}
                        onChange={(e) => setApiSource(e.target.value as any)}
                        className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer py-1 text-[10px]"
                      >
                        <option value="dummyjson" className="bg-slate-900">DummyJSON (Catálogo Geral)</option>
                        <option value="fakestore" className="bg-slate-900">Fake Store API (Vestuário/Eletro)</option>
                        <option value="mercadolibre" className="bg-slate-900">Mercado Livre (Moeda: BRL)</option>
                      </select>
                    </div>
                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        value={apiSearchQuery}
                        onChange={(e) => setApiSearchQuery(e.target.value)}
                        placeholder="Pesquisar produto... (Ex: iphone, laptop, ring)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchApiProducts();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchApiProducts}
                        disabled={isSearchingApi}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-all"
                      >
                        {isSearchingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Pesquisar
                      </button>
                    </div>
                  </div>

                  {apiSearchError && (
                    <p className="text-[10px] text-amber-400 font-semibold">{apiSearchError}</p>
                  )}

                  {apiSearchResults.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {apiSearchResults.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-slate-900 border border-slate-800 p-2 rounded-lg flex gap-2 items-center hover:bg-slate-800/80 transition-all cursor-pointer group"
                          onClick={() => handleSelectApiProduct(prod)}
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-contain rounded bg-slate-950 p-1 shrink-0"
                          />
                          <div className="truncate flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-white truncate group-hover:text-blue-400 transition-colors">{prod.name}</h4>
                            <p className="text-[10px] text-gray-400 capitalize">{prod.brand} • {prod.category}</p>
                            <p className="text-[10px] text-green-400 font-black">R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                          </div>
                          <button
                            type="button"
                            className="bg-slate-850 group-hover:bg-blue-600 text-white px-2 py-1 rounded text-[9px] font-black tracking-tight transition-colors"
                          >
                            Usar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: IMAGE SEARCH (PEXELS, UNSPLASH, PIXABAY) */}
              {showImgSearchPanel && (
                <div className="pt-2 border-t border-slate-800/60 space-y-3">
                  <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                        <Settings className="w-3 h-3 text-gray-500" /> API Keys de Provedores de Fotos (Opcional - Salva Localmente)
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-gray-500 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-blue-500" /> Unsplash Client-ID
                        </label>
                        <input
                          type="password"
                          value={apiKeyUnsplash}
                          onChange={(e) => handleSaveApiKeyUnsplash(e.target.value)}
                          placeholder="Chave Unsplash..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-gray-500 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-green-500" /> Pexels API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeyPexels}
                          onChange={(e) => handleSaveApiKeyPexels(e.target.value)}
                          placeholder="Chave Pexels..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] text-gray-500 flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-500" /> Pixabay API Key
                        </label>
                        <input
                          type="password"
                          value={apiKeyPixabay}
                          onChange={(e) => handleSaveApiKeyPixabay(e.target.value)}
                          placeholder="Chave Pixabay..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-1 shrink-0 bg-slate-900 px-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-gray-400">Provedor:</span>
                      <select
                        value={imgSource}
                        onChange={(e) => setImgSource(e.target.value as any)}
                        className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer py-1 text-[10px]"
                      >
                        <option value="unsplash" className="bg-slate-900">Unsplash (Livre/Chave)</option>
                        <option value="pexels" className="bg-slate-900">Pexels (Chave Req.)</option>
                        <option value="pixabay" className="bg-slate-900">Pixabay (Chave Req.)</option>
                      </select>
                    </div>
                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        value={imgSearchQuery}
                        onChange={(e) => setImgSearchQuery(e.target.value)}
                        placeholder="Pesquisar foto... (Ex: notebook gamer, mouse pad)"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSearchImages();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSearchImages}
                        disabled={isSearchingImg}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 transition-all"
                      >
                        {isSearchingImg ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Buscar Fotos
                      </button>
                    </div>
                  </div>

                  {imgSearchError && (
                    <p className="text-[10px] text-amber-400 font-semibold">{imgSearchError}</p>
                  )}

                  {imgSearchResults.length > 0 && (
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <p className="text-[9px] text-gray-400 font-bold mb-1.5">Clique para adicionar à galeria do produto:</p>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {imgSearchResults.map((url, idx) => {
                          const isAlreadyAdded = formImages.includes(url);
                          return (
                            <div
                              key={idx}
                              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border hover:scale-105 transition-all ${
                                isAlreadyAdded ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-indigo-400"
                              }`}
                              onClick={() => handleAddImageFromSearch(url)}
                            >
                              <img
                                src={url}
                                alt={`Search result ${idx}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {isAlreadyAdded && (
                                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-blue-400 font-black" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: iPhone 15 Pro Max Titanium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none capitalize"
                  >
                    <option value="celulares">Celulares</option>
                    <option value="notebooks">Notebooks</option>
                    <option value="computadores">Computadores (Desktops)</option>
                    <option value="tablets">Tablets</option>
                    <option value="monitores">Monitores</option>
                    <option value="impressoras">Impressoras</option>
                    <option value="tvs">Smart TVs</option>
                    <option value="smartwatches">Smartwatches</option>
                    <option value="fones">Áudio / Fones</option>
                    <option value="perifericos">Periféricos</option>
                    <option value="pecas">Peças</option>
                    <option value="gamer">Gamer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Marca *</label>
                  <input
                    type="text"
                    required
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: Apple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 15 Pro Max 256GB"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 8999.00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Preço de Tabela / Original (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 9999.00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Estoque Inicial (Qtd) *</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 block font-bold">Garantia</label>
                  <input
                    type="text"
                    value={formWarranty}
                    onChange={(e) => setFormWarranty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ex: 1 Ano de Garantia Nacional"
                  />
                </div>
              </div>

              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-gray-400 font-bold block">Galeria de Imagens do Produto</label>
                    <span className="text-[10px] text-blue-400 font-semibold">Sem limite de fotos! ({formImages.length} adicionadas)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImgSearchPanel(!showImgSearchPanel);
                      setShowProductImportPanel(false);
                      if (!imgSearchQuery && formName) {
                        setImgSearchQuery(formName);
                      }
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold flex items-center gap-1 transition-colors bg-indigo-950/40 border border-indigo-800/50 px-2 py-1 rounded"
                  >
                    <Image className="w-3 h-3" /> Buscar foto nas APIs
                  </button>
                </div>

                {/* Upload inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Manual Gallery Upload box */}
                  <div className="relative border border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-900/10 hover:bg-slate-900/30 rounded-lg p-2.5 transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer group h-[75px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Escolha uma foto da galeria"
                    />
                    <Upload className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-300 group-hover:text-white">Carregar do Dispositivo</p>
                      <p className="text-[9px] text-gray-500">Selecione fotos da galeria (Sem limites!)</p>
                    </div>
                  </div>

                  {/* URL Input */}
                  <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between h-[75px]">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Adicionar por Link URL</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 text-white rounded px-2.5 py-1 text-[10px] focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono"
                        placeholder="https://exemplo.com/foto.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (galleryUrlInput.trim()) {
                            setFormImages(prev => {
                              if (prev.includes(galleryUrlInput.trim())) return prev;
                              return [...prev, galleryUrlInput.trim()];
                            });
                            if (!formImageUrl || formImageUrl.startsWith("https://images.unsplash.com/photo-1546054454-aa26e2b734c7")) {
                              setFormImageUrl(galleryUrlInput.trim());
                            }
                            setGalleryUrlInput("");
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded text-[10px] shrink-0 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gallery List (Grid) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold block">Fotos no produto (clique no Ícone de Estrela para escolher a Principal):</span>
                  {formImages.length === 0 ? (
                    <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg bg-slate-900/20 text-slate-500 text-[10px]">
                      Nenhuma imagem na galeria ainda. Carregue ou busque fotos acima.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {formImages.map((img, idx) => {
                        const isMain = formImageUrl === img || (idx === 0 && !formImageUrl);
                        return (
                          <div 
                            key={idx} 
                            className={`group relative aspect-square rounded-lg border overflow-hidden transition-all duration-200 bg-slate-950 ${
                              isMain ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-800 hover:border-slate-700 bg-slate-900/30"
                            }`}
                          >
                            <img 
                              src={img} 
                              alt={`Produto ${idx + 1}`} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Star Badge for Main Image */}
                            {isMain ? (
                              <div className="absolute top-1 left-1 bg-blue-600 text-[8px] font-black uppercase text-white px-1 py-0.5 rounded shadow">
                                Principal
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setFormImageUrl(img)}
                                className="absolute top-1 left-1 bg-black/75 text-gray-300 hover:text-yellow-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Definir como foto principal"
                              >
                                <Star className="w-3 h-3 fill-current text-yellow-500" />
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setFormImages(prev => {
                                  const updated = prev.filter(item => item !== img);
                                  if (isMain) {
                                    setFormImageUrl(updated[0] || "");
                                  }
                                  return updated;
                                });
                              }}
                              className="absolute top-1 right-1 bg-black/75 text-gray-400 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Excluir imagem"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[8px] text-gray-300 text-center py-0.5 font-mono">
                              #{idx + 1}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">Especificações Técnicas (Uma por linha)</label>
                <textarea
                  rows={3}
                  value={formSpecs}
                  onChange={(e) => setFormSpecs(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Tela Retina OLED de 6.7 polegadas&#10;Processador Apple A17 Pro&#10;Câmera tripla de 48MP"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block font-bold">Descrição Completa</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Escreva detalhes comerciais do produto..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-gray-300 font-bold rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-lg transition-all"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
