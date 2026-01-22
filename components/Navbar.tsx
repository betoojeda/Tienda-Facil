import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, LogOut, Menu, Store as StoreIcon, ShieldCheck, Sparkles } from 'lucide-react';
import { ViewState, Role } from '../types';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  storeName?: string;
  userRole?: Role;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, onLogout, isSidebarOpen, setIsSidebarOpen, storeName, userRole }) => {
  
  // Define items based on Role
  let menuItems = [];

  if (userRole === 'super_admin') {
     menuItems = [
       { id: ViewState.SUPER_ADMIN, label: 'Panel', icon: <ShieldCheck size={20} /> },
     ];
  } else {
    // Common items
    menuItems.push({ id: ViewState.DASHBOARD, label: 'Resumen', icon: <LayoutDashboard size={20} /> });
    menuItems.push({ id: ViewState.POS, label: 'Venta', icon: <ShoppingCart size={20} /> });
    
    // Restricted Items (Owner only usually, or Employee with permissions)
    if (userRole === 'owner') {
      menuItems.push({ id: ViewState.INVENTORY, label: 'Items', icon: <Package size={20} /> });
      menuItems.push({ id: ViewState.STORE_SETTINGS, label: 'Tienda', icon: <StoreIcon size={20} /> });
    }
  }

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Visible md+) --- */}
      <div className={`
        hidden md:flex flex-col w-64 bg-white border-r h-full z-30 transition-all duration-200
        ${isSidebarOpen ? 'w-64' : 'w-20'} 
      `}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-center border-b px-2">
           {isSidebarOpen ? (
             <div className="flex flex-col items-center animate-in fade-in">
                <span className="font-bold text-xl text-indigo-700">Tienda-Facil</span>
                {storeName && <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">{storeName}</span>}
             </div>
           ) : (
             <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
               <StoreIcon size={24} />
             </div>
           )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                    ${currentView === item.id 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    ${!isSidebarOpen && 'justify-center'}
                  `}
                  title={item.label}
                >
                  {item.icon}
                  {isSidebarOpen && <span>{item.label === 'Items' ? 'Inventario' : item.label === 'Tienda' ? 'Mis Tiendas' : item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <button
            type="button"
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors
              ${!isSidebarOpen && 'justify-center'}
            `}
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
        
        {/* Toggle Button (Desktop only feature) */}
        <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="hidden md:flex absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 shadow-sm text-slate-400 hover:text-indigo-600 z-50"
        >
           {isSidebarOpen ? <Menu size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* --- MOBILE TOP BAR (Visible max-md) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-40 shadow-sm/50 backdrop-blur-sm bg-white/95">
        <div className="flex items-center gap-2 overflow-hidden">
           <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <StoreIcon size={18} />
           </div>
           <span className="font-bold text-lg text-slate-800 truncate max-w-[200px]">{storeName || 'Tienda-Facil'}</span>
        </div>
        <button 
          onClick={onLogout} 
          className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible max-md) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-end pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.03)] h-16">
        {menuItems.map((item) => {
           const isActive = currentView === item.id;
           return (
             <button
               key={item.id}
               onClick={() => setView(item.id)}
               className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 transition-all active:scale-95 ${
                 isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
               }`}
             >
               <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-indigo-50 translate-y-[-2px]' : ''}`}>
                 {React.cloneElement(item.icon as React.ReactElement<any>, { size: isActive ? 24 : 22, strokeWidth: isActive ? 2.5 : 2 })}
               </div>
               <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-bold' : ''}`}>
                 {item.label}
               </span>
             </button>
           );
        })}
      </div>
    </>
  );
};

export default Navbar;