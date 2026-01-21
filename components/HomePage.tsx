import React from 'react';
import { ArrowRight, ShoppingBag, TrendingUp, Users, Star, Quote, ChevronRight, Store, ChefHat } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-indigo-600">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Store size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Tienda-Facil</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          Iniciar Sesión
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
                Gestiona tu <span className="text-indigo-600">Negocio</span> <br/>
                Sin Complicaciones
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                La solución todo en uno para tiendas de abarrotes, boutiques y restaurantes. Controla inventario, ventas y empleados desde cualquier dispositivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Comenzar Gratis
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                >
                  Saber más
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
                 <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                     </div>
                   ))}
                 </div>
                 <p>+1,000 negocios confían en nosotros</p>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200 hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30 transform translate-x-10 translate-y-10"></div>
              <div className="relative grid grid-cols-2 gap-4">
                 <div className="space-y-4 mt-8">
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-transform">
                       <img 
                         src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400" 
                         alt="Retail Store" 
                         className="rounded-lg mb-3 h-32 w-full object-cover"
                       />
                       <div className="flex items-center gap-2 text-indigo-900 font-bold">
                         <ShoppingBag size={18} />
                         <span>Tiendas & Retail</span>
                       </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-transform">
                       <div className="flex items-center justify-between mb-2">
                         <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                           <TrendingUp />
                         </div>
                         <span className="text-green-600 font-bold">+125%</span>
                       </div>
                       <p className="font-medium text-slate-800">Crecimiento en Ventas</p>
                       <p className="text-xs text-slate-400">Promedio mensual</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-transform">
                       <div className="flex items-center justify-between mb-2">
                         <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                           <Users />
                         </div>
                         <div className="flex -space-x-1">
                           <div className="w-6 h-6 rounded-full bg-slate-200 border border-white"></div>
                           <div className="w-6 h-6 rounded-full bg-slate-300 border border-white"></div>
                         </div>
                       </div>
                       <p className="font-medium text-slate-800">Gestión de Equipos</p>
                       <p className="text-xs text-slate-400">Roles y permisos</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xl transform hover:-translate-y-2 transition-transform">
                       <img 
                         src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400" 
                         alt="Restaurant" 
                         className="rounded-lg mb-3 h-32 w-full object-cover"
                       />
                       <div className="flex items-center gap-2 text-indigo-900 font-bold">
                         <ChefHat size={18} />
                         <span>Restaurantes</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Dejamos atrás las hojas de cálculo y los cuadernos. Tienda-Facil te da el poder de las grandes cadenas en una app simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShoppingBag size={32} />,
                title: "Punto de Venta Ágil",
                desc: "Registra ventas en segundos, escanea códigos y genera tickets digitales o impresos al instante.",
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                icon: <Store size={32} />,
                title: "Control de Inventario",
                desc: "Nunca más te quedes sin stock. Alertas automáticas y gestión de costos y precios de mayoreo.",
                color: "text-indigo-600",
                bg: "bg-indigo-50"
              },
              {
                icon: <TrendingUp size={32} />,
                title: "Reportes Inteligentes",
                desc: "Visualiza tus ganancias, productos más vendidos y rendimiento de empleados en tiempo real.",
                color: "text-purple-600",
                bg: "bg-purple-50"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Testimonios</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-2">Lo que dicen nuestros clientes</h2>
            </div>
            <div className="flex gap-2">
               <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-400">
                 <ChevronRight className="rotate-180" />
               </button>
               <button className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600">
                 <ChevronRight />
               </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María González",
                role: "Dueña de 'Abarrotes La Esquina'",
                img: "https://i.pravatar.cc/150?img=32",
                text: "Desde que uso esta app, sé exactamente cuánto gano al día. Antes perdía dinero en inventario hormiga, ahora tengo el control total."
              },
              {
                name: "Carlos Méndez",
                role: "Gerente 'Burger Kingo'",
                img: "https://i.pravatar.cc/150?img=11",
                text: "La función para meseros y la cocina es increíble. Agilizó nuestro servicio un 40% y los clientes están más felices."
              },
              {
                name: "Ana Torres",
                role: "Boutique 'Estilo Único'",
                img: "https://i.pravatar.cc/150?img=5",
                text: "Poder ver mis ventas desde mi celular cuando no estoy en la tienda me da una tranquilidad enorme. 100% recomendada."
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative">
                <Quote className="absolute top-8 right-8 text-indigo-100" size={40} />
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-slate-700 italic mb-6 relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-indigo-900 text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Listo para transformar tu negocio?</h2>
           <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
             Únete a miles de emprendedores que ya están digitalizando sus tiendas. Empieza gratis hoy mismo.
           </p>
           <button 
             onClick={onGetStarted}
             className="px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-xl hover:bg-indigo-50 hover:scale-105 transition-all"
           >
             Crear mi cuenta gratis
           </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-white mb-4">
              <Store size={24} />
              <span className="text-xl font-bold">Tienda-Facil</span>
            </div>
            <p className="text-sm max-w-xs">
              La plataforma líder para la gestión de micro y pequeñas empresas en Latinoamérica.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Características</a></li>
              <li><a href="#" className="hover:text-white">Precios</a></li>
              <li><a href="#" className="hover:text-white">Guías</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Privacidad</a></li>
              <li><a href="#" className="hover:text-white">Términos</a></li>
              <li><a href="#" className="hover:text-white">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © 2024 Tienda-Facil. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
