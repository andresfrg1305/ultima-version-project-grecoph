
import { GrecophIcon } from '@/components/app/grecoph-icon';
import { LoginForm } from '@/components/app/login-form';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
            <Link href="/">
              <GrecophIcon className="mx-auto h-8 w-8 text-primary" />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight font-headline">
                Bienvenido de Vuelta
            </h1>
            <p className="text-sm text-muted-foreground">
                Ingresa tu email para acceder a tu portal
            </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          Al continuar, aceptas nuestros{' '}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Términos de Servicio
          </Link>{' '}
          y{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Política de Privacidad
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
