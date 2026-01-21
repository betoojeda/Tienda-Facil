import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Store, UserPlus, LogIn, KeyRound, Mail, ChefHat, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import * as storage from '../services/storageService';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack?: () => void; // Optional back function
  initialView?: 'LOGIN' | 'REGISTER' | 'RECOVER';
}

type AuthView = 'LOGIN' | 'REGISTER' | 'RECOVER';

const Login: React.FC<LoginProps> = ({ onLogin, onBack, initialView = 'LOGIN' }) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sync if prop changes
  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration additional fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState<'restaurant' | 'retail'>('retail');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setError('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setBusinessType('retail');
  };

  const handleSwitchView = (view: AuthView) => {
    resetForm();
    setCurrentView(view);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // --- RECOVERY LOGIC ---
      if (currentView === 'RECOVER') {
        if (!username || !email) {
          setError('Ingresa usuario y correo.');
          setIsLoading(false);
          return;
        }

        if (username === 'admin' && email === 'betoojeda2008@gmail.com') {
          setSuccessMsg('Correo de recuperación enviado. (Simulado: Tu clave es admin2026*)');
        } else {
          // Verify against async storage
          const users = await storage.getUsers();
          const userExists = users.find(u => u.username === username);
          
          if (userExists && email.includes('@')) {
            setSuccessMsg(`Si los datos coinciden, hemos enviado instrucciones a ${email}`);
          } else {
            setError('Usuario o correo no coinciden.');
          }
        }
        setIsLoading(false);
        return;
      }

      // --- REGISTER LOGIC ---
      if (currentView === 'REGISTER') {
        if (!username || !password || !firstName || !lastName || !email) {
          setError('Por favor completa todos los campos.');
          setIsLoading(false);
          return;
        }

        const newUser = await storage.registerUser({
          username, 
          password,
          firstName,
          lastName,
          email,
          businessType
        });

        if (newUser) {
          onLogin(newUser);
        } else {
          setError('El usuario ya existe. Intenta otro nombre de usuario.');
        }
        setIsLoading(false);
        return;
      }

      // --- LOGIN LOGIC ---
      if (!username || !password) {
        setError('Por favor completa todos los campos');
        setIsLoading(false);
        return;
      }
      
      // Verificación robusta de errores
      const users = await storage.getUsers();
      const userAccount = users.find(u => u.username === username);

      if (!userAccount) {
        setError('El usuario ingresado no existe. Verifica el nombre o regístrate.');
        setIsLoading(false);
        return;
      }

      if (userAccount.password !== password) {
        setError('La contraseña es incorrecta. Inténtalo de nuevo.');
        setIsLoading(false);
        return;
      }

      // Login exitoso
      onLogin(userAccount);

    } catch (err) {
      setError("Error de conexión con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 text-center bg-indigo-50 border-b border-indigo-100 flex-shrink-0 relative">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute left-4 top-4 p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all"
              title="Volver al Inicio"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="inline-flex p-3 bg-white rounded-full shadow-md mb-4">
            <Store size={40} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Tienda-Facil</h1>
          <p className="text-slate-500 mt-2">
            {currentView === 'REGISTER' && 'Crea tu cuenta para comenzar'}
            {currentView === 'LOGIN' && 'Bienvenido de nuevo'}
            {currentView === 'RECOVER' && 'Recuperar Contraseña'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Registration Extra Fields */}
          {currentView === 'REGISTER' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Nombre</label>
                   <input
                     type="text"
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                     className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="Juan"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Apellido</label>
                   <input
                     type="text"
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                     className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="Pérez"
                   />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-700">Tipo de Negocio</label>
                 <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBusinessType('restaurant')}
                      className={`flex flex-col items-center p-3 border rounded-xl transition-all ${businessType === 'restaurant' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <ChefHat size={24} className="mb-1" />
                      <span className="text-xs font-bold">Restaurante</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusinessType('retail')}
                      className={`flex flex-col items-center p-3 border rounded-xl transition-all ${businessType === 'retail' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      <ShoppingBag size={24} className="mb-1" />
                      <span className="text-xs font-bold">Tienda</span>
                    </button>
                 </div>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Nombre de usuario"
            />
          </div>

          {(currentView === 'REGISTER' || currentView === 'RECOVER') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
          )}

          {currentView !== 'RECOVER' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">Contraseña</label>
                {currentView === 'LOGIN' && (
                  <button 
                    type="button" 
                    onClick={() => handleSwitchView('RECOVER')}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded border border-red-100 animate-pulse">{error}</p>}
          {successMsg && <p className="text-green-600 text-sm text-center bg-green-50 py-2 rounded border border-green-100">{successMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading ? (
               <Loader2 className="animate-spin" />
            ) : (
              <>
                {currentView === 'REGISTER' && (
                  <><span>Crear Cuenta</span><UserPlus size={20} /></>
                )}
                {currentView === 'LOGIN' && (
                  <><span>Ingresar</span><LogIn size={20} /></>
                )}
                {currentView === 'RECOVER' && (
                  <><span>Enviar Correo</span><KeyRound size={20} /></>
                )}
              </>
            )}
          </button>
          
          <div className="text-center pt-2 space-y-2">
             {currentView === 'RECOVER' ? (
                <button 
                  type="button"
                  onClick={() => handleSwitchView('LOGIN')}
                  className="text-slate-500 font-medium hover:text-slate-700 text-sm"
                >
                  Volver al inicio de sesión
                </button>
             ) : (
               <button 
                type="button"
                onClick={() => handleSwitchView(currentView === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                className="text-indigo-600 font-medium hover:underline text-sm"
              >
                {currentView === 'LOGIN' 
                  ? '¿No tienes cuenta? Regístrate gratis' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </button>
             )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;