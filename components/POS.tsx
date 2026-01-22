import React, { useState, useEffect } from 'react';
import { Product, CartItem, Sale } from '../types';
import { Plus, Minus, Trash2, CreditCard, Banknote, Search, ShoppingBag, Eye, X, QrCode, Globe } from 'lucide-react';

interface POSProps {
  products: Product[];
  onRecordSale: (sale: Omit<Sale, 'storeId' | 'soldBy'>) => void;
}

const POS: React.FC<POSProps> = ({ products, onRecordSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // State for "Processing Payment" modal
  const [isProcessingPayment, setIsProcessingPayment] = useState<{method: string, total: number} | null>(null);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const initiatePayment = (method: 'cash' | 'card' | 'paypal' | 'transfer') => {
    if (cart.length === 0) return;

    if (method === 'paypal' || method === 'transfer') {
      // Open modal for online payments
      setIsProcessingPayment({ method, total: cartTotal });
      return;
    }

    // Direct checkout for cash/card (simulated immediately)
    completeSale(method);
  };

  const completeSale = (method: 'cash' | 'card' | 'paypal' | 'transfer') => {
    const newSale: Omit<Sale, 'storeId' | 'soldBy'> = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      total: cartTotal,
      items: [...cart],
      paymentMethod: method
    };

    onRecordSale(newSale);
    setCart([]);
    setIsProcessingPayment(null);
    
    // Nice feedback message
    const methodNames: Record<string, string> = {
      cash: 'Efectivo', card: 'Tarjeta', paypal: 'PayPal', transfer: 'Mercado Pago / Transf.'
    };
    alert(`¡Venta registrada con éxito!\nMétodo: ${methodNames[method]}\nTotal: $${cartTotal.toFixed(2)}`);
  };

  const filteredProducts = products.filter(p => 
    (activeCategory === 'Todos' || p.category === activeCategory) &&
    (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 max-h-[calc(100vh-5rem)]">
      
      {/* Products Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Search & Filter */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o código..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20 lg:pb-0">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              role="button"
              className="group bg-white p-3 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left flex flex-col h-full transform cursor-pointer relative"
            >
              {/* Image Container with Quick View Trigger - Only renders if image exists */}
              {product.image && (
                <div 
                  className="w-full h-32 bg-slate-100 rounded-lg mb-3 overflow-hidden relative cursor-zoom-in"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingProduct(product);
                  }}
                >
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                   
                   {/* Overlay on Hover */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                   </div>

                   <div className="absolute top-1 right-1 bg-white/90 px-2 py-0.5 rounded text-xs font-bold shadow-sm text-slate-700">
                     Stock: {product.stock}
                   </div>
                </div>
              )}
              
              <div className="mb-1">
                 <div className="flex justify-between items-start">
                   <span className="text-xs font-bold text-slate-400 block">{product.code}</span>
                   {!product.image && (
                     <span className="text-xs font-bold text-slate-400 bg-slate-100 px-1 rounded">Stock: {product.stock}</span>
                   )}
                 </div>
                 <h3 className="font-semibold text-slate-800 leading-tight line-clamp-2">{product.name}</h3>
              </div>
              <p className="text-indigo-600 font-bold mt-auto pt-2 text-lg">${product.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar (Desktop) / Bottom Sheet (Mobile) */}
      <div className="lg:w-96 bg-white rounded-t-2xl lg:rounded-xl shadow-xl lg:shadow-sm border border-slate-200 flex flex-col fixed bottom-0 left-0 right-0 lg:static z-20 h-[60vh] lg:h-auto">
        <div className="p-4 border-b bg-slate-50 rounded-t-2xl lg:rounded-t-xl flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800">Orden Actual</h2>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm font-medium">
            {cart.reduce((acc, item) => acc + item.quantity, 0)} ítems
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag size={48} className="mb-2 opacity-50" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                  <p className="text-indigo-600 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded">
                    <Minus size={16} className="text-slate-500" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded">
                    <Plus size={16} className="text-slate-500" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600">Total</span>
            <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => initiatePayment('cash')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Banknote size={18} />
              <span>Efectivo</span>
            </button>
            <button 
              onClick={() => initiatePayment('card')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <CreditCard size={18} />
              <span>Tarjeta</span>
            </button>
            
            {/* New Payment Methods */}
            <button 
              onClick={() => initiatePayment('paypal')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-[#0070ba] text-white py-3 rounded-lg hover:bg-[#005ea6] disabled:opacity-50 transition-colors"
              title="Pagar con PayPal"
            >
              <Globe size={18} />
              <span>PayPal</span>
            </button>
            <button 
              onClick={() => initiatePayment('transfer')}
              disabled={cart.length === 0}
              className="flex items-center justify-center gap-2 bg-[#009ee3] text-white py-3 rounded-lg hover:bg-[#008bc7] disabled:opacity-50 transition-colors"
              title="Mercado Pago / Transferencia"
            >
              <QrCode size={18} />
              <span className="text-xs">MercadoPago</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {viewingProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setViewingProduct(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {viewingProduct.image && (
              <div className="relative h-64 bg-slate-100">
                <img 
                  src={viewingProduct.image} 
                  alt={viewingProduct.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setViewingProduct(null)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white text-slate-600 hover:text-slate-900 shadow-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            
            <div className="p-6">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded mb-2 inline-block">
                     {viewingProduct.category}
                   </span>
                   <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                     {viewingProduct.name}
                   </h2>
                   {/* Enhanced Code Display */}
                   <p className="text-sm text-slate-500 font-mono mt-1 flex items-center gap-2">
                     <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold text-xs">COD</span>
                     {viewingProduct.code}
                   </p>
                 </div>
                 <p className="text-2xl font-bold text-indigo-600">
                   ${viewingProduct.price.toFixed(2)}
                 </p>
               </div>
               
               <p className="text-slate-500 mb-6">
                 Stock disponible: <span className="font-medium text-slate-800">{viewingProduct.stock} unidades</span>
               </p>

               <button
                 onClick={() => {
                   addToCart(viewingProduct);
                   setViewingProduct(null);
                 }}
                 className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
               >
                 <Plus size={20} />
                 Agregar al Carrito
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Payment Simulator Modal */}
      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
              <div className="mb-4 flex justify-center">
                {isProcessingPayment.method === 'paypal' ? (
                   <div className="bg-blue-50 p-4 rounded-full text-[#0070ba]"><Globe size={48} /></div>
                ) : (
                   <div className="bg-blue-50 p-4 rounded-full text-[#009ee3]"><QrCode size={48} /></div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Cobro con {isProcessingPayment.method === 'paypal' ? 'PayPal' : 'Mercado Pago'}
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Muestra el código QR al cliente o envía el enlace de pago por un total de:
                <br/>
                <span className="text-2xl font-bold text-slate-900 block mt-2">${isProcessingPayment.total.toFixed(2)}</span>
              </p>

              {/* Simulation Actions */}
              <div className="space-y-3">
                 <button 
                   onClick={() => {
                      // Here you would normally open the real payment link
                      // window.open('https://paypal.me/tu_usuario/' + isProcessingPayment.total, '_blank');
                      alert("Simulación: Abriendo pasarela de pago en nueva pestaña...");
                   }}
                   className="w-full py-3 rounded-lg font-bold border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-2"
                 >
                   Generar / Abrir Enlace
                 </button>

                 <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500">Confirmación</span></div>
                 </div>

                 <button 
                   onClick={() => completeSale(isProcessingPayment.method as any)}
                   className="w-full py-3 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                 >
                   Confirmar Pago Recibido
                 </button>
                 
                 <button 
                   onClick={() => setIsProcessingPayment(null)}
                   className="w-full py-2 text-sm text-red-500 font-medium hover:underline"
                 >
                   Cancelar
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default POS;