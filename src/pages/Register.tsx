
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/register', { fullName, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-black font-black text-sm tracking-tighter border-2 border-zinc-700 mb-3">
            OB
          </div>
          <span className="block text-[10px] uppercase tracking-[0.3em] text-amber-400 font-bold mb-1">
            ONLY BLACK • STREETWEAR STUDIO
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Crear Cuenta</h1>
          <p className="text-xs text-zinc-400 mt-1">Regístrate para comprar en ONLY BLACK</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="bg-red-950/60 border border-red-800/70 text-red-400 p-3.5 rounded-xl text-xs font-medium mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre y apellido"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-zinc-500" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-amber-400 text-black font-black uppercase tracking-wider py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs disabled:opacity-50 mt-2"
            >
              {loading ? 'Creando cuenta...' : (
                <>
                  Registrarse <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800/80 text-center">
            <p className="text-xs text-zinc-400">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-amber-400 font-bold hover:text-amber-300 transition">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center flex items-center justify-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck size={14} className="text-amber-400" /> Registro seguro • ONLY BLACK
        </div>
      </div>
    </div>
  );
};
