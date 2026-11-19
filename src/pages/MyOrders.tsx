import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Package, Clock, CheckCircle, Truck, ArrowRight, ShieldCheck } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    title: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <CheckCircle size={12} /> Pagado
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Truck size={12} /> Enviado
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} /> Entregado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Clock size={12} /> Pendiente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center text-zinc-500 text-xs uppercase tracking-widest font-bold">
        Cargando tus pedidos...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Mis Pedidos</h1>
          <p className="text-xs text-zinc-400 mt-1">Historial de drops adquiridos y estado de despacho.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition inline-flex items-center gap-2"
        >
          ColecciÃ³n <ArrowRight size={14} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 p-12 rounded-3xl text-center backdrop-blur-md">
          <Package size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">No tienes compras registradas</h3>
          <p className="text-xs text-zinc-400 mb-6">Cuando realices un pedido mediante Stripe, aparecerÃ¡ reflejado aquÃ­.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition"
          >
            Explorar CatÃ¡logo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4 transition hover:border-zinc-700"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Orden #{order.id}</span>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Fecha: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-amber-400">${order.totalAmount.toFixed(2)} USD</span>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
                    <img 
                      src={item.product?.imageUrl} 
                      alt={item.product?.title} 
                      className="w-12 h-14 object-cover rounded-lg bg-zinc-900 border border-zinc-800"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-white text-xs truncate uppercase">{item.product?.title}</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Cantidad: <span className="text-white font-bold">{item.quantity}</span> Â· ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
