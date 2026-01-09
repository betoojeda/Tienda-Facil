import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Sale, Product } from '../types';
import { DollarSign, ShoppingBag, TrendingUp, Calendar, Package } from 'lucide-react';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales, products }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    
    // Group by date for chart
    const salesByDate = sales.reduce((acc, sale) => {
      const date = new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) acc[date] = 0;
      acc[date] += sale.total;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.keys(salesByDate).map(date => ({
      date,
      total: salesByDate[date]
    })).slice(-7); // Last 7 days with data

    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, chartData, averageTicket };
  }, [sales]);

  // Stock Data Logic
  const stockData = useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category || 'Sin Categoría';
      categories[cat] = (categories[cat] || 0) + p.stock;
    });

    return Object.keys(categories).map(cat => ({
      name: cat,
      stock: categories[cat]
    })).sort((a, b) => b.stock - a.stock); // Sort by highest stock
  }, [products]);

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

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
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resumen del Negocio</h1>
        <p className="text-slate-500">Vista general de rendimiento</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Ventas Totales" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
          icon={<DollarSign size={24} className="text-green-600" />} 
          color="bg-green-100" 
        />
        <StatCard 
          title="Órdenes" 
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
          title="Última Venta" 
          value={sales.length > 0 ? new Date(sales[sales.length - 1].date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'} 
          icon={<Calendar size={24} className="text-orange-600" />} 
          color="bg-orange-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Tendencia de Ventas</h3>
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
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80">
           <h3 className="text-lg font-semibold mb-4 text-slate-800">Ingresos Diarios</h3>
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
        </div>

        {/* New Inventory Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-80 lg:col-span-2">
           <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
             <Package size={20} className="text-indigo-600" />
             Stock por Categoría
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
    </div>
  );
};

export default Dashboard;