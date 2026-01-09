import { Product, Sale, User, Store, Role } from '../types';
import * as XLSX from 'xlsx';

// --- CONFIGURACIÓN PARA BASE DE DATOS REAL (GOOGLE FIREBASE) ---
// Para conectar a Firebase, cambia USE_CLOUD_DB a true y configura tus credenciales abajo.
const USE_CLOUD_DB = false; 

// const firebaseConfig = {
//   apiKey: "TU_API_KEY",
//   authDomain: "tu-app.firebaseapp.com",
//   projectId: "tu-app",
//   storageBucket: "tu-app.appspot.com",
//   messagingSenderId: "...",
//   appId: "..."
// };

// -------------------------------------------------------------

const USERS_KEY = 'tf_users';
const STORES_KEY = 'tf_stores';
const PRODUCTS_KEY = 'tf_products';
const SALES_KEY = 'tf_sales';
const CONFIG_KEY = 'tf_config';
const SESSION_USER_KEY = 'tf_session_user';
const SESSION_STORE_KEY = 'tf_session_store';

// Helper to simulate network (removed delay for better reliability)
const simulateNetwork = <T>(data: T): Promise<T> => {
  return Promise.resolve(data);
};

// Helper for safe JSON parsing
const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return fallback;
  }
};

// --- System Configuration ---
export const getSystemConfig = async () => {
  if (USE_CLOUD_DB) {
    return { freeTierLimit: 1000 }; 
  }
  const config = safeParse(CONFIG_KEY, { freeTierLimit: 1000 });
  return simulateNetwork(config);
};

export const updateSystemConfig = async (newConfig: { freeTierLimit: number }): Promise<void> => {
  const current = await getSystemConfig();
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...newConfig }));
  return simulateNetwork(undefined);
};

// --- Session Management (Local Browser Only) ---
export const setSessionUser = (userId: string) => localStorage.setItem(SESSION_USER_KEY, userId);

export const getSessionUser = async (): Promise<User | null> => {
  const userId = localStorage.getItem(SESSION_USER_KEY);
  if (!userId) return null;
  const users = await getUsers();
  return users.find(u => u.id === userId) || null;
};

export const setSessionStore = (storeId: string) => localStorage.setItem(SESSION_STORE_KEY, storeId);

export const getSessionStore = async (): Promise<Store | null> => {
  const storeId = localStorage.getItem(SESSION_STORE_KEY);
  if (!storeId) return null;
  const stores = await getStores();
  return stores.find(s => s.id === storeId) || null;
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_USER_KEY);
  localStorage.removeItem(SESSION_STORE_KEY);
};

// --- Global Stats ---
export const getGlobalStats = async () => {
  const users = await getUsers();
  const stores = await getStores();
  const allSales: Sale[] = safeParse(SALES_KEY, []);
  const config = await getSystemConfig();
  
  const totalRevenue = allSales.reduce((acc, curr) => acc + curr.total, 0);

  return simulateNetwork({
    totalUsers: users.length,
    totalStores: stores.length,
    totalSales: allSales.length,
    totalRevenue,
    freeTierLimit: config.freeTierLimit,
    storesList: stores.map(s => {
      const owner = users.find(u => u.id === s.ownerId);
      return { ...s, ownerName: owner?.username || 'Desconocido' };
    })
  });
};

// --- User Management ---

export const getUsers = async (): Promise<User[]> => {
  let users: User[] = safeParse(USERS_KEY, []);
  
  // Admin Check - Ensure Admin always exists and has correct password
  const adminUser: User = {
    id: 'admin_01',
    username: 'admin',
    password: 'admin', 
    role: 'super_admin'
  };

  const adminIndex = users.findIndex(u => u.role === 'super_admin');
  
  let needsUpdate = false;
  
  if (adminIndex === -1) {
    users.push(adminUser);
    needsUpdate = true;
  } else if (users[adminIndex].password !== adminUser.password) {
    users[adminIndex].password = adminUser.password;
    needsUpdate = true;
  }
  
  if (needsUpdate) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  
  return simulateNetwork(users);
};

export const registerUser = async (
  userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    businessType: 'restaurant' | 'retail';
  },
  role: Role = 'owner'
): Promise<User | null> => {
  const users = await getUsers();
  
  // Check for duplicate username
  if (users.find(u => u.username === userData.username)) {
    return null; 
  }
  
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More robust ID
    ...userData,
    role
  };
  
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return simulateNetwork(newUser);
};

export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  const users = await getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return simulateNetwork(user || null);
};

export const updateUserPassword = async (userId: string, newPassword: string): Promise<boolean> => {
  const users = await getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return simulateNetwork(true);
  }
  return simulateNetwork(false);
};

// --- Store Management ---

