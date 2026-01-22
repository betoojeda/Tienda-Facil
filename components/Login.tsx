import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Store, UserPlus, LogIn, KeyRound, Mail, ChefHat, ShoppingBag, Loader2, ArrowLeft, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
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
  
  // Error & Status State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Security Simulation State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

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

    // --- SECURITY CHECK (Account Lockout) ---
    if (isLocked) {
      setError(`Demasiados intentos. Por favor espera ${lockTimer} segundos.`);
      return;
    }

    setIsLoading(true);

    try {
      // ===========================
      // RECOVERY LOGIC
      // ===========================
      if (currentView === 'RECOVER') {
        if (!username || !email) {
          setError('Para recuperar tu cuenta, necesitamos tu usuario y correo.');
          setIsLoading(false);
          return;
        }

        if (username === 'admin' && email === 'betoojeda2008@gmail.com') {
          setSuccessMsg('¡Listo! Hemos enviado la clave temporal a tu correo.');
        } else {
          // Verify against async storage
          const users = await storage.getUsers();
          const userExists = users.find(u => u.username === username);
          
          if (userExists && email.includes('@')) {
            setSuccessMsg(`Si los datos son correctos, recibirás un correo en ${email} con los pasos a seguir.`);
          } else {
            // Generic message for security
            setSuccessMsg(`Si los datos son correctos, recibirás un correo en ${email} con los pasos a seguir.`);
          }
        }
        setIsLoading(false);
        return;
      }

      // ===========================
      // REGISTRATION LOGIC
      // ===========================
      if (currentView === 'REGISTER') {
        if (!username || !password || !firstName || !lastName || !email) {
          setError('Ups, faltan datos. Por favor completa todos los campos.');
          setIsLoading(false);
          return;
        }

        if (password.length < 4) {
          setError('La contraseña es muy corta. Usa al menos 4 caracteres.');
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
          setError(`El usuario "${username}" ya existe. Intenta con otro nombre.`);
        }
        setIsLoading(false);
        return;
      }

      // ===========================
      // LOGIN LOGIC
      // ===========================
      if (!username || !password) {
        setError('Por favor ingresa tu usuario y contraseña.');
        setIsLoading(false);
        return;
      }
      
      const users = await storage.getUsers();
      const userAccount = users.find(u => u.username === username);

      // Scenario 1: User does not exist
      if (!userAccount) {
        setError('No encontramos una cuenta con ese usuario. ¿Quizás quisiste decir otro nombre?');
        setIsLoading(false);
        return;
      }

      // Scenario 2: Wrong Password
      if (userAccount.password !== password) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          // Lock account logic
          setIsLocked(true);
          setLockTimer(30);
          setError('Cuenta bloqueada temporalmente por seguridad (30s).');
          
          const interval = setInterval(() => {
             setLockTimer((prev) => {
               if (prev <= 1) {
                 clearInterval(interval);
                 setIsLocked(false);
                 setFailedAttempts(0);
                 setError('');
                 return 0;
               }
               return prev - 1;
             });
          }, 1000);
        } else if (newAttempts >= 3) {
          setError(`Contraseña incorrecta. Advertencia: ${5 - newAttempts} intentos restantes antes del bloqueo.`);
        } else {
          setError('La contraseña no coincide. Verifica mayúsculas y minúsculas.');
        }

        setIsLoading(false);
        return;
      }

      // Scenario 3: Success
      setFailedAttempts(0); // Reset attempts on success
      onLogin(userAccount);

    } catch (err) {
      setError("Error de conexión. Por favor intenta de nuevo más tarde.");
    } finally {
      if (!isLocked) setIsLoading(false);
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
          <p className="text-slate-500 mt-2 font-medium">
            {currentView === 'REGISTER' && 'Crea tu cuenta en segundos'}
            {currentView === 'LOGIN' && 'Bienvenido de nuevo'}
            {currentView === 'RECOVER' && 'Recuperar Acceso'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Registration Extra Fields */}
          {currentView === 'REGISTER' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                   <input
                     type="text"
                     value={firstName}
                     onChange={(e) => setFirstName(e.target.value)}
                     className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="Ej. Juan"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase">Apellido</label>
                   <input
                     type="text"
                     value={lastName}
                     onChange={(e) => setLastName(e.target.value)}
                     className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                     placeholder="Ej. Pérez"
                   />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Negocio</label>
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
            <label className="text-xs font-bold text-slate-500 uppercase">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Ingresa tu usuario"
            />
          </div>

          {(currentView === 'REGISTER' || currentView === 'RECOVER') && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Correo Electrónico</label>
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
                <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
                {currentView === 'LOGIN' && (
                  <button 
                    type="button" 
                    onClick={() => handleSwitchView('RECOVER')}
                    className="text-xs text-indigo-600 hover:underline font-medium"
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

          {/* Error Message UI */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
               {isLocked ? (
                 <ShieldAlert className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
               ) : (
                 <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
               )}
               <div>
                  <h4 className="text-xs font-bold text-red-800 uppercase mb-0.5">Atención</h4>
                  <p className="text-sm text-red-700 font-medium leading-tight">{error}</p>
               </div>
            </div>
          )}

          {/* Success Message UI */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-1">
               <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
               <div>
                  <h4 className="text-xs font-bold text-green-800 uppercase mb-0.5">Éxito</h4>
                  <p className="text-sm text-green-700 font-medium leading-tight">{successMsg}</p>
               </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              isLocked 
              ? 'bg-slate-400 text-white cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
               <Loader2 className="animate-spin" />
            ) : (
              <>
                {currentView === 'REGISTER' && (
                  <><span>Crear Cuenta</span><UserPlus size={20} /></>
                )}
                {currentView === 'LOGIN' && (
                  <><span>{isLocked ? `Espera ${lockTimer}s` : 'Ingresar'}</span><LogIn size={20} /></>
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
                  className="text-slate-500 font-medium hover:text-slate-700 text-sm flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={14} /> Volver al inicio de sesión
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