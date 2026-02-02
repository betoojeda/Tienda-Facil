import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Login from './components/Login';
import StoreManager from './components/StoreManager';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import InstallButton from './components/InstallButton';
import HomePage from './components/HomePage'; // Import HomePage
import { ViewState, User, Product, Sale, Store } from './types';
import * as storage from './services/storageService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  // Change initial view to LANDING
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop
  const [isLoading, setIsLoading] = useState(false);
  
  // App Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [userStores, setUserStores] = useState<Store[]>([]);

  // --- Session Restoration Logic ---
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      const savedUser = await storage.getSessionUser();
      if (savedUser) {
        // Re-initialize app state with saved user
        await handleLogin(savedUser, false); 
        
        // Try to restore saved store
        const savedStore = await storage.getSessionStore();
        if (savedStore && savedUser.role !== 'super_admin') {
           // Verify user still has access
           const stores = await storage.getUserStores(savedUser);
           if (stores.find(s => s.id === savedStore.id)) {
             setCurrentStore(savedStore);
             setView(ViewState.DASHBOARD);
           }
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  // Refresh data whenever the current store changes
  useEffect(() => {
    const refreshStoreData = async () => {
      if (currentStore) {
        setIsLoading(true);
        const p = await storage.getProducts(currentStore.id);
        const s = await storage.getSales(currentStore.id);
        setProducts(p);
        setSales(s);
        setIsLoading(false);
      } else {
        setProducts([]);
        setSales([]);
      }
    };
    refreshStoreData();
  }, [currentStore]);

  const loadUserStores = async (u: User) => {
    const stores = await storage.getUserStores(u);
    setUserStores(stores);
    return stores;
  };

  const handleLogin = async (loggedInUser: User, setPersistence = true) => {
    setUser(loggedInUser);
    
    if (setPersistence) {
      storage.setSessionUser(loggedInUser.id);
    }
    
    if (loggedInUser.role === 'super_admin') {
      setView(ViewState.SUPER_ADMIN);
      return;
    }

    const stores = await loadUserStores(loggedInUser);
    
    if (setPersistence) {
      if (stores.length > 0) {
        setCurrentStore(stores[0]);
        storage.setSessionStore(stores[0].id);
        setView(ViewState.DASHBOARD);
      } else {
        setCurrentStore(null);
        if (loggedInUser.role === 'owner') {
          setView(ViewState.STORE_SETTINGS); 
        } else {
          alert("Cuenta sin tiendas asignadas.");
          setUser(null);
          storage.clearSession();
        }
      }
    }
  };

  const handleLogout = () => {
    storage.clearSession();
    setUser(null);
    setCurrentStore(null);
    // Redirect to LANDING instead of LOGIN
    setView(ViewState.LANDING);
    // setIsSidebarOpen(false); // No longer needed as Sidebar handles its own responsive state
  };

  const handleRecordSale = async (saleData: Omit<Sale, 'storeId' | 'soldBy'>) => {
    if (!currentStore || !user) return;
    
    const sale: Sale = {
      ...saleData,
      storeId: currentStore.id,
      soldBy: user.username
    };

    setIsLoading(true);
    await storage.recordSale(sale);
    // Refresh
    const newSales = await storage.getSales(currentStore.id);
    const newProducts = await storage.getProducts(currentStore.id);
    setSales(newSales);
    setProducts(newProducts);
    setIsLoading(false);
  };

  const handleSaveProduct = async (product: Product) => {
    if (!currentStore) return { success: false, message: 'No hay tienda seleccionada' };
    product.storeId = currentStore.id;
    
    setIsLoading(true);
    const result = await storage.saveProduct(product, currentStore);
    if (result.success) {
      const p = await storage.getProducts(currentStore.id);
      setProducts(p);
    }
    setIsLoading(false);
    return result;
  };

  const handleDeleteProduct = async (id: string) => {
    if(!currentStore) return;
    setIsLoading(true);
    await storage.deleteProduct(id);
    const p = await storage.getProducts(currentStore.id);
    setProducts(p);
    setIsLoading(false);
  };

  const handleStoreSelect = (store: Store) => {
    setCurrentStore(store);
    storage.setSessionStore(store.id);
    setView(ViewState.DASHBOARD);
  };

  const handleStoresRefresh = async () => {
    if (user) await loadUserStores(user);
  };

  const handleInventoryRefresh = async () => {
    if (currentStore) {
       setIsLoading(true);
       const p = await storage.getProducts(currentStore.id);
       setProducts(p);
       setIsLoading(false);
    }
  };

  // If no user is logged in, handle routing between Landing and Login
  if (!user) {
    if (view === ViewState.LANDING) {
      return <HomePage 
        onLogin={() => setView(ViewState.LOGIN)} 
        onRegister={() => setView(ViewState.REGISTER)} 
      />;
    }
    // Default to Login component (which handles register/recover internally)
    const loginInitialView = view === ViewState.REGISTER ? 'REGISTER' : 'LOGIN';
    return <Login 
      initialView={loginInitialView}
      onLogin={(u) => handleLogin(u)} 
      onBack={() => setView(ViewState.LANDING)} 
    />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 z-[60] bg-black/20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-4 rounded-full shadow-lg">
             <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        </div>
      )}

      {user.role === 'super_admin' ? (
         <>
          <Navbar 
            currentView={view} 
            setView={setView} 
            onLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            storeName="ADMIN PANEL"
            userRole={user.role}
          />
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            <div className="h-16 md:hidden flex-shrink-0" />
            <SuperAdminDashboard />
          </main>
         </>
      ) : (
        <>
          <Navbar 
            currentView={view} 
            setView={setView} 
            onLogout={handleLogout}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            storeName={currentStore?.name}
            userRole={user.role}
          />
          
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <div className="h-16 md:hidden flex-shrink-0" />
            
            {/* Added pb-24 for mobile bottom nav spacing */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
              <div className="fixed top-20 right-4 z-40 md:top-6 md:right-8">
                <InstallButton />
              </div>
              
              {view === ViewState.DASHBOARD && (
                <Dashboard sales={sales} products={products} />
              )}
              
              {view === ViewState.POS && (
                <POS 
                  products={products} 
                  onRecordSale={handleRecordSale} 
                  totalSalesCount={sales.length}
                />
              )}
              
              {view === ViewState.INVENTORY && currentStore && (
                <Inventory 
                  products={products} 
                  currentStore={currentStore}
                  onSave={handleSaveProduct}
                  onDelete={handleDeleteProduct}
                  onRefresh={handleInventoryRefresh}
                  businessType={user.businessType || 'retail'}
                />
              )}

              {view === ViewState.STORE_SETTINGS && user && (
                <StoreManager 
                  user={user} 
                  availableStores={userStores} 
                  currentStore={currentStore}
                  onSelectStore={handleStoreSelect}
                  onStoreCreated={handleStoresRefresh}
                />
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;