
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import {
  Plus,
  Trash2,
  Upload,
  Package,
  LogOut,
  Tag,
  RefreshCw,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Calendar,
  Filter,
  Radio,
  History
} from 'lucide-react';

interface Product {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  stock?: number;
  category?: { id: string; name: string };
  imageUrl?: string;
  highlight?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName?: string;
  phone?: string;
  customerPhone?: string;
  shippingAddress?: string;
  address?: string;
  customerAddress?: string;
  user?: { fullName?: string; email?: string; phone?: string; address?: string };
  items: { id: string; quantity: number; price: number; size?: string; product: { title: string } }[];
}

const HIGHLIGHT_OPTIONS = [
  'NINGUNA',
  'NEW',
  'BUZOS',
  'DEUS',
  'YOURSELF',
  'TONY MONTANA',
  'SHARP'
];

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'TODAY', label: 'Pedidos de Hoy' },
  { key: 'PREVIOUS_DAYS', label: 'Días Anteriores' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'PAID', label: 'Pagados' },
  { key: 'SHIPPED', label: 'Enviados' },
  { key: 'DELIVERED', label: 'Entregados' },
  { key: 'CANCELLED', label: 'Cancelados' },
];

const compressImageToBase64 = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el lienzo de compresión.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const [now, setNow] = useState<Date>(() => new Date());
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [newCategoryName, setNewCategoryName] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [highlight, setHighlight] = useState('NINGUNA');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [prodRes, catRes, ordRes] = await Promise.all([
        API.get('/products'),
        API.get('/products/categories'),
        API.get('/orders/admin')
      ]);

      setProducts(prodRes.data.products || prodRes.data || []);
      setCategories(catRes.data || []);
      setOrders(ordRes.data || []);

      setCategoryId((prev) => {
        if (prev) return prev;
        return catRes.data?.length > 0 ? catRes.data[0].id : '';
      });
    } catch (err) {
      console.error('Error cargando datos del admin:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);

    const syncInterval = setInterval(() => {
      setNow(new Date());
      fetchData(false);
    }, 30000);

    const handleVisibilityOrFocus = () => {
      setNow(new Date());
      fetchData(false);
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [fetchData]);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(clockInterval);
  }, []);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const isOrderToday = (dateString: string, referenceDate: Date) => {
    const orderDate = new Date(dateString);
    if (Number.isNaN(orderDate.getTime())) return false;
    return startOfDay(orderDate) === startOfDay(referenceDate);
  };

  const isOrderPreviousDay = (dateString: string, referenceDate: Date) => {
    const orderDate = new Date(dateString);
    if (Number.isNaN(orderDate.getTime())) return false;
    return startOfDay(orderDate) < startOfDay(referenceDate);
  };

  const matchesSpecificDate = (dateString: string, yyyyMmDd: string) => {
    if (!yyyyMmDd) return true;
    const orderDate = new Date(dateString);
    if (Number.isNaN(orderDate.getTime())) return false;
    const [year, month, day] = yyyyMmDd.split('-').map(Number);
    return (
      orderDate.getFullYear() === year &&
      orderDate.getMonth() + 1 === month &&
      orderDate.getDate() === day
    );
  };

  const todayOrdersCount = orders.filter((o) => isOrderToday(o.createdAt, now)).length;
  const previousDaysOrdersCount = orders.filter((o) => isOrderPreviousDay(o.createdAt, now)).length;

  const filteredOrders = orders.filter((order) => {
    if (selectedDate) {
      return matchesSpecificDate(order.createdAt, selectedDate);
    }
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'TODAY') return isOrderToday(order.createdAt, now);
    if (orderFilter === 'PREVIOUS_DAYS') return isOrderPreviousDay(order.createdAt, now);
    return order.status === orderFilter;
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setCompressing(true);
    try {
      const compressed = await compressImageToBase64(file, 800, 0.7);
      setImageBase64(compressed);
    } catch (err) {
      console.error('Error al comprimir imagen:', err);
      alert('No se pudo procesar la imagen seleccionada.');
    } finally {
      setCompressing(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await API.post('/products/categories', { name: newCategoryName.trim().toUpperCase() });
      setCategories([...categories, res.data]);
      setCategoryId(res.data.id);
      setNewCategoryName('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear categoría');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta línea/categoría?')) return;
    try {
      await API.delete('/products/categories/' + catId);
      setCategories(categories.filter((c) => c.id !== catId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar categoría');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !imageBase64 || !categoryId) {
      alert('Por favor completa el título, precio, categoría y selecciona una imagen.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await API.post('/products', {
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock) || 10,
        imageUrl: imageBase64,
        categoryId,
        highlight: highlight === 'NINGUNA' ? null : highlight
      });

      const created = res.data.product || res.data;
      if (created && created.id) {
        setProducts((prev) => [created, ...prev]);
      } else {
        await fetchData(false);
      }

      setTitle('');
      setDescription('');
      setPrice('');
      setStock('');
      setHighlight('NINGUNA');
      setImageBase64('');
      setFileName('');
      alert('¡Prenda publicada con éxito!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al publicar prenda');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (!confirm('¿Eliminar esta prenda del catálogo?')) return;
    try {
      await API.delete('/products/' + id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert('No se pudo eliminar el producto.');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await API.patch('/orders/admin/' + orderId + '/status', { status });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert('Error al actualizar estado del pedido.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + Number(o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-[0.25em] mb-1">
              <ShieldCheck size={15} /> ONLY BLACK • STUDIO ADMIN
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Gestión de Catálogo y Pedidos
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider">
              <Radio size={13} className="animate-pulse" /> Tiempo Real
            </span>
            <button
              onClick={() => fetchData(true)}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition text-zinc-300"
            >
              <RefreshCw size={14} /> Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider transition text-red-400"
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Ingresos Totales</p>
              <p className="text-3xl font-black text-white mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Pedidos de Hoy</p>
              <p className="text-3xl font-black text-amber-400 mt-1">{todayOrdersCount}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {now.toLocaleDateString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calendar size={22} />
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Días Anteriores</p>
              <p className="text-3xl font-black text-white mt-1">{previousDaysOrdersCount}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Histórico de días pasados
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-zinc-700 flex items-center justify-center text-white">
              <History size={22} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <Tag size={15} className="text-amber-400" /> Líneas / Categorías
              </h2>
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: OVERSIZED, BUZOS..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
                <button
                  type="submit"
                  className="bg-white hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition"
                >
                  Crear
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-2 bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                  >
                    {cat.name}
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-zinc-500 hover:text-red-400 transition"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-white mb-6 flex items-center gap-2">
                <Plus size={16} className="text-amber-400" /> Publicar Nueva Prenda
              </h2>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Nombre de la Prenda
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Camiseta Oversized Deus 250g"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Algodón Peruano reactivo 250g..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="50000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Stock (Uds)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Categoría General
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                    <Sparkles size={13} /> Líneas Destacadas (Círculo Superior)
                  </label>
                  <select
                    value={highlight}
                    onChange={(e) => setHighlight(e.target.value)}
                    className="w-full bg-zinc-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  >
                    {HIGHLIGHT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Imagen de la Prenda (Se comprime automáticamente)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-zinc-800 hover:border-amber-400 rounded-xl p-4 cursor-pointer bg-zinc-950 transition">
                    <Upload size={20} className="text-zinc-500 mb-1" />
                    <span className="text-xs text-zinc-300 font-medium text-center">
                      {compressing
                        ? 'Comprimiendo imagen...'
                        : fileName
                        ? `${fileName} (optimizada)`
                        : 'Haz clic para seleccionar archivo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imageBase64 && (
                    <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-700">
                      <img src={imageBase64} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting || compressing}
                  className="w-full bg-white hover:bg-amber-400 text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <Plus size={16} /> {submitting ? 'Publicando...' : 'Publicar Prenda'}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                  <Package size={16} className="text-amber-400" /> Pedidos ({filteredOrders.length})
                </h2>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Filter size={12} className="text-amber-400" /> Sincronización automática activa
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-zinc-950/80 border border-zinc-800 p-3 rounded-xl">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-400" /> Buscar por fecha:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) setOrderFilter('ALL');
                  }}
                  className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                />
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate('')}
                    className="text-[11px] text-amber-400 hover:text-white font-bold uppercase underline ml-1"
                  >
                    Limpiar fecha
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pb-2 border-b border-zinc-800/80">
                {STATUS_FILTERS.map((f) => {
                  const active = !selectedDate && orderFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        setSelectedDate('');
                        setOrderFilter(f.key);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                        active
                          ? 'bg-amber-400 text-black'
                          : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {f.label}
                      {f.key === 'TODAY' ? ` (${todayOrdersCount})` : ''}
                      {f.key === 'PREVIOUS_DAYS' ? ` (${previousDaysOrdersCount})` : ''}
                    </button>
                  );
                })}
              </div>

              {filteredOrders.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">
                  No hay pedidos que coincidan con este filtro.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const clientName = order.customerName || order.user?.fullName || 'Cliente';
                    const clientEmail = order.user?.email;
                    const clientPhone = order.phone || order.customerPhone || order.user?.phone || 'No registrado';
                    const clientAddress =
                      order.shippingAddress ||
                      order.address ||
                      order.customerAddress ||
                      order.user?.address ||
                      'No registrada';

                    return (
                      <div
                        key={order.id}
                        className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div>
                            <p className="text-xs font-black text-white uppercase">
                              Orden #{order.id.slice(0, 8)} • {clientName}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Fecha: {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg p-3 space-y-1 text-[11px] text-zinc-300">
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                              Datos del Cliente y Envío
                            </p>
                            <p>
                              <span className="text-zinc-500 font-semibold">Cliente:</span> {clientName}
                              {clientEmail ? <span className="text-zinc-500"> ({clientEmail})</span> : null}
                            </p>
                            <p>
                              <span className="text-zinc-500 font-semibold">Teléfono:</span> {clientPhone}
                            </p>
                            <p>
                              <span className="text-zinc-500 font-semibold">Dirección de envío:</span> {clientAddress}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                              Prendas Seleccionadas
                            </p>
                            <div className="space-y-1">
                              {order.items?.map((i: any) => (
                                <p key={i.id} className="text-[11px] text-zinc-300 flex items-center gap-2">
                                  <span>• {i.product?.title || 'Prenda'}</span>
                                  <span className="bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase px-1.5 py-0.5 rounded">
                                    Talla: {i.size || 'L'}
                                  </span>
                                  <span className="text-zinc-500">(x{i.quantity})</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-zinc-400 pt-1">
                            Total: <span className="text-amber-400 font-black">${Number(order.totalAmount).toFixed(2)}</span>
                          </p>
                        </div>

                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 text-white text-xs font-bold uppercase rounded-lg px-3 py-2 focus:outline-none focus:border-amber-400"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="PAID">Pagado</option>
                          <option value="SHIPPED">Enviado</option>
                          <option value="DELIVERED">Entregado</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                <Package size={16} className="text-amber-400" /> Prendas en Catálogo ({products.length})
              </h2>

              {loading ? (
                <p className="text-xs text-zinc-500 py-6 text-center">Cargando catálogo...</p>
              ) : products.length === 0 ? (
                <p className="text-xs text-zinc-500 py-6 text-center">No hay prendas en el catálogo.</p>
              ) : (
                <div className="space-y-3">
                  {products.map((prod: any) => (
                    <div
                      key={prod.id}
                      className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-12 h-14 object-cover rounded-lg bg-zinc-900 border border-zinc-800"
                          onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600';
                          }}
                        />
                        <div>
                          <div className="flex gap-2 items-center">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                              {prod.category?.name || 'General'}
                            </span>
                            {prod.highlight && (
                              <span className="text-[10px] text-amber-400 uppercase font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                                ⭐ {prod.highlight}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-xs mt-1 uppercase">{prod.title}</h4>
                          <p className="text-xs text-amber-400 font-bold mt-0.5">
                            ${Number(prod.price).toFixed(2)} · Stock: {prod.stock} uds
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-zinc-500 hover:text-red-400 p-2 transition"
                        title="Borrar prenda"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
