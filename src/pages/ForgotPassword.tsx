import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await API.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-center mb-4 text-blue-400">
          <KeyRound size={40} />
        </div>
        <h2 className="text-xl font-bold text-center text-white mb-2">Recuperar Contraseña</h2>
        <p className="text-slate-400 text-xs text-center mb-6">
          Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu cuenta.
        </p>

        {error && <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-lg text-xs mb-4 text-center">{error}</div>}

        {message ? (
          <div className="space-y-4">
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle size={18} /> {message}
            </div>

            {resetUrl && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-400 mb-1">Enlace de simulación generado:</p>
                <a href={resetUrl} className="text-xs text-blue-400 underline break-all">
                  {resetUrl}
                </a>
              </div>
            )}

            <Link to="/login" className="block text-center text-xs text-slate-400 hover:text-white mt-4">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? 'Generando...' : 'Enviar Enlace'}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white mt-4">
              <ArrowLeft size={14} /> Volver a Iniciar Sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
