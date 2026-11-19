import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, User, ShieldCheck, Package, Flame } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export const Navbar = () => {
  const { cart, clearCart } = useCartStore();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'ADMIN';

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    clearCart();
    localStorage.clear();
    navigate('/login');
  };

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md text-white sticky top-0 z-50 border-b border-zinc-800/80">
      <div className="bg-zinc-900 text-zinc-300 text-[11px] py-1.5 px-4 text-center tracking-widest uppercase font-medium border-b border-zinc-800/60 flex items-center justify-center gap-2">
        <Flame size={12} className="text-amber-400" />
        <span>"El Color Negro No Mancha" | Algodon Peruano 200g - 350g | Oversized & Regular</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-full bg-white text-black font-black text-xs flex items-center justify-center tracking-tighter border-2 border-zinc-700 group-hover:border-amber-400 transition">
            OB
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-[0.2em] text-white leading-none">
              ONLY BLACK
            </span>
            <span className="text-[9px] tracking-[0.35em] text-zinc-500 uppercase mt-1">
              Streetwear Studio
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-zinc-300 hover:text-white text-xs uppercase tracking-wider font-semibold transition">
            Coleccion
          </Link>

          {user && !isAdmin && (
            <Link to="/orders" className="text-zinc-300 hover:text-white text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition">
              <Package size={15} className="text-zinc-400" /> Mis Pedidos
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className="text-amber-400 hover:text-amber-300 text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition">
              <ShieldCheck size={15} /> Studio Admin
            </Link>
          )}

          {!isAdmin && (
            <Link to="/cart" className="relative text-zinc-200 hover:text-amber-400 transition p-1">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-white text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
              <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                <User size={14} className="text-zinc-500" /> {user.fullName}
              </span>
              <button onClick={handleLogout} title="Cerrar Sesion" className="text-zinc-500 hover:text-red-500 transition">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-white hover:bg-zinc-200 text-black text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-md transition">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
