import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, LogOut, Menu, Store as StoreIcon, ShieldCheck } from 'lucide-react';
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
       { id: ViewState.SUPER_ADMIN, label: 'Panel Global', icon: <ShieldCheck size={20} /> },
     ];
  } else {
    // Common items
    menuItems.push({ id: ViewState.DASHBOARD, label: 'Resumen', icon: <LayoutDashboard size={20} /> });
    menuItems.push({ id: ViewState.POS, label: 'Punto de Venta', icon: <ShoppingCart size={20} /> });
    
    // Restricted Items (Owner only usually, or Employee with permissions)
    // For this app: Employee sees POS and Dashboard. Owner sees all.
    if (userRole === 'owner') {
      menuItems.push({ id: ViewState.INVENTORY, label: 'Inventario / Menú', icon: <Package size={20} /> });
      menuItems.push({ id: ViewState.STORE_SETTINGS, label: 'Mis Tiendas', icon: <StoreIcon size={20} /> });
    }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center justify-between px-4 z-20">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md">
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg text-indigo-700 truncate max-w-[200px]">{storeName || 'Tienda-Facil'}</span>
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Sidebar / Drawer */}
      <div className={`
        fixed md:static inset-y-0 left-0 w-64 bg-white border-r transform transition-transform duration-200 z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col
      `}>
        <div className="h-16 flex items-center justify-center border-b max-md:hidden px-4">
          <div className="flex flex-col items-center">
             <span className="font-bold text-xl text-indigo-700">Tienda-Facil</span>
             {storeName && <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{storeName}</span>}
             {userRole === 'super_admin' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded mt-1">Super Admin</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setView(item.id);
                    // Close sidebar on mobile on selection
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${currentView === item.id 
                      ? 'bg-indigo-50 text-indigo-700 font-medium' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;