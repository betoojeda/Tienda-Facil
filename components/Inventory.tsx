import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Product, Store } from '../types';
import { Plus, Edit2, Trash, Save, X, Crown, FileSpreadsheet, AlertTriangle, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Filter, Loader2, ChevronLeft, ChevronRight, Package, UtensilsCrossed, Search, FileQuestion, Download } from 'lucide-react';
import { importProductsFromCSV, importProductsFromExcel, getSystemConfig } from '../services/storageService';

interface InventoryProps {
  products: Product[];
  currentStore: Store;
  onSave: (product: Product) => Promise<{ success: boolean, message?: string }>;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  businessType: 'restaurant' | 'retail';
}

type SortKey = keyof Product;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const Inventory: React.FC<InventoryProps> = ({ products, currentStore, onSave, onDelete, onRefresh, businessType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<{ code?: string, name?: string }>({}); // New state for field errors
  const [isSaving, setIsSaving] = useState(false);
  
  // Filtering & Sorting State
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State for Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Dynamic Free Limit
  const [freeLimit, setFreeLimit] = useState(1000);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFreeTier = currentStore.subscription === 'FREE';
  const productCount = products.length;

  // Terminology helpers
  const term = {
    title: businessType === 'restaurant' ? 'Menú' : 'Inventario',
    item: businessType === 'restaurant' ? 'Platillo' : 'Producto',
    new: businessType === 'restaurant' ? 'Nuevo Platillo' : 'Nuevo Producto',
    icon: businessType === 'restaurant' ? <UtensilsCrossed size={24} className="text-indigo-600" /> : <Package size={24} className="text-indigo-600" />
  };

  useEffect(() => {
    getSystemConfig().then(config => setFreeLimit(config.freeTierLimit));
  }, []);

  // --- Derived Data Logic ---

  // 1. Extract Unique Categories
  const categories = useMemo(() => {
    const unique = new Set(products.map(p => p.category || 'General'));
    return ['Todos', ...Array.from(unique)];
  }, [products]);

  // 2. Filter and Sort Products
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (filterCategory !== 'Todos') {
      result = result.filter(p => (p.category || 'General') === filterCategory);
    }

    // Filter by Search Text (Name or Code)
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        (p.code && p.code.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        // String Comparison (Case Insensitive)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }

        // Numeric Comparison
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, filterCategory, searchText, sortConfig]);

  // 3. Pagination Logic
  const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
  
  // Reset to page 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchText, sortConfig, products.length]);

  // Verify page validity (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedProducts, currentPage]);

  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setFilterCategory('Todos');
    setSearchText('');
    setSortConfig(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = filterCategory !== 'Todos' || sortConfig !== null || searchText !== '';

  const handleEdit = (product: Product) => {
    setErrorMessage('');
    setFormErrors({});
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsSaving(true);
      await onDelete(productToDelete.id);
      setIsSaving(false);
      setProductToDelete(null);
    }
  };

  const handleAdd = () => {
    setErrorMessage('');
    setFormErrors({});
    if (isFreeTier && productCount >= freeLimit) {
      alert(`Has alcanzado el límite de ${freeLimit} productos del plan GRATIS.`);
      return;
    }

    setEditingProduct({
      id: Date.now().toString(),
      code: '',
      name: '',
      costPrice: 0,
      price: 0,
      wholesalePrice: 0,
      stock: 0,
      minStock: 5,
      category: 'General',
      image: '' // No default image
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const code = editingProduct.code?.trim();
    const name = editingProduct.name?.trim();

    // Field Validation
    const newErrors: { code?: string, name?: string } = {};
    if (!code) newErrors.code = 'El código es obligatorio.';
    if (!name) newErrors.name = 'La descripción es obligatoria.';

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    const prodToSave = {
      ...editingProduct,
      code,
      name,
      price: editingProduct.price || 0,
      costPrice: editingProduct.costPrice || 0,
      wholesalePrice: editingProduct.wholesalePrice || 0,
      stock: editingProduct.stock || 0,
      minStock: editingProduct.minStock || 0
    };
    
    setIsSaving(true);
    const result = await onSave(prodToSave as Product);
    setIsSaving(false);
    
    if (result.success) {
      setIsModalOpen(false);
    } else {
      setErrorMessage(result.message || 'Error al guardar');
    }
  };

  // --- Generate and Download Template ---
  const handleDownloadTemplate = () => {
    const csvContent = 
`Codigo,Nombre,Costo,Precio,Mayoreo,Stock,Minimo,Categoria
EJ-001,Coca Cola 600ml,12.50,18.00,16.50,48,10,Bebidas
EJ-002,Sabritas Sal 45g,11.00,16.00,14.50,24,5,Botanas
EJ-003,Aceite 1L,35.00,45.00,42.00,20,5,Abarrotes
EJ-004,Galletas Marias,10.00,14.00,12.00,30,8,Galletas`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_productos_ejemplo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isFreeTier && productCount >= freeLimit) {
      alert(`Límite de productos (${freeLimit}) alcanzado en versión gratuita.`);
      return;
    }

    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isExcel = file.name.toLowerCase().match(/\.(xlsx|xls)$/);

    if (!isCSV && !isExcel) {
      alert("Formato no soportado.");
      return;
    }

    setIsSaving(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) return;

      let importResult = { imported: 0, errors: [] as string[] };

      if (isCSV) {
        importResult = await importProductsFromCSV(result as string, currentStore.id);
      } else {
        importResult = await importProductsFromExcel(result as ArrayBuffer, currentStore.id);
      }
      
      const { imported, errors } = importResult;
      
      let message = `Proceso finalizado.\n\n✅ Se importaron/actualizaron: ${imported} items.`;
      
      if (errors.length > 0) {
        message += `\n\n⚠️ Errores (${errors.length}):\n` + errors.slice(0, 3).join('\n') + (errors.length > 3 ? '...' : '');
      }

      alert(message);
      await onRefresh();
      setIsSaving(false);
    };

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: SortKey, align?: 'left' | 'right' | 'center' }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <th 
        className={`px-4 py-3 font-semibold text-slate-600 text-xs uppercase cursor-pointer hover:bg-slate-100 transition-colors select-none text-${align} group`}
        onClick={() => handleSort(sortKey)}
        title={`Ordenar por ${label}`}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
          {label}
          <span className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
            {isActive ? (
              sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-600" /> : <ArrowDown size={14} className="text-indigo-600" />
            ) : (
              <ArrowUpDown size={14} className="text-slate-400" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-lg">
             {term.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{term.title}</h1>
            <p className="text-slate-500">
              {productCount} {term.item}s cargados 
              {isFreeTier && <span className="text-amber-600 font-medium ml-2">(Límite: {freeLimit})</span>}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 flex-wrap items-center w-full xl:w-auto">
          {/* Search Box */}
          <div className="flex-1 xl:flex-none flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow min-w-[200px]">
             <Search size={16} className="text-slate-400" />
             <input 
              type="text" 
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent text-sm text-slate-700 outline-none w-full"
             />
          </div>

          {/* Category Filter */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-shadow">
            <Filter size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Categoría:</span>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-sm text-slate-700 font-medium outline-none cursor-pointer min-w-[120px]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <X size={16} />
              <span className="hidden sm:inline">Limpiar</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="flex gap-2">
            {/* Download Template Button */}
            <button 
              onClick={handleDownloadTemplate}
              className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-200 shadow-sm transition-colors text-sm border border-slate-200"
              title="Descargar Plantilla de Ejemplo"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Plantilla</span>
            </button>

            <div className="relative">
               <input 
                 type="file" 
                 accept=".csv, .xlsx, .xls" 
                 className="hidden" 
                 ref={fileInputRef}
                 onChange={handleFileUpload}
               />
               <button 
                 onClick={() => !isSaving && fileInputRef.current?.click()}
                 className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm transition-colors text-sm disabled:opacity-70"
                 disabled={isSaving}
                 title="Importar Excel o CSV"
               >
                 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                 <span className="hidden sm:inline">Importar</span>
               </button>
            </div>

            <button 
              onClick={handleAdd}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm ${
                isFreeTier && productCount >= freeLimit 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{term.new}</span>
            </button>
          </div>
        </div>
      </div>

      {isFreeTier && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <Crown size={20} />
            <span className="font-medium">Estás usando el Plan Gratuito.</span>
            <span className="text-sm">Máximo {freeLimit} {term.item.toLowerCase()}s.</span>
          </div>
          {productCount >= freeLimit && (
             <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-1 rounded">
               LÍMITE ALCANZADO
             </span>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1 relative">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <SortableHeader label="Código" sortKey="code" />
                <SortableHeader label="Descripción" sortKey="name" />
                <SortableHeader label="P. Costo" sortKey="costPrice" align="right" />
                <SortableHeader label="P. Venta" sortKey="price" align="right" />
                <SortableHeader label="P. Mayoreo" sortKey="wholesalePrice" align="right" />
                <SortableHeader label="Inv." sortKey="stock" align="center" />
                <SortableHeader label="Min." sortKey="minStock" align="center" />
                <SortableHeader label="Depto" sortKey="category" />
                <th className="px-4 py-3 font-semibold text-slate-600 text-xs uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="text-slate-200 mb-2" />
                      <p>No se encontraron items.</p>
                      {hasActiveFilters && (
                        <button onClick={handleResetFilters} className="text-indigo-600 text-sm mt-2 hover:underline">
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedProducts.map(product => {
                  // Determine low stock based on minStock (default 5 if not set)
                  const isLowStock = product.stock <= (product.minStock ?? 5);
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`transition-colors border-l-4 ${
                        isLowStock 
                          ? 'bg-red-50 hover:bg-red-100/50 border-l-red-500' 
                          : 'hover:bg-slate-50 border-l-transparent'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-mono text-slate-500">{product.code}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                         <div className="flex items-center gap-2">
                            {product.name}
                         </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500">${product.costPrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-slate-800">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-right text-slate-500">${product.wholesalePrice?.toFixed(2)}</td>
                      
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isLowStock && (
                            <div title="Stock Bajo" className="text-red-500 animate-pulse">
                              <AlertTriangle size={16} />
                            </div>
                          )}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isLowStock 
                              ? 'bg-white text-red-600 border-red-200 shadow-sm' 
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                       <td className="px-4 py-3 text-center text-xs text-slate-500">
                        {product.minStock}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{product.category}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => handleEdit(product)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(product)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Eliminar">
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
          <span className="text-sm text-slate-500">
            Mostrando {displayedProducts.length} de {processedProducts.length} {term.item.toLowerCase()}s
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-[80px] text-center">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form (Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {editingProduct.id ? `Editar ${term.item}` : term.new}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {errorMessage && (
                <div className="md:col-span-2 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {errorMessage}
                </div>
              )}

              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editingProduct.code || ''} 
                  onChange={e => {
                    setEditingProduct(p => ({...p, code: e.target.value}));
                    if(formErrors.code) setFormErrors(prev => ({...prev, code: undefined}));
                    if(errorMessage) setErrorMessage('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${formErrors.code ? 'border-red-500 bg-red-50' : ''}`}
                  placeholder="Ej: ABC-001"
                />
                {formErrors.code && (
                   <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                     <AlertCircle size={12} /> {formErrors.code}
                   </p>
                )}
              </div>

              <div className="md:col-span-1">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Departamento</label>
                 <input 
                  type="text" 
                  value={editingProduct.category || ''} 
                  onChange={e => setEditingProduct(p => ({...p, category: e.target.value}))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder={businessType === 'restaurant' ? "Ej: Bebidas" : "Ej: Abarrotes"}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Descripción (Nombre) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={editingProduct.name || ''} 
                  onChange={e => {
                    setEditingProduct(p => ({...p, name: e.target.value}));
                    if(formErrors.name) setFormErrors(prev => ({...prev, name: undefined}));
                    if(errorMessage) setErrorMessage('');
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${formErrors.name ? 'border-red-500 bg-red-50' : ''}`}
                />
                {formErrors.name && (
                   <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                     <AlertCircle size={12} /> {formErrors.name}
                   </p>
                )}
              </div>
              
              <div className="md:col-span-2 border-t pt-4 mt-2">
                 <h3 className="text-sm font-bold text-indigo-900 mb-3">Precios</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Precio Costo</label>
                <div className="relative">
                   <span className="absolute left-3 top-2 text-slate-400">$</span>
                   <input 
                    type="number" 
                    value={editingProduct.costPrice || ''} 
                    onChange={e => setEditingProduct(p => ({...p, costPrice: parseFloat(e.target.value)}))}
                    className="w-full pl-6 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Precio Venta</label>
                <div className="relative">
                   <span className="absolute left-3 top-2 text-slate-400">$</span>
                   <input 
                    type="number" 
                    value={editingProduct.price || ''} 
                    onChange={e => setEditingProduct(p => ({...p, price: parseFloat(e.target.value)}))}
                    className="w-full pl-6 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  />
                </div>
              </div>

               <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Precio Mayoreo</label>
                <div className="relative">
                   <span className="absolute left-3 top-2 text-slate-400">$</span>
                   <input 
                    type="number" 
                    value={editingProduct.wholesalePrice || ''} 
                    onChange={e => setEditingProduct(p => ({...p, wholesalePrice: parseFloat(e.target.value)}))}
                    className="w-full pl-6 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 border-t pt-4 mt-2">
                 <h3 className="text-sm font-bold text-indigo-900 mb-3">Control de Inventario</h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inventario Actual</label>
                <input 
                  type="number" 
                  value={editingProduct.stock || ''} 
                  onChange={e => setEditingProduct(p => ({...p, stock: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Inv. Mínimo (Alerta)</label>
                <input 
                  type="number" 
                  value={editingProduct.minStock || ''} 
                  onChange={e => setEditingProduct(p => ({...p, minStock: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

            </div>

            <div className="p-6 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border-2 border-red-100">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
               <div className="bg-red-100 p-2 rounded-full text-red-600">
                 <AlertCircle size={24} />
               </div>
               <h3 className="font-bold text-lg text-red-900">Eliminar {term.item}</h3>
            </div>
            
            <div className="p-6">
              <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                ¿Estás seguro de que deseas eliminar este {term.item.toLowerCase()} de forma permanente? Esta acción no se puede deshacer.
              </p>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6">
                <p className="font-bold text-slate-900 text-lg mb-1">{productToDelete.name}</p>
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>COD: {productToDelete.code}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setProductToDelete(null)}
                  disabled={isSaving}
                  className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Trash size={16} />}
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;