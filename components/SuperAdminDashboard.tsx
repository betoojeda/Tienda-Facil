import React, { useEffect, useState } from 'react';
import { getGlobalStats, getUsers, updateUserPassword, updateSystemConfig, adminUpdateStore, getSystemConfig } from '../services/storageService';
import { Users, Store, DollarSign, ShoppingBag, TrendingUp, Lock, Key, X, Save, Settings, RefreshCw, ChevronDown, ChevronUp, Calendar, Clock, CreditCard, Loader2, Edit, Package, AlertTriangle, ListChecks } from 'lucide-react';
import { User, Store as StoreType, SubscriptionPlan } from '../types';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal State: Password
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Modal State: Edit Store
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Partial<StoreType>>({});

  // Config State
  const [freeTierLimitInput, setFreeTierLimitInput] = useState<number>(0);

  // Table State
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    const globalStats = await getGlobalStats();
    const users = await getUsers();
    const config = await getSystemConfig();
    
    setStats(globalStats);
    setUserList(users);
    setPlans(config.plans);
    setFreeTierLimitInput(config.freeTierLimit);
    setIsLoading(false);
  };

  const handleOpenPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async () => {
    if (selectedUser && newPassword.trim()) {
      setIsLoading(true);
      const success = await updateUserPassword(selectedUser.id, newPassword.trim());
      setIsLoading(false);
      
      if (success) {
        alert(`Contraseña actualizada para ${selectedUser.username}`);
        setIsPasswordModalOpen(false);
        await refreshData();
      } else {
        alert("Error al actualizar la contraseña");
      }
    }
  };

  const handleOpenStoreModal = (store: any) => {
    // Extract editable fields
    setEditingStore({
      id: store.id,
      name: store.name,
      subscription: store.subscription,
      planId: store.planId,
      subscriptionExpiry: store.subscriptionExpiry || '',
    });
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = async () => {
    if (!editingStore.id) return;
    
    setIsLoading(true);
    const updates: Partial<StoreType> = {
      name: editingStore.name,
      subscription: editingStore.subscription,
      planId: editingStore.planId,
      subscriptionExpiry: editingStore.subscriptionExpiry
    };

    const success = await adminUpdateStore(editingStore.id, updates);
    
    if (success) {
      await refreshData();
      setIsStoreModalOpen(false);
    } else {
      alert("Error al actualizar la tienda");
    }
    setIsLoading(false);
  };

  const handleUpdateConfig = async () => {
    setIsLoading(true);
    await updateSystemConfig({ freeTierLimit: Number(freeTierLimitInput) });
    await refreshData();
    setIsLoading(false);
    alert("Configuración actualizada correctamente.");
  };
  
  const handleUpdatePlan = (index: number, field: keyof SubscriptionPlan, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    setPlans(newPlans);
  };

  const handleSavePlans = async () => {
    setIsLoading(true);
    await updateSystemConfig({ plans: plans });
    await refreshData();
    setIsLoading(false);
    alert("Planes actualizados correctamente.");
  };

  const toggleStoreRow = (storeId: string) => {
    if (expandedStoreId === storeId) {
      setExpandedStoreId(null);
    } else {
      setExpandedStoreId(storeId);
    }
  };

  if (!stats) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Cargando reportes...</div>;

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {isLoading && (
         <div className="fixed top-4 right-4 bg-white p-2 rounded-full shadow-lg z-50 animate-pulse">
           <Loader2 className="animate-spin text-indigo-600" />
         </div>
      )}

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel de Super Administrador</h1>
          <p className="text-slate-500">Visión global y gestión del sistema</p>
        </div>
        <button 
          onClick={() => refreshData()} 
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95"
          title="Recargar Datos"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-500 font-medium">Usuarios Totales</h3>
            <Users className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-500 font-medium">Tiendas Activas</h3>
            <Store className="text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalStores}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-500 font-medium">Ventas Globales</h3>
            <ShoppingBag className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalSales}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-slate-500 font-medium">Volumen Transaccionado</h3>
            <DollarSign className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Plans Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ListChecks size={20} />
            Gestión de Planes de Suscripción
          </h2>
        </div>
        <div className="p-6 overflow-x-auto">
           <table className="w-full text-left">
             <thead>
               <tr className="border-b border-slate-200">
                 <th className="pb-3 text-sm font-semibold text-slate-600">ID Plan</th>
                 <th className="pb-3 text-sm font-semibold text-slate-600">Nombre</th>
                 <th className="pb-3 text-sm font-semibold text-slate-600">Precio (MXN)</th>
                 <th className="pb-3 text-sm font-semibold text-slate-600">Máx. Empleados (-1 inf)</th>
                 <th className="pb-3 text-sm font-semibold text-slate-600">Máx. Productos (-1 inf)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {plans.map((plan, idx) => (
                 <tr key={plan.id}>
                   <td className="py-3 px-2 text-xs font-mono text-slate-500">{plan.id}</td>
                   <td className="py-3 px-2">
                     <input 
                       type="text" 
                       value={plan.name}
                       onChange={(e) => handleUpdatePlan(idx, 'name', e.target.value)}
                       className="w-full border rounded px-2 py-1 text-sm"
                     />
                   </td>
                   <td className="py-3 px-2">
                     <input 
                       type="number" 
                       value={plan.price}
                       onChange={(e) => handleUpdatePlan(idx, 'price', parseFloat(e.target.value))}
                       className="w-24 border rounded px-2 py-1 text-sm font-bold text-indigo-700"
                     />
                   </td>
                   <td className="py-3 px-2">
                     <input 
                       type="number" 
                       value={plan.maxEmployees}
                       onChange={(e) => handleUpdatePlan(idx, 'maxEmployees', parseInt(e.target.value))}
                       className="w-24 border rounded px-2 py-1 text-sm"
                     />
                   </td>
                   <td className="py-3 px-2">
                     <input 
                       type="number" 
                       value={plan.maxProducts}
                       onChange={(e) => handleUpdatePlan(idx, 'maxProducts', parseInt(e.target.value))}
                       className="w-24 border rounded px-2 py-1 text-sm"
                     />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
           <div className="mt-4 flex justify-end">
             <button 
               onClick={handleSavePlans}
               disabled={isLoading}
               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
             >
               <Save size={18} />
               Guardar Cambios en Planes
             </button>
           </div>
        </div>
      </div>

      {/* Users Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
          <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
            <Users size={20} />
            Gestión de Usuarios y Contraseñas
          </h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Total: {userList.length}
          </span>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Usuario</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Nombre Completo</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Rol</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Tipo Negocio</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm text-center">Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {u.username}
                      {u.role === 'super_admin' && <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">ADMIN</span>}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{u.firstName || '-'} {u.lastName || ''}</td>
                    <td className="px-6 py-3 text-slate-600 capitalize">{u.role}</td>
                    <td className="px-6 py-3 text-slate-600 capitalize">{u.businessType || '-'}</td>
                    <td className="px-6 py-3 text-center">
                      <button 
                        onClick={() => handleOpenPasswordModal(u)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 px-3 py-1 rounded-full text-xs font-bold transition-colors border border-slate-200"
                      >
                        <Key size={14} />
                        Cambiar Clave
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store List Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Reporte de Tiendas</h2>
           <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Total: {stats.storesList.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">ID Tienda</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Nombre</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Inventario</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Empleados</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Plan</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Acciones</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.storesList.length === 0 ? (
                 <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                    No hay tiendas registradas.
                  </td>
                </tr>
              ) : (
                stats.storesList.map((store: any) => (
                  <React.Fragment key={store.id}>
                    <tr 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedStoreId === store.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => toggleStoreRow(store.id)}
                    >
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{store.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{store.name}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                         <div className="flex flex-col">
                           <span className="font-bold">{store.stats?.productCount || 0} Prod.</span>
                           <span className="text-xs text-slate-400">{(store.stats?.totalStock || 0).toLocaleString()} Unid.</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {store.staffUsernames.length}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${store.subscription === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {store.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenStoreModal(store); }}
                          className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-xs flex items-center gap-1 border border-indigo-200"
                        >
                          <Edit size={14} /> Editar
                        </button>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                         {expandedStoreId === store.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                    </tr>
                    
                    {/* Expanded Detail Row */}
                    {expandedStoreId === store.id && (
                      <tr className="bg-slate-50/80 animate-in fade-in slide-in-from-top-2 duration-200">
                        <td colSpan={7} className="px-6 py-4 border-b border-indigo-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                             {/* Creation Date Detail */}
                             <div className="flex flex-col gap-1">
                               <span className="font-semibold text-slate-600 flex items-center gap-2">
                                 <Calendar size={16} className="text-indigo-500" /> Detalle de Registro
                               </span>
                               <div className="ml-6 flex flex-col text-slate-700">
                                 <span>Dueño: <span className="font-bold">{store.ownerName}</span></span>
                                 <span className="text-xs text-slate-500">
                                   Creada: {store.createdAt 
                                     ? new Date(store.createdAt).toLocaleDateString('es-ES')
                                     : 'N/A'}
                                 </span>
                               </div>
                             </div>

                             {/* Subscription Detail */}
                             <div className="flex flex-col gap-1">
                               <span className="font-semibold text-slate-600 flex items-center gap-2">
                                 <CreditCard size={16} className={store.subscription === 'PREMIUM' ? "text-amber-500" : "text-slate-400"} /> 
                                 Suscripción
                               </span>
                               <div className="ml-6 flex flex-col">
                                 <span className={store.subscription === 'PREMIUM' ? "font-bold text-amber-700" : "text-slate-800"}>
                                   {store.planId || 'Plan Desconocido'}
                                 </span>
                                 {store.subscription === 'PREMIUM' && store.subscriptionExpiry && (
                                   <span className="text-xs text-amber-600">
                                     Expira: {new Date(store.subscriptionExpiry).toLocaleDateString('es-ES')}
                                   </span>
                                 )}
                               </div>
                             </div>

                             {/* Valuation */}
                             <div className="flex flex-col gap-1">
                               <span className="font-semibold text-slate-600 flex items-center gap-2">
                                 <Package size={16} className="text-green-500" />
                                 Valor del Inventario
                               </span>
                               <div className="ml-6">
                                 <span className="text-green-700 font-bold text-lg">
                                   ${(store.stats?.inventoryValue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                 </span>
                               </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Lock size={20} />
                Cambiar Contraseña
              </h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 mb-4">
                Estás cambiando la contraseña para el usuario: <br/>
                <span className="font-bold text-lg text-slate-900">{selectedUser.username}</span>
              </p>
              
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-slate-700">Nueva Contraseña</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ingresa nueva clave"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSavePassword}
                  disabled={!newPassword.trim() || isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {isStoreModalOpen && editingStore && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2">
                <Edit size={20} />
                Editar Tienda
              </h3>
              <button onClick={() => setIsStoreModalOpen(false)} className="hover:bg-slate-700 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                <span>
                  <b>Advertencia:</b> Modificar estos valores afecta inmediatamente el acceso y los límites de la tienda del usuario.
                </span>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Negocio</label>
                <input 
                  type="text" 
                  value={editingStore.name || ''}
                  onChange={e => setEditingStore({...editingStore, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Estado de Suscripción</label>
                    <select
                      value={editingStore.subscription || 'FREE'}
                      onChange={e => setEditingStore({...editingStore, subscription: e.target.value as any})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="FREE">GRATUITO (FREE)</option>
                      <option value="PREMIUM">PREMIUM (PAGADO)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Plan ID</label>
                    <select
                      value={editingStore.planId || 'free'}
                      onChange={e => setEditingStore({...editingStore, planId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {plans.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Vencimiento Suscripción</label>
                 <input 
                   type="date"
                   value={editingStore.subscriptionExpiry ? editingStore.subscriptionExpiry.split('T')[0] : ''}
                   onChange={e => setEditingStore({...editingStore, subscriptionExpiry: new Date(e.target.value).toISOString()})}
                   className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                   disabled={editingStore.subscription !== 'PREMIUM'}
                 />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  onClick={() => setIsStoreModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveStore}
                  disabled={isLoading}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;