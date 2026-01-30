import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie, Legend } from 'recharts';
import { Sale, Product } from '../types';
import { DollarSign, ShoppingBag, TrendingUp, Calendar, Package, Users, Filter, Download, ChevronDown, Award } from 'lucide-react';
import * as XLSX from 'xlsx';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
}

type DateRange = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'all';
type Tab = 'overview' | 'products' | 'employees';

const Dashboard: React.FC<DashboardProps> = ({ sales, products }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('thisMonth');
  
  // --- Filtering Logic ---
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7DaysStart = new Date();
    last7DaysStart.setDate(now.getDate() - 7);

    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      switch (dateRange) {
        case 'today': return saleDate >= todayStart;
        case 'yesterday': return saleDate >= yesterdayStart && saleDate < todayStart;
        case 'last7': return saleDate >= last7DaysStart;
        case 'thisMonth': return saleDate >= monthStart;
        case 'all': return true;
        default: return true;
      }
    });
  }, [sales, dateRange]);

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = filteredSales.length;
    
    // Group by date for chart
    const salesByDate = filteredSales.reduce((acc, sale) => {
      const date = new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) acc[date] = 0;
      acc[date] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    // Ensure chronological order for charts
    const chartData = Object.keys(salesByDate)
      .sort((a, b) => {
         const [da, ma] = a.split('/').map(Number);
         const [db, mb] = b.split('/').map(Number);
         return (ma - mb) || (da - db);
      })
      .map(date => ({
        date,
        total: salesByDate[date]
      }));

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, chartData, averageTicket };
  }, [filteredSales]);

  // --- Product Performance Logic ---
  const productStats = useMemo(() => {
    const productMap: Record<string, { name: string, qty: number, revenue: number, code: string }> = {};

    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = { name: item.name, qty: 0, revenue: 0, code: item.code };
        }
        productMap[item.id].qty += item.quantity;
        productMap[item.id].revenue += (item.price * item.quantity);
      });
    });

    return Object.values(productMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // --- Employee Performance Logic ---
  const employeeStats = useMemo(() => {
    const empMap: Record<string, { name: string, orders: number, revenue: number }> = {};

    filteredSales.forEach(sale => {
      const seller = sale.soldBy || 'Desconocido';
      if (!empMap[seller]) {
        empMap[seller] = { name: seller, orders: 0, revenue: 0 };
      }
      empMap[seller].orders += 1;
      empMap[seller].revenue += sale.total;
    });

    return Object.values(empMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales]);

  // --- Stock Logic (Global, not filtered by date) ---
  const stockData = useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || 'Sin Categoría';
      categories[cat] = (categories[cat] || 0) + p.stock;
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      stock: categories[cat]
    })).sort((a, b) => b.stock - a.stock);
  }, [products]);

  // --- Export Function ---
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: General Stats
    const wsStats = XLSX.utils.json_to_sheet([
      { Metrica: "Ingresos Totales", Valor: stats.totalRevenue },
      { Metrica: "Total Ordenes", Valor: stats.totalOrders },
      { Metrica: "Ticket Promedio", Valor: stats.averageTicket }
    ]);
    XLSX.utils.book_append_sheet(wb, wsStats, "Resumen");

    // Sheet 2: Sales Detail
    const flatSales = filteredSales.map(s => ({
      ID: s.id,
      Fecha: new Date(s.date).toLocaleString(),
      Vendedor: s.soldBy,
      Metodo: s.paymentMethod,
      Total: s.total,
      Items: s.items.length
    }));
    const wsSales = XLSX.utils.json_to_sheet(flatSales);
    XLSX.utils.book_append_sheet(wb, wsSales, "Ventas");

    // Sheet 3: Products
    const wsProducts = XLSX.utils.json_to_sheet(productStats);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Por Producto");

    XLSX.writeFile(wb, `Reporte_TiendaFacil_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  // --- UI Components ---

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Reportes y Estadísticas</h1>
           <p className="text-slate-500">Analiza el rendimiento de tu negocio</p>
         </div>

         <div className="flex flex-wrap gap-2">
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex items-center">
               <Calendar size={16} className="text-slate-400 ml-2 mr-1" />
               <select 
                 value={dateRange} 
                 onChange={(e) => setDateRange(e.target.value as DateRange)}
                 className="bg-transparent text-sm font-medium text-slate-700 p-2 outline-none cursor-pointer"
               >
                 <option value="today">Hoy</option>
                 <option value="yesterday">Ayer</option>
                 <option value="last7">Últimos 7 Días</option>
                 <option value="thisMonth">Este Mes</option>
                 <option value="all">Todo el Historial</option>
               </select>
            </div>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm font-medium text-sm"
            >
              <Download size={16} /> Exportar Excel
            </button>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ingresos (Periodo)" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign size={24} className="text-green-600" />} 
          color="bg-green-100" 
        />
        <StatCard 
          title="Órdenes Totales" 
          value={stats.totalOrders} 
          icon={<ShoppingBag size={24} className="text-blue-600" />} 
          color="bg-blue-100" 
        />
        <StatCard 
          title="Ticket Promedio" 
          value={`$${stats.averageTicket.toFixed(2)}`} 
          icon={<TrendingUp size={24} className="text-purple-600" />} 
          color="bg-purple-100" 
        />
        <StatCard 
          title="Productos Diferentes" 
          value={productStats.length} 
          icon={<Package size={24} className="text-orange-600" />} 
          color="bg-orange-100" 
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
         <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
               Resumen General
            </button>
            <button 
              onClick={() => setActiveTab('products')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
               Ventas por Producto
            </button>
            <button 
              onClick={() => setActiveTab('employees')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'employees' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
               Rendimiento Empleados
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div>
         {activeTab === 'overview' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Tendencia de Ventas (Periodo)</h3>
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">Sin datos en este periodo</div>
                )}
              </div>

              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Ingresos Diarios</h3>
                {stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-slate-400">Sin datos en este periodo</div>
                )}
              </div>

              {/* Stock Chart (Always visible context) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 lg:col-span-2">
                 <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                   <Package size={20} className="text-indigo-600" />
                   Stock Actual por Categoría
                 </h3>
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
                      {stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>
         )}

         {activeTab === 'products' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                     <tr>
                       <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Código</th>
                       <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Producto</th>
                       <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Unidades Vendidas</th>
                       <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Ingresos Generados</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {productStats.length === 0 ? (
                       <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No hay ventas registradas en este periodo.</td></tr>
                     ) : (
                       productStats.map((item, idx) => (
                         <tr key={idx} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-xs font-mono text-slate-500">{item.code || '-'}</td>
                           <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                           <td className="px-6 py-4 text-center">
                             <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{item.qty}</span>
                           </td>
                           <td className="px-6 py-4 text-right font-bold text-slate-800">${item.revenue.toFixed(2)}</td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
              </div>
           </div>
         )}

         {activeTab === 'employees' && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee Cards */}
              {employeeStats.map((emp, idx) => (
                 <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:border-indigo-300 transition-colors relative overflow-hidden">
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 bg-amber-100 text-amber-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                         <Award size={14} /> Top #1
                      </div>
                    )}
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-4">
                       {emp.name.substring(0,2).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{emp.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{emp.orders} órdenes procesadas</p>
                    
                    <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-100">
                       <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ventas Totales</p>
                       <p className="text-xl font-bold text-green-600">${emp.revenue.toFixed(2)}</p>
                    </div>
                 </div>
              ))}
              
              {employeeStats.length === 0 && (
                 <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <Users size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500">No hay datos de empleados para este periodo.</p>
                 </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;