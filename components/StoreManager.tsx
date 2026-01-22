import React, { useState } from 'react';
import { Store, User } from '../types';
import { Plus, Users, ArrowRight, Store as StoreIcon, Settings, Crown, CheckCircle, Loader2, UserPlus, Link as LinkIcon, Calendar, Clock, X, Check, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import * as storage from '../services/storageService';

interface StoreManagerProps {
  user: User;
  availableStores: Store[];
  currentStore: Store | null;
  onSelectStore: (store: Store) => void;
  onStoreCreated: () => Promise<void>;
}

const StoreManager: React.FC<StoreManagerProps> = ({ user, availableStores, currentStore, onSelectStore, onStoreCreated }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Managing staff state
  const [manageStaffStore, setManageStaffStore] = useState<Store | null>(null);
  
  // Tab State: 'link' (existing user) or 'create' (new account)
  const [staffTab, setStaffTab] = useState<'link' | 'create'>('link');

  // Pricing Modal
  const [showPricing, setShowPricing] = useState<{show: boolean, storeId: string | null, currentPlanId?: string}>({show: false, storeId: null});

  // Expandable Cards State
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set());

  // Link Existing State
  const [linkUsername, setLinkUsername] = useState('');
  
  // Create New State
  const [newEmpData, setNewEmpData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const [staffError, setStaffError] = useState('');
  const [staffSuccess, setStaffSuccess] = useState('');

  // --- Logic Grouping ---
  const ownedStores = availableStores.filter(s => s.ownerId === user.id);
  const employedStores = availableStores.filter(s => s.ownerId !== user.id);

  const toggleExpand = (storeId: string) => {
    setExpandedStores(prev => {
      const next = new Set(prev);
      if (next.has(storeId)) {
        next.delete(storeId);
      } else {
        next.add(storeId);
      }
      return next;
    });
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStoreName.trim()) {
      setIsLoading(true);
      const store = await storage.createStore(newStoreName, user.id);
      onSelectStore(store);
      await onStoreCreated();
      setIsLoading(false);
      setIsCreating(false);
      setNewStoreName('');
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!showPricing.storeId) return;
    
    setIsLoading(true);
    await storage.upgradeStoreSubscription(showPricing.storeId, planId);
    await onStoreCreated();
    setIsLoading(false);
    setShowPricing({ show: false, storeId: null });
    alert("¡Suscripción Actualizada con Éxito!");
  };

  const handleLinkStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess('');
    
    if (!manageStaffStore || !linkUsername.trim()) return;

    setIsLoading(true);
    const result = await storage.addStaffToStore(manageStaffStore.id, linkUsername.trim());
    setIsLoading(false);
    
    if (result.success) {
      setStaffSuccess(`Usuario '${linkUsername}' vinculado correctamente.`);
      setLinkUsername('');
      await refreshManagedStore();
    } else {
      setStaffError(result.message || 'Error al vincular usuario.');
    }
  };

  const handleCreateAndLinkStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError('');
    setStaffSuccess('');

    if (!manageStaffStore) return;
    if (!newEmpData.username || !newEmpData.password || !newEmpData.firstName) {
      setStaffError('Por favor completa usuario, contraseña y nombre.');
      return;
    }

    setIsLoading(true);

    // 1. Register the new user
    const newUser = await storage.registerUser({
      username: newEmpData.username.trim(),
      password: newEmpData.password.trim(),
      firstName: newEmpData.firstName.trim(),
      lastName: newEmpData.lastName.trim(),
      email: `${newEmpData.username}@empleado.local`, // Dummy email for local logic
      businessType: user.businessType || 'retail' // Inherit business type
    }, 'employee'); // IMPORTANT: Role is employee

    if (!newUser) {
      setIsLoading(false);
      setStaffError('El nombre de usuario ya existe. Elige otro.');
      return;
    }

    // 2. Link to store
    const result = await storage.addStaffToStore(manageStaffStore.id, newUser.username);
    
    setIsLoading(false);

    if (result.success) {
      setStaffSuccess(`Empleado '${newUser.username}' creado y vinculado con éxito.`);
      setNewEmpData({ username: '', password: '', firstName: '', lastName: '' });
      await refreshManagedStore();
    } else {
      setStaffError(result.message || 'Usuario creado, pero error al vincular.');
    }
  };

  const refreshManagedStore = async () => {
    if (!manageStaffStore) return;
    await onStoreCreated(); // Refresh global list
    const updatedStores = await storage.getUserStores(user);
    const updatedManaged = updatedStores.find(s => s.id === manageStaffStore.id);
    if(updatedManaged) setManageStaffStore(updatedManaged);
  };

  // Helper to translate business type
  const getBusinessLabel = (type?: string) => {
    if (type === 'restaurant') return 'Restaurante';
    return 'Tienda';
  };

  // --- Sub-render: Store Card ---
  const renderStoreCard = (store: Store, isOwner: boolean) => {
    const isPremium = store.subscription === 'PREMIUM';
    const isExpanded = expandedStores.has(store.id);
    const isSelected = currentStore?.id === store.id;
    
    // Logic to show upgrade button: Show if owner AND not on top tier (pro_mxn)
    const showUpgradeButton = isOwner && store.planId !== 'pro_mxn';

    return (
      <div 
        key={store.id} 
        className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
          isSelected 
            ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' 
            : 'border-slate-200 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Card Header (Always Visible) - Click to toggle */}
        <div 
          onClick={() => toggleExpand(store.id)}
          className={`p-4 flex items-center justify-between cursor-pointer ${isSelected ? 'bg-indigo-50/50' : 'bg-white hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
              isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <StoreIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {store.name}
                {isPremium && <Crown size={14} className="text-amber-500 fill-amber-500" />}
                {isSelected && (
                  <span className="text-[10px] uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">
                    En uso
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                 {isPremium ? (store.planId === 'pro_mxn' ? 'Plan Empresarial' : 'Plan Emprendedor') : 'Plan Gratuito'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             {/* Quick select button if not expanded */}
             {!isExpanded && !isSelected && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onSelectStore(store); }}
                 className="mr-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
               >
                 Seleccionar
               </button>
             )}
             <div className={`transition-transform duration-200 text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
               <ChevronDown size={20} />
             </div>
          </div>
        </div>

        {/* Card Body (Collapsible) */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
             
             {/* Info Grid */}
             <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg">
                   <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Rol</span>
                   <span className="font-medium text-slate-700 flex items-center gap-1">
                     {isOwner ? <Crown size={14} className="text-amber-500" /> : <Briefcase size={14} className="text-blue-500" />}
                     {isOwner ? 'Dueño / Admin' : 'Empleado / Vendedor'}
                   </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                   <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Empleados</span>
                   <span className="font-medium text-slate-700">
                     {store.staffUsernames.length} {isPremium ? '' : '/ 5'}
                   </span>
                </div>
                {isPremium && store.subscriptionExpiry && (
                   <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <span className="block text-xs text-amber-600 uppercase font-bold mb-1">Suscripción Activa</span>
                      <span className="text-xs text-amber-800 font-medium flex items-center gap-1">
                        <Clock size={12} />
                        Vence: {new Date(store.subscriptionExpiry).toLocaleDateString()}
                      </span>
                   </div>
                )}
             </div>

             {/* Actions */}
             <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => onSelectStore(store)}
                  className={`flex-1 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                    isSelected 
                    ? 'bg-indigo-50 text-indigo-700 cursor-default border border-indigo-200' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle size={16} />
                      Tienda Actual
                    </>
                  ) : (
                    <>
                      Administrar Tienda
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                
                {isOwner && (
                  <button 
                    onClick={() => { setManageStaffStore(store); }}
                    className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-2"
                    title="Configurar Empleados"
                  >
                    <Users size={18} />
                    <span className="sm:hidden">Empleados</span>
                  </button>
                )}

                {showUpgradeButton && (
                  <button
                    onClick={() => { setShowPricing({show: true, storeId: store.id, currentPlanId: store.planId}); }}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown size={16} />
                    {isPremium ? 'Subir Plan' : 'Mejorar'}
                  </button>
                )}
             </div>
          </div>
        )}
      </div>
    );
  };

  // --- MAIN RENDER: Staff Manager View ---
  if (manageStaffStore) {
    const isFree = manageStaffStore.subscription === 'FREE';
    const staffCount = manageStaffStore.staffUsernames.length;
    const staffLimit = 5;
    const isLimitReached = isFree && staffCount >= staffLimit;
    const limitPercentage = Math.min((staffCount / staffLimit) * 100, 100);

    return (
      <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-4">
        <button onClick={() => setManageStaffStore(null)} className="mb-4 text-indigo-600 hover:underline flex items-center gap-1">
          <ArrowRight size={16} className="rotate-180" /> Volver a mis tiendas
        </button>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Users className="text-indigo-600" />
              Equipo: {manageStaffStore.name}
            </h2>
          </div>
          
          <div className="p-6">
             {/* Limit Status Bar */}
             <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-slate-600 uppercase">Capacidad de Empleados</span>
                  <span className={`text-sm font-bold ${isLimitReached ? 'text-red-600' : 'text-indigo-600'}`}>
                    {isFree ? `${staffCount} / ${staffLimit}` : `${staffCount} / Ilimitado`}
                  </span>
                </div>
                {isFree ? (
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${limitPercentage}%` }}
                    ></div>
                  </div>
                ) : (
                  <div className="w-full bg-amber-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full bg-amber-500 w-full animate-pulse"></div>
                  </div>
                )}
                {isLimitReached && (
                  <div className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                     <Crown size={12} />
                     Has alcanzado el límite del Plan Gratuito. Mejora a Premium para añadir más.
                  </div>
                )}
             </div>

             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Empleados Activos</h3>
             {manageStaffStore.staffUsernames.length === 0 ? (
               <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300 mb-6">
                 <p className="text-slate-500 text-sm">No hay empleados asignados a esta tienda.</p>
               </div>
             ) : (
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                 {manageStaffStore.staffUsernames.map(username => (
                   <li key={username} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                     <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                       {username[0].toUpperCase()}
                     </div>
                     <div>
                       <p className="font-medium text-slate-900">{username}</p>
                       <p className="text-xs text-slate-500">Vendedor</p>
                     </div>
                   </li>
                 ))}
               </ul>
             )}

             <div className="border-t pt-6">
                <div className="flex gap-4 mb-6 border-b border-slate-100">
                  <button 
                    onClick={() => { setStaffTab('link'); setStaffError(''); setStaffSuccess(''); }}
                    className={`pb-2 text-sm font-medium transition-colors ${staffTab === 'link' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Vincular Existente
                  </button>
                  <button 
                    onClick={() => { setStaffTab('create'); setStaffError(''); setStaffSuccess(''); }}
                    className={`pb-2 text-sm font-medium transition-colors ${staffTab === 'create' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Crear Nuevo Empleado
                  </button>
                </div>

                {isLimitReached ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                     <Crown size={48} className="mx-auto text-amber-500 mb-3" />
                     <h3 className="text-lg font-bold text-slate-800">Límite Alcanzado</h3>
                     <p className="text-slate-500 mb-4 max-w-xs mx-auto">
                       El plan gratuito permite hasta 5 empleados. Desbloquea capacidad ilimitada mejorando tu plan.
                     </p>
                     <button 
                        onClick={() => setShowPricing({ show: true, storeId: manageStaffStore.id, currentPlanId: manageStaffStore.planId })}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                     >
                       Ver Planes Premium
                     </button>
                  </div>
                ) : (
                  <>
                    {staffTab === 'link' ? (
                      <form onSubmit={handleLinkStaff} className="animate-in fade-in">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              value={linkUsername}
                              onChange={e => setLinkUsername(e.target.value)}
                              placeholder="Nombre de usuario existente"
                              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </div>
                          <button 
                            type="submit" 
                            disabled={isLoading}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50"
                          >
                            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Vincular'}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Útil si el empleado ya se registró por su cuenta en la aplicación.
                        </p>
                      </form>
                    ) : (
                      <form onSubmit={handleCreateAndLinkStaff} className="animate-in fade-in space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Usuario (Login)</label>
                            <input 
                              type="text" 
                              value={newEmpData.username}
                              onChange={e => setNewEmpData({...newEmpData, username: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="ej. pedro.ventas"
                              required
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
                            <input 
                              type="text" 
                              value={newEmpData.password}
                              onChange={e => setNewEmpData({...newEmpData, password: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="Contraseña"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-700 mb-1">Nombre del Empleado</label>
                            <input 
                              type="text" 
                              value={newEmpData.firstName}
                              onChange={e => setNewEmpData({...newEmpData, firstName: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              placeholder="ej. Pedro Alcantara"
                              required
                            />
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          disabled={isLoading}
                          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                          Crear y Vincular Empleado
                        </button>
                      </form>
                    )}
                  </>
                )}

                {staffError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                    <X size={16} /> {staffError}
                  </div>
                )}
                {staffSuccess && (
                  <div className="mt-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2 border border-green-100">
                    <CheckCircle size={16} /> {staffSuccess}
                  </div>
                )}
             </div>
          </div>
        </div>
        
        {/* Reuse Pricing Modal */}
        {showPricing.show && (
          <PricingModal 
            onClose={() => setShowPricing({show: false, storeId: null})}
            onSelectPlan={handleUpgrade}
            isLoading={isLoading}
            currentPlanId={manageStaffStore.planId}
          />
        )}
      </div>
    );
  }

  // --- MAIN RENDER: Store List View ---
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in">
      {isLoading && !showPricing.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50">
           <Loader2 className="animate-spin text-indigo-600" />
        </div>
      )}

      {/* Header & Create Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Mis Tiendas</h1>
           <p className="text-slate-500 text-sm">Gestiona sucursales y suscripciones</p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva Tienda</span>
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
         <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-in zoom-in-95">
           <h3 className="font-semibold text-lg mb-4 text-slate-800">Crear Nueva Tienda</h3>
           <form onSubmit={handleCreateStore} className="flex gap-3">
             <input 
               type="text" 
               value={newStoreName}
               onChange={e => setNewStoreName(e.target.value)}
               placeholder="Nombre del negocio"
               className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
               autoFocus
             />
             <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">Crear</button>
             <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
           </form>
         </div>
      )}

      {/* SECTION 1: Owned Stores */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
           <Crown size={16} />
           Tiendas que Administro
        </h2>
        
        {ownedStores.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
             <StoreIcon className="mx-auto text-slate-300 mb-2" size={32} />
             <p className="text-slate-500 text-sm">No has creado ninguna tienda todavía.</p>
             <button onClick={() => setIsCreating(true)} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">
               Crear mi primera tienda
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {ownedStores.map(store => renderStoreCard(store, true))}
          </div>
        )}
      </div>

      {/* SECTION 2: Employed Stores (Only show if applicable) */}
      {(employedStores.length > 0 || user.role === 'employee') && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 md:border-0 md:pt-0 md:mt-0">
             <Briefcase size={16} />
             Tiendas Asignadas
          </h2>
          
          {employedStores.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-500 flex items-center gap-3">
               <Briefcase className="text-slate-400" size={20} />
               No estás vinculado a otras tiendas como empleado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {employedStores.map(store => renderStoreCard(store, false))}
            </div>
          )}
        </div>
      )}

      {showPricing.show && (
         <PricingModal 
           onClose={() => setShowPricing({show: false, storeId: null})} 
           onSelectPlan={handleUpgrade}
           isLoading={isLoading}
           currentPlanId={showPricing.currentPlanId}
         />
      )}
    </div>
  );
};

// --- Subcomponent: Pricing Modal ---
const PricingModal = ({ onClose, onSelectPlan, isLoading, currentPlanId }: { onClose: () => void, onSelectPlan: (id: string) => void, isLoading: boolean, currentPlanId?: string }) => {
  const isFree = !currentPlanId || currentPlanId === 'free';
  const isBasic = currentPlanId === 'basic_mxn';
  const isPro = currentPlanId === 'pro_mxn';

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
         <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
           <div>
              <h2 className="text-2xl font-bold text-slate-900">Elige tu Plan</h2>
              <p className="text-slate-500">Impulsa tu negocio con las mejores herramientas</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
             <X size={24} className="text-slate-500" />
           </button>
         </div>
         
         <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Plan Gratuito */}
            <div className={`border rounded-xl p-6 flex flex-col transition-colors ${isFree ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'}`}>
               <div className="mb-4">
                 <h3 className="font-bold text-lg text-slate-800">Gratuito</h3>
                 <p className="text-3xl font-bold mt-2">$0 <span className="text-sm font-normal text-slate-500">MXN/mes</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-green-500" /> 1 Tienda</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-green-500" /> 5 Empleados Máx.</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-green-500" /> 1000 Productos</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-green-500" /> Punto de Venta Básico</li>
               </ul>
               <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                 {isFree ? 'Tu Plan Actual' : 'Plan Básico'}
               </button>
            </div>

            {/* Plan Emprendedor */}
            <div className={`border-2 rounded-xl p-6 flex flex-col relative shadow-lg transform ${isBasic ? 'border-slate-300 scale-100' : 'border-indigo-500 bg-indigo-50/30 scale-105'}`}>
               {!isBasic && !isPro && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                   MÁS POPULAR
                 </div>
               )}
               <div className="mb-4 mt-2">
                 <h3 className="font-bold text-lg text-indigo-900">Emprendedor</h3>
                 <p className="text-3xl font-bold mt-2 text-indigo-700">$199 <span className="text-sm font-normal text-slate-500">MXN/mes</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check size={18} className="text-indigo-600" /> 15 Empleados</li>
                 <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check size={18} className="text-indigo-600" /> Productos Ilimitados</li>
                 <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check size={18} className="text-indigo-600" /> Reportes Avanzados</li>
                 <li className="flex gap-2 text-sm text-slate-700 font-medium"><Check size={18} className="text-indigo-600" /> Soporte Prioritario</li>
               </ul>
               {isBasic ? (
                 <button disabled className="w-full py-2 bg-slate-200 text-slate-500 font-bold rounded-lg cursor-not-allowed flex justify-center items-center gap-2">
                   <CheckCircle size={18} /> Plan Actual
                 </button>
               ) : (
                  isPro ? (
                    <button disabled className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                      Incluido en Empresarial
                    </button>
                  ) : (
                    <button 
                      onClick={() => onSelectPlan('basic_mxn')}
                      disabled={isLoading}
                      className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transition-transform active:scale-95 flex justify-center items-center gap-2"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Elegir Emprendedor'}
                    </button>
                  )
               )}
            </div>

            {/* Plan Empresarial */}
            <div className={`border rounded-xl p-6 flex flex-col transition-colors ${isPro ? 'border-amber-400 ring-1 ring-amber-400 bg-amber-50/20' : 'border-slate-200 hover:border-amber-400'}`}>
               <div className="mb-4">
                 <h3 className="font-bold text-lg text-slate-800">Empresarial</h3>
                 <p className="text-3xl font-bold mt-2 text-slate-900">$499 <span className="text-sm font-normal text-slate-500">MXN/mes</span></p>
               </div>
               <ul className="space-y-3 mb-8 flex-1">
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-amber-500" /> Empleados Ilimitados</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-amber-500" /> Múltiples Sucursales</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-amber-500" /> API de Acceso</li>
                 <li className="flex gap-2 text-sm text-slate-600"><Check size={18} className="text-amber-500" /> Soporte 24/7 Dedicado</li>
               </ul>
               {isPro ? (
                 <button disabled className="w-full py-2 bg-amber-100 text-amber-700 font-bold rounded-lg cursor-not-allowed flex justify-center items-center gap-2">
                   <Crown size={18} /> Plan Actual
                 </button>
               ) : (
                 <button 
                    onClick={() => onSelectPlan('pro_mxn')}
                    disabled={isLoading}
                    className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-sm transition-transform active:scale-95 flex justify-center items-center gap-2"
                 >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Elegir Empresarial'}
                 </button>
               )}
            </div>

         </div>
         <div className="p-4 bg-slate-50 text-center text-xs text-slate-400">
           * Precios más IVA. La facturación es mensual y se puede cancelar en cualquier momento.
         </div>
      </div>
    </div>
  );
};

export default StoreManager;