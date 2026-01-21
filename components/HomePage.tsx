import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, TrendingUp, Users, Star, Quote, ChevronRight, Store, ChefHat, Menu, X, Check, Globe, Shield, HardHat } from 'lucide-react';

interface HomePageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLogin, onRegister }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* --- FIXED NAVIGATION BAR --- */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50 transition-all supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 text-indigo-600 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200">
              <Store size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Tienda-Facil</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Características</button>
            <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Planes</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Testimonios</button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg hover:bg-indigo-50"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={onRegister}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all hover:scale-105 active:scale-95 border border-slate-700"
            >
              Comenzar Gratis
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-5">
            <div className="flex flex-col p-4 space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-left px-4 py-3 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Características</button>
              <button onClick={() => scrollToSection('pricing')} className="text-left px-4 py-3 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Planes</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-left px-4 py-3 hover:bg-slate-50 rounded-lg font-medium text-slate-700">Testimonios</button>
              <hr className="border-slate-100" />
              <button 
                onClick={onLogin}
                className="w-full text-center py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
              >
                Iniciar Sesión
              </button>
              <button 
                onClick={onRegister}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-md"
              >
                Comenzar Gratis
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-200/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wide shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Nueva Versión 2.0
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15]">
                Gestiona tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Negocio</span> <br/>
                Sin Complicaciones
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                La solución todo en uno para tiendas de abarrotes, boutiques y restaurantes. Controla inventario, ventas y empleados desde cualquier dispositivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={onRegister}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  Comenzar Gratis
                  <ArrowRight size={20} />
                </button>
                <button 
                  onClick={() => scrollToSection('features')}
                  className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm"
                >
                  Saber más
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 pt-6">
                 <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                       <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                     </div>
                   ))}
                 </div>
                 <div className="flex flex-col">
                    <div className="flex gap-0.5 text-amber-400">
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <span className="font-medium text-slate-600">+1,000 negocios felices</span>
                 </div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700 delay-200 hidden lg:block">
              {/* Abstract decorative shapes behind image area */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30 transform translate-x-10 translate-y-10"></div>
              
              <div className="relative grid grid-cols-2 gap-4">
                 <div className="space-y-4 mt-12">
                    <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform hover:-translate-y-2 transition-transform border border-slate-100">
                       <img 
                         src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400" 
                         alt="Retail Store" 
                         className="rounded-lg mb-3 h-32 w-full object-cover"
                       />
                       <div className="flex items-center gap-2 text-indigo-900 font-bold">
                         <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                            <ShoppingBag size={16} />
                         </div>
                         <span>Tiendas & Retail</span>
                       </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform hover:-translate-y-2 transition-transform border border-slate-100">
                       <div className="flex items-center justify-between mb-2">
                         <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                           <TrendingUp size={20} />
                         </div>
                         <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full text-xs">+125%</span>
                       </div>
                       <p className="font-bold text-slate-800 text-lg">Crecimiento</p>
                       <p className="text-xs text-slate-400">En ventas mensuales</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform hover:-translate-y-2 transition-transform border border-slate-100">
                       <div className="flex items-center justify-between mb-4">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                           <Users size={20} />
                         </div>
                         <div className="flex -space-x-1">
                           <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                           <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                         </div>
                       </div>
                       <p className="font-bold text-slate-800">Gestión de Equipos</p>
                       <p className="text-xs text-slate-400">Roles y permisos avanzados</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform hover:-translate-y-2 transition-transform border border-slate-100">
                       <img 
                         src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400" 
                         alt="Restaurant" 
                         className="rounded-lg mb-3 h-32 w-full object-cover"
                       />
                       <div className="flex items-center gap-2 text-indigo-900 font-bold">
                         <div className="p-1.5 bg-orange-100 rounded-md text-orange-600">
                            <ChefHat size={16} />
                         </div>
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
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs bg-indigo-50 px-3 py-1 rounded-full">Características</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">Todo lo que necesitas para crecer</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
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
              },
              {
                icon: <Users size={32} />,
                title: "Gestión de Personal",
                desc: "Crea cuentas para tus empleados, asigna roles y monitorea sus ventas individualmente.",
                color: "text-pink-600",
                bg: "bg-pink-50"
              },
              {
                icon: <Globe size={32} />,
                title: "Acceso Remoto",
                desc: "Tu negocio en la nube. Accede a la información de tu tienda desde cualquier lugar y dispositivo.",
                color: "text-teal-600",
                bg: "bg-teal-50"
              },
              {
                icon: <Shield size={32} />,
                title: "Seguro y Privado",
                desc: "Tus datos están encriptados y protegidos. Copias de seguridad automáticas diarias.",
                color: "text-orange-600",
                bg: "bg-orange-50"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-slate-50 p-8 rounded-2xl transition-all border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 group">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white to-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs bg-indigo-50 px-3 py-1 rounded-full">Planes y Precios</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4">Comienza gratis, crece sin límites</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Elige el plan que mejor se adapte a la etapa de tu negocio. Puedes cancelar o cambiar en cualquier momento.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800">Gratuito</h3>
                <p className="text-slate-500 text-sm mt-1">Para negocios que inician</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-slate-500">/mes</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  '1 Tienda',
                  'Hasta 5 Empleados',
                  '1,000 Productos',
                  'Punto de Venta Básico',
                  'Reportes de Ventas'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="p-0.5 bg-green-100 rounded-full text-green-600"><Check size={14} /></div> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onRegister} className="w-full py-3 px-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                Crear Cuenta Gratis
              </button>
            </div>

            {/* Basic Plan */}
            <div className="bg-white rounded-2xl p-8 border-2 border-indigo-500 shadow-2xl relative flex flex-col transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-b-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                Más Popular
              </div>
              <div className="mb-4 mt-2">
                <h3 className="text-xl font-bold text-indigo-900">Emprendedor</h3>
                <p className="text-slate-500 text-sm mt-1">Para negocios en crecimiento</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$199</span>
                <span className="text-slate-500">/mes (MXN)</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  '1 Tienda',
                  'Hasta 15 Empleados',
                  'Productos Ilimitados',
                  'Importación masiva (Excel)',
                  'Reportes Avanzados',
                  'Soporte Prioritario'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <div className="p-0.5 bg-indigo-100 rounded-full text-indigo-600"><Check size={14} /></div> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onRegister} className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                Elegir Emprendedor
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800">Empresarial</h3>
                <p className="text-slate-500 text-sm mt-1">Para múltiples sucursales</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">$499</span>
                <span className="text-slate-500">/mes (MXN)</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  'Múltiples Sucursales',
                  'Empleados Ilimitados',
                  'Todo lo de Emprendedor',
                  'Gestión Centralizada',
                  'API de Acceso',
                  'Soporte Dedicado 24/7'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="p-0.5 bg-amber-100 rounded-full text-amber-600"><Check size={14} /></div> {item}
                  </li>
                ))}
              </ul>
              <button onClick={onRegister} className="w-full py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Contactar Ventas
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials Section (Under Construction) */}
      <section id="testimonials" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-xs bg-indigo-50 px-3 py-1 rounded-full">Comunidad</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-4">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
             <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <HardHat size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Sección en Construcción</h3>
             <p className="text-slate-500 text-lg">
               Estamos recopilando las historias de éxito de nuestros primeros usuarios.
               <br/>
               ¡Pronto podrás ver cómo Tienda-Facil ayuda a negocios como el tuyo!
             </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 bg-indigo-900 text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         {/* Gradient overlay for bottom CTA */}
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 opacity-90"></div>
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
           <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Tu negocio, más eficiente y rentable desde hoy</h2>
           <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
             Deja atrás el lápiz y papel. Digitaliza tu inventario, agiliza tus ventas y toma decisiones inteligentes con datos reales. Todo lo que necesitas en una sola App.
           </p>
           <button 
             onClick={onRegister}
             className="px-10 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg shadow-xl shadow-indigo-900/50 hover:bg-indigo-50 hover:scale-105 transition-all"
           >
             Crear Cuenta Gratis Ahora
           </button>
           <p className="text-xs text-indigo-300 mt-4 flex items-center justify-center gap-2">
             <Check size={14} /> Plan gratuito de por vida • Sin tarjeta de crédito
           </p>
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
            <p className="text-sm max-w-xs leading-relaxed">
              La plataforma líder para la gestión de micro y pequeñas empresas en Latinoamérica. Diseñada por emprendedores, para emprendedores.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Características</button></li>
              <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Precios</button></li>
              <li><button onClick={() => scrollToSection('testimonials')} className="hover:text-white transition-colors">Clientes</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2024 Tienda-Facil. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;