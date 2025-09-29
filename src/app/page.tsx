
import { GrecophIcon } from '@/components/app/grecoph-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, GanttChartSquare, Users, Building, ShieldCheck, MessageCircleHeart, Twitter, Linkedin, Facebook } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


export default function LandingPage() {
  // const heroImage = placeholderImages.find(p => p.id === 'hero-1');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navbar */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
          <GrecophIcon className="h-6 w-6 text-primary" />
          <span className="ml-2 font-semibold text-lg">Grecoph</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Características
          </Link>
           <Link
            href="#benefits"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Beneficios
          </Link>
           <Link
            href="#testimonials"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Testimonios
          </Link>
          <Button asChild variant="default">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
        </nav>
         <Button asChild variant="outline" className="md:hidden ml-auto">
            <Link href="/login">Iniciar Sesión</Link>
        </Button>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-700/25 bg-[size:20px_20px] opacity-20"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    🏠 Conjunto Residencial El Trébol - Manzana 5, Mosquera, Cundinamarca
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none font-headline">
                    <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                      Grecoph
                    </span>
                    <br />
                    <span className="text-2xl sm:text-3xl xl:text-4xl font-normal text-slate-600 dark:text-slate-400">
                      Para el Trébol Mz5
                    </span>
                  </h1>
                  <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-4">
                    Gestión de Proyectos y Control de Parqueaderos en Propiedad Horizontal
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    La plataforma digital exclusiva para nuestro conjunto residencial en Mosquera. Gestiona parqueaderos con rotación sistemática y equitativa, visualiza los proyectos en curso, y mantiene una comunicación perfecta entre todos los residentes de la Manzana 5.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Button asChild size="lg" className="text-lg shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/login">
                      🚀 Acceder al Portal
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg">
                    <Link href="#features">
                      Conocer Más
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-slate-200/50 to-slate-300/30 dark:from-slate-700/50 dark:to-slate-600/30 rounded-2xl blur-2xl"></div>
                <Image
                    src="/propiedad-horizontal-2.jpeg"
                    alt="Conjunto Residencial El Trébol Manzana 5 - Comunidad moderna y organizada"
                    width={600}
                    height={600}
                    className="mx-auto aspect-square overflow-hidden rounded-xl object-cover shadow-2xl border border-slate-200 dark:border-slate-700 relative"
                />
                <div className="absolute -bottom-4 -right-4 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 px-3 py-1 rounded-full text-sm font-medium">
                  El Trébol Mz5
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Características Principales</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Todo lo que necesitas para tu comunidad</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Asignación de parqueaderos y gestión de proyectos, Grecoph simplifica la administración.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="text-center">
                <CardHeader>
                    <Car className="h-10 w-10 text-primary mx-auto mb-4" />
                    <CardTitle className="text-xl font-medium">
                        Control de Parqueaderos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Sistema de rotación mensual equitativa de parqueaderos. mismas condiciones que antes pero ahora en una plataforma digital y moderna que nos permite minimizar el factor humano y los procesos manuales.</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                    <GanttChartSquare className="h-10 w-10 text-primary mx-auto mb-4" />
                    <CardTitle className="text-xl font-medium">
                        Gestión de Proyectos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Visualiza los proyectos de tu conjunto y sigue el progreso de cada iniciativa de forma transparente y democrática.</p>
                </CardContent>
              </Card>
               <Card className="text-center">
                <CardHeader>
                    <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                    <CardTitle className="text-xl font-medium">
                        Comunicación Directa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Envía notificaciones importantes a todos los residentes o a personas específicas. Mantén a tu comunidad informada y conectada.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
            <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Nuestros Beneficios</div>
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">¿Por qué elegir Grecoph?</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Ahorra tiempo, reduce costos y mejora la convivencia en tu propiedad horizontal.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-8 py-12 lg:grid-cols-2 xl:grid-cols-4">
                    <div className="flex items-center gap-4">
                        <Building className="h-12 w-12 text-primary"/>
                        <div>
                            <h3 className="text-lg font-bold">Centralización Total</h3>
                            <p className="text-muted-foreground">Toda la gestión administrativa y de comunicación en un solo lugar, accesible 24/7.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <ShieldCheck className="h-12 w-12 text-primary"/>
                        <div>
                            <h3 className="text-lg font-bold">Transparencia y Confianza</h3>
                            <p className="text-muted-foreground">Procesos de votación y asignación claros que generan confianza entre los residentes.</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                         <MessageCircleHeart className="h-12 w-12 text-primary"/>
                         <div>
                             <h3 className="text-lg font-bold">Mejora la Convivencia</h3>
                             <p className="text-muted-foreground">Facilita la comunicación y la toma de decisiones, fortaleciendo el sentido de comunidad.</p>
                         </div>
                     </div>
                      <div className="flex items-center gap-4">
                         <Car className="h-12 w-12 text-primary"/>
                         <div>
                             <h3 className="text-lg font-bold">Rotación Equitativa</h3>
                             <p className="text-muted-foreground">Sistema de rotación mensual que garantiza acceso justo a parqueaderos para todos los residentes que lo necesitan.</p>
                         </div>
                     </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
              <div className="container max-w-6xl mx-auto grid items-center justify-center gap-4 px-4 text-center md:px-6">
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Lo que dicen nuestros usuarios</h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Administradores y residentes felices que han transformado su comunidad con Grecoph.
                    </p>
                </div>
                <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6 pt-8">
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground mb-4">"Grecoph ha transformado completamente la administración de nuestro conjunto. el control de parqueaderos ahora es mas eficiente y por un poco menos de trabajo."</p>
                            <div className="font-semibold">Carlos González</div>
                            <div className="text-xs text-muted-foreground">Administrador, El Trébol Mz5</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground mb-4">"Ahora puedo observar que ideas o recursos se plantearon en la asamblea desde casa. Proyectos en votación hasta propuestas futuras."</p>
                            <div className="font-semibold">Alexander Rodríguez</div>
                            <div className="text-xs text-muted-foreground">Residente, El Trébol Mz5</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-6">
                            <p className="text-muted-foreground mb-4">"La comunicación es perfecta. Recibo notificaciones, información acerca de mi asignación de parqueadero e incluso puedo ver los proyectos en curso de mi conjunto, es perfecto... Todo desde un solo lugar y desde la comodidad de mi casa."</p>
                            <div className="font-semibold">Laura Martínez</div>
                            <div className="text-xs text-muted-foreground">Consejo de Administración, El Trébol Mz5</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t py-8">
        <div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-between">
                <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start">
                        <GrecophIcon className="h-8 w-8 text-primary" />
                        <span className="ml-3 text-xl font-semibold">Grecoph</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Simplificando la vida en comunidad.</p>
                </div>
                <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
                    <h5 className="font-bold mb-2">Contacto</h5>
                    <p className="text-sm text-muted-foreground">Mosquera, Cundinamarca, Colombia</p>
                    <p className="text-sm text-muted-foreground">Conjunto Residencial El Trébol Mz5</p>
                    <p className="text-sm text-muted-foreground">adminmz5@grecoph.com</p>
                    <p className="text-sm text-muted-foreground">(+57) 322-447-0907</p>
                </div>
                <div className="w-full md:w-1/3 text-center md:text-right">
                    <h5 className="font-bold mb-2">Síguenos</h5>
                    <div className="flex justify-center md:justify-end space-x-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter/></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook/></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin/></Link>
                    </div>
                </div>
            </div>
            <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center">
                <p className="text-xs text-muted-foreground">&copy; 2024 Grecoph. Todos los derechos reservados.</p>
                <nav className="flex gap-4 sm:gap-6 mt-4 sm:mt-0">
                    <Link href="#" className="text-xs hover:underline underline-offset-4">Términos de Servicio</Link>
                    <Link href="#" className="text-xs hover:underline underline-offset-4">Política de Privacidad</Link>
                </nav>
            </div>
        </div>
      </footer>
    </div>
  );
}

    