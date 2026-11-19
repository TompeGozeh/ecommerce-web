import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-zinc-950">
      <div className="bg-zinc-900/90 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-white text-black font-black text-base flex items-center justify-center border-2 border-zinc-700">
            OB
          </div>
        </div>
        <h2 className="text-2xl font-black text-center text-white tracking-[0.18em] uppercase mb-1">
          ONLY BLACK
        </h2>
        <p className="text-zinc-400 text-xs text-center mb-6">
          Ingresa a tu cuenta para gestionar tus pedidos
        </p>

        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 p-3 rounded-xl text-xs mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Correo Electronico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white transition"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                Contrasena
              </label>
              <Link to="/forgot-password" className="text-xs text-amber-400 hover:underline">
                Olvidaste tu contrasena?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-white transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-amber-400 text-black font-black uppercase tracking-wider py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'} <ArrowRight size={15} />
          </button>
        </form>

        <p className="text-xs text-center text-zinc-400 mt-6">
          Nuevo en ONLY BLACK?{' '}
          <Link to="/register" className="text-white font-bold hover:underline">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
};