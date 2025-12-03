import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '../components/Button';
import { Bike, ShieldCheck, AlertCircle, Copy, Check, Settings, ExternalLink } from 'lucide-react';

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentDomain = window.location.hostname || window.location.host;

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Login error details:", err);
      const msg = err.message || err.toString();
      setError(msg);
      
      // Auto-expand debug info if it's a domain error
      if (msg.includes('unauthorized-domain') || msg.includes('unauthorized domain')) {
        setShowDebug(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDomainError = error && (error.includes('unauthorized-domain') || error.includes('unauthorized domain'));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-8">
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-5 rounded-2xl shadow-lg shadow-indigo-200">
            <Bike size={48} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">MotoTracker</h1>
            <p className="text-slate-500 mt-2">Tu historial de mantenimiento, seguro en la nube.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Normal State Info */}
          {!error && !showDebug && (
            <div className="bg-indigo-50 p-4 rounded-xl flex items-start gap-3 text-left">
                <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-indigo-800 font-medium">
                Sus datos se guardan en línea. Acceda desde cualquier dispositivo iniciando sesión.
                </p>
            </div>
          )}

          {/* Special Domain Error UI */}
          {isDomainError ? (
             <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl text-left space-y-3 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-bold text-amber-900 flex items-center gap-2 text-sm">
                    <AlertCircle size={18} />
                    Acción Requerida (Seguridad)
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                   Google ha bloqueado el inicio de sesión porque este dominio web no está en tu lista blanca.
                </p>
                
                <div className="bg-white p-2 rounded border border-amber-200 flex items-center gap-2">
                    <code className="text-xs font-mono text-slate-600 flex-1 truncate">{currentDomain}</code>
                    <button 
                        onClick={copyDomain}
                        className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded hover:bg-amber-200 transition-colors flex items-center gap-1"
                    >
                        {copied ? <Check size={12}/> : <Copy size={12}/>}
                        {copied ? 'Listo' : 'Copiar'}
                    </button>
                </div>

                <div className="pt-2 border-t border-amber-200/50">
                    <p className="text-[10px] font-bold text-amber-900 mb-1">Pasos para arreglarlo:</p>
                    <ol className="list-decimal list-inside text-[10px] text-amber-800 space-y-1">
                        <li>Ve a <b>Firebase Console</b> (botón abajo).</li>
                        <li>Entra a <b>Authentication</b> &gt; <b>Settings</b>.</li>
                        <li>Baja a <b>Authorized domains</b>.</li>
                        <li>Pega el dominio de arriba y dale a "Add".</li>
                    </ol>
                </div>

                <a 
                    href="https://console.firebase.google.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-amber-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-amber-700 transition-colors"
                >
                    Ir a Firebase Console <ExternalLink size={12} />
                </a>
             </div>
          ) : error && (
            // Generic Error
             <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 text-left border border-red-100 animate-in fade-in">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                <p className="text-xs text-red-700 font-medium break-words">{error}</p>
             </div>
          )}

          {!isDomainError && (
            <Button 
                onClick={handleLogin} 
                disabled={loading}
                fullWidth
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-slate-300"
            >
                {loading ? 'Conectando...' : 'Iniciar con Google'}
            </Button>
          )}
        </div>

        {/* Footer Help */}
        {!isDomainError && (
            <div className="pt-4 border-t border-slate-100">
                <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto transition-colors"
                >
                    <Settings size={12} />
                    {showDebug ? 'Ocultar detalles técnicos' : '¿Problemas para entrar?'}
                </button>

                {showDebug && !isDomainError && (
                    <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-2 animate-in fade-in text-[10px] text-slate-500">
                        <p>Dominio actual detectado:</p>
                        <code className="block bg-white p-1.5 rounded border border-slate-200 font-mono text-indigo-600 break-all select-all">
                            {currentDomain}
                        </code>
                        <p>Si recibes un error de "unauthorized domain", asegúrate de agregar esta dirección en la consola de Firebase.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