export const getStores = async (): Promise<Store[]> => {
  const stores: Store[] = safeParse(STORES_KEY, []);
  return simulateNetwork(stores);
};

export const createStore = async (name: string, ownerId: string): Promise<Store> => {
  const stores = await getStores();
  const newStore: Store = {
    id: `store_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    ownerId,
    staffUsernames: [],
    subscription: 'FREE',
    planId: 'free',
    createdAt: new Date().toISOString()
  };
  stores.push(newStore);
  localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  return simulateNetwork(newStore);
};

export const upgradeStoreSubscription = async (storeId: string, planId: string = 'pro_mxn'): Promise<void> => {
  const stores = await getStores();
  const index = stores.findIndex(s => s.id === storeId);
  if (index >= 0) {
    stores[index].subscription = 'PREMIUM';
    stores[index].planId = planId;
    stores[index].subscriptionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }
  await simulateNetwork(null);
};

export const getUserStores = async (user: User): Promise<Store[]> => {
  const stores = await getStores();
  if (user.role === 'super_admin') return stores;
  return stores.filter(s => s.ownerId === user.id || s.staffUsernames.includes(user.username));
};

export const addStaffToStore = async (storeId: string, staffUsername: string): Promise<{ success: boolean, message?: string }> => {
  const stores = await getStores();
  const storeIndex = stores.findIndex(s => s.id === storeId);
  const users = await getUsers();
  
  if (storeIndex === -1) return { success: false, message: 'Tienda no encontrada' };
  
  const staffUser = users.find(u => u.username === staffUsername);
  if (!staffUser) return { success: false, message: 'Usuario no encontrado' };

  const store = stores[storeIndex];

  // --- LIMIT CHECK ---
  if (store.subscription === 'FREE' && store.staffUsernames.length >= 5) {
    return { success: false, message: 'Límite de 5 empleados alcanzado. Mejora tu plan para añadir más.' };
  }
  
  // Custom limit for basic paid plan (Example: basic_mxn limit 15)
  if (store.planId === 'basic_mxn' && store.staffUsernames.length >= 15) {
     return { success: false, message: 'Límite de 15 empleados alcanzado en Plan Emprendedor.' };
  }

  if (!store.staffUsernames.includes(staffUsername)) {
    store.staffUsernames.push(staffUsername);
    stores[storeIndex] = store;
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  } else {
    return { success: false, message: 'Este usuario ya es empleado de la tienda.' };
  }

  await simulateNetwork(null);
  return { success: true };
};

// --- Data Management ---

export const getProducts = async (storeId: string): Promise<Product[]> => {
  const allProducts: Product[] = safeParse(PRODUCTS_KEY, []);
  return simulateNetwork(allProducts.filter(p => p.storeId === storeId));
};

export const saveProduct = async (product: Product, currentStore: Store): Promise<{ success: boolean, message?: string }> => {
  const allProducts: Product[] = safeParse(PRODUCTS_KEY, []);
  
  if (currentStore.subscription === 'FREE' && !product.id.includes('existing')) {
    const config = await getSystemConfig();
    const limit = config.freeTierLimit;
    
    const storeProductCount = allProducts.filter(p => p.storeId === currentStore.id).length;
    const isEditing = allProducts.some(p => p.id === product.id);
    
    if (!isEditing && storeProductCount >= limit) { 
      return { success: false, message: `Límite Gratuito Alcanzado (${limit} productos).` };
    }
  }
  
  const index = allProducts.findIndex(p => p.id === product.id);
  if (index >= 0) {
    allProducts[index] = product;
  } else {
    allProducts.push(product);
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(allProducts));
  return simulateNetwork({ success: true });
};

// --- Bulk Imports ---

export const importProductsFromExcel = async (arrayBuffer: ArrayBuffer, storeId: string): Promise<{ imported: number, errors: string[] }> => {
  let imported = 0;
  const errors: string[] = [];
  
  try {
    let allProducts: Product[] = safeParse(PRODUCTS_KEY, []);

    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const data: any[] = XLSX.utils.sheet_to_json(ws);

    if (!data || data.length === 0) {
      return { imported: 0, errors: ['El archivo Excel parece estar vacío.'] };
    }

    const parseNum = (val: any) => {
       if (typeof val === 'number') return val;
       if (!val) return 0;
       const str = String(val).replace(/[^0-9.-]/g, ''); 
       const num = parseFloat(str);
       return isNaN(num) ? 0 : num;
    };

    const getValue = (row: any, keys: string[]) => {
      const rowKeys = Object.keys(row);
      for (const k of keys) {
        const foundKey = rowKeys.find(rk => rk.trim().toLowerCase() === k.toLowerCase());
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    data.forEach((row, index) => {
      const code = getValue(row, ['codigo', 'code', 'id', 'sku', 'referencia', 'ref', 'código']);
      const name = getValue(row, ['descripcion', 'description', 'nombre', 'name', 'producto', 'articulo', 'descripción', 'ítem', 'item']);

      if (!code || !name) {
         if(!code) errors.push(`Fila ${index + 2}: Ignorada. Falta 'Código'.`);
         else if(!name) errors.push(`Fila ${index + 2}: Ignorada. Falta 'Descripción'.`);
         return;
      }

      const newProduct: Product = {
        id: `xls_${Date.now()}_${index}`,
        storeId: storeId,
        code: String(code).trim(),
        name: String(name).trim(),
        costPrice: parseNum(getValue(row, ['costo', 'cost', 'precio costo', 'costprice', 'compra', 'precio compra'])),
        price: parseNum(getValue(row, ['precio', 'price', 'venta', 'precio venta', 'pvp', 'valor', 'importe'])),
        wholesalePrice: parseNum(getValue(row, ['mayoreo', 'wholesale', 'precio mayoreo', 'mayorista'])),
        stock: Math.floor(parseNum(getValue(row, ['stock', 'inventario', 'cantidad', 'qty', 'existencia', 'unidades']))),
        minStock: Math.floor(parseNum(getValue(row, ['minimo', 'min', 'alert', 'inv minimo', 'alerta', 'minima']))),
        category: String(getValue(row, ['categoria', 'category', 'departamento', 'depto', 'familia', 'grupo']) || 'General').trim(),
        image: ''
      };

      const existingIndex = allProducts.findIndex(p => p.storeId === storeId && p.code === newProduct.code);
      if (existingIndex >= 0) {
        allProducts[existingIndex] = { ...allProducts[existingIndex], ...newProduct, id: allProducts[existingIndex].id };
      } else {
        allProducts.push(newProduct);
      }
      imported++;
    });

    if (imported > 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(allProducts));
    }
  } catch (err) {
    console.error(err);
    errors.push("Error crítico al leer Excel. Verifica el formato.");
  }
  
  return simulateNetwork({ imported, errors });
};

export const importProductsFromCSV = async (csvText: string, storeId: string): Promise<{ imported: number, errors: string[] }> => {
  const lines = csvText.split(/\r?\n/);
  let allProducts: Product[] = safeParse(PRODUCTS_KEY, []);
  
  let imported = 0;
  const errors: string[] = [];
  const firstLine = lines[0] ? lines[0].toLowerCase() : '';
  const startIndex = (firstLine.includes('codigo') || firstLine.includes('code')) ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      const code = parts[0];
      const name = parts[1];

      if (!code || !name) continue;

      const parseNum = (val: string) => {
        if (!val) return 0;
        const num = parseFloat(val.replace(/[$,]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      const newProduct: Product = {
        id: `csv_${Date.now()}_${i}`,
        storeId: storeId,
        code: code,
        name: name,
        costPrice: parseNum(parts[2]),
        price: parseNum(parts[3]),
        wholesalePrice: parseNum(parts[4]),
        stock: Math.floor(parseNum(parts[5])),
        minStock: Math.floor(parseNum(parts[6])),
        category: parts[7] || 'General',
        image: ''
      };
      
      const existingIndex = allProducts.findIndex(p => p.storeId === storeId && p.code === newProduct.code);
      if (existingIndex >= 0) {
        allProducts[existingIndex] = { ...allProducts[existingIndex], ...newProduct, id: allProducts[existingIndex].id };
      } else {
        allProducts.push(newProduct);
      }
      imported++;
    } catch (err) {
      errors.push(`Línea ${i + 1}: Error formato.`);
    }
  }
  
  if (imported > 0) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(allProducts));
  }
  return simulateNetwork({ imported, errors });
};

export const deleteProduct = async (productId: string): Promise<void> => {
  let allProducts: Product[] = safeParse(PRODUCTS_KEY, []);
  allProducts = allProducts.filter(p => p.id !== productId);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(allProducts));
  await simulateNetwork(null);
};

export const getSales = async (storeId: string): Promise<Sale[]> => {
  const allSales: Sale[] = safeParse(SALES_KEY, []);
  return simulateNetwork(allSales.filter(s => s.storeId === storeId));
};

export const recordSale = async (sale: Sale): Promise<void> => {
  const allSales: Sale[] = safeParse(SALES_KEY, []);
  allSales.push(sale);
  localStorage.setItem(SALES_KEY, JSON.stringify(allSales));

  let allProducts: Product[] = safeParse(PRODUCTS_KEY, []);
  
  sale.items.forEach(item => {
    const productIndex = allProducts.findIndex(p => p.id === item.id);
    if (productIndex >= 0) {
      allProducts[productIndex].stock = Math.max(0, allProducts[productIndex].stock - item.quantity);
    }
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(allProducts));
  await simulateNetwork(null);
};