import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import API from '../api';
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WHATSAPP_NUMBER = '573043375279';
const DISPLAY_PHONE = '304 337 5279';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);

  const savedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const [customerName, setCustomerName] = useState<string>(savedUser?.fullName || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleProceedPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!customerName.trim() || !address.trim() || !phone.trim()) {
      alert('Por favor ingresa tu nombre, dirección de envío y número de teléfono.');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const totalSnapshot = getTotalPrice();

      const res = await API.post('/orders/checkout', {
        items,
        customerName: customerName.trim(),
        shippingAddress: address.trim(),
        phone: phone.trim(),
      });

      const resolvedOrderId =
        res.data?.order?.id ||
        res.data?.orderId ||
        'ORDEN';

      const resolvedTotal = Number(res.data?.order?.totalAmount ?? totalSnapshot);

      setOrderComplete({
        orderId: resolvedOrderId,
        total: resolvedTotal,
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      clearCart();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    const orderCode = String(orderComplete.orderId).slice(0, 8).toUpperCase();
    const whatsappMessage = encodeURIComponent(
      `Hola ONLY BLACK, acabo de realizar el pedido #${orderCode}.\n` +
      `Nombre: ${orderComplete.customerName}\n` +
      `Teléfono: ${orderComplete.phone}\n` +
      `Dirección: ${orderComplete.address}\n` +
      `Total: $${Number(orderComplete.total).toFixed(2)}\n\n` +
      `Envío mi soporte de pago y solicito información de canales de pago.`
    );

    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center space-y-6 shadow-2xl">
          <CheckCircle2 size={64} className="mx-auto text-amber-400" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Pedido realizado con éxito
          </h2>
          <p className="text-zinc-400 text-xs">
            Tu orden <span className="text-amber-400 font-mono font-bold">#{orderCode}</span> ha sido registrada para revisión y ya aparece en el panel del administrador.
          </p>

          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-left space-y-1.5 text-xs text-zinc-300">
            <p><strong className="text-white uppercase">Nombre:</strong> {orderComplete.customerName}</p>
            <p><strong className="text-white uppercase">Teléfono:</strong> {orderComplete.phone}</p>
            <p><strong className="text-white uppercase">Dirección:</strong> {orderComplete.address}</p>
            <p className="pt-1 border-t border-zinc-800/80">
              <strong className="text-white uppercase">Total:</strong>{' '}
              <span className="text-amber-400 font-bold">${Number(orderComplete.total).toFixed(2)}</span>
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-xl text-left space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" /> Soporte de Pago y Canales de Pago:
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Envía tu <span className="text-white font-bold">soporte de pago</span> o consulta los canales de pago disponibles al número{' '}
              <span className="font-mono font-bold text-amber-400">{DISPLAY_PHONE}</span>.
            </p>
            <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="font-mono font-bold text-amber-400 text-sm">📱 {DISPLAY_PHONE}</span>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition text-center"
              >
                Enviar soporte de pago
              </a>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-2">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="bg-white hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition"
            >
              Ver Mis Pedidos
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-zinc-900/80 border border-zinc-800 p-12 rounded-2xl">
          <ShoppingBag size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">Tu bolsa está vacía</h2>
          <p className="text-zinc-400 text-xs mb-6">Explora nuestra colección urbana y añade prendas a tu carrito.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-white hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition inline-flex items-center gap-2"
          >
            Ver Catálogo <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-8">Bolsa de Compras</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-xl border border-zinc-800"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600';
                }}
              />
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-amber-400 font-bold text-xs mt-1">${Number(item.price).toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white text-xs font-semibold px-2">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="text-zinc-400 hover:text-white p-1"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="text-zinc-500 hover:text-red-400 p-2 transition"
                title="Eliminar prenda"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl h-fit space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-zinc-800 pb-3">
            Resumen de Orden
          </h3>

          <form onSubmit={handleProceedPayment} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="Tu nombre y apellido"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Dirección de Envío
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Calle 45 #12-34, Apt 201"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                Número de Teléfono
              </label>
              <input
                type="tel"
                required
                placeholder="Ej: 3001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
              />
            </div>

            <div className="pt-2 space-y-2 border-t border-zinc-800 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-bold">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Soporte / Canales de pago</span>
                <span className="text-zinc-300 font-bold">{DISPLAY_PHONE}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-black text-white">
                <span>Total</span>
                <span className="text-amber-400">${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-amber-400 text-black font-black uppercase text-xs tracking-wider py-3.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? 'Procesando...' : 'Proceder con el pago'} <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
