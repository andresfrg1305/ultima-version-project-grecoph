
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import type { ResidentData } from './client';
import { createResident } from '../_actions/manage-residents';

const formSchema = z.object({
  fullName: z.string().min(3, 'El nombre completo es requerido.'),
  email: z.string().email('Debe ser un email válido.'),
  phone: z.string().min(10, 'El teléfono debe tener 10 dígitos.').max(10, 'El teléfono debe tener 10 dígitos.'),
  houseNumber: z.string().min(1, 'La vivienda es requerida.'),
  interiorNumber: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().min(1, 'El interior debe ser mayor a 0.').max(8, 'El interior debe ser máximo 8.')
  ),
  licensePlate: z.string().optional().or(z.literal('')).refine(val => !val || /^[A-Z]{3}-\d{3}$/.test(val), {
    message: "La placa debe tener el formato ABC-123 o estar vacía.",
  }),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
}).refine(data => {
    if (data.licensePlate) {
        return !!data.brand && !!data.model && !!data.color;
    }
    return true;
}, {
    message: 'Si agregas una placa, debes completar todos los campos del vehículo.',
    path: ['brand'], // Attach error to a specific field
});

type ResidentFormValues = z.infer<typeof formSchema>;

interface ResidentFormProps {
  onResidentCreated: (resident: ResidentData) => void;
}

export function ResidentForm({ onResidentCreated }: ResidentFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVehicleSectionOpen, setIsVehicleSectionOpen] = useState(false);

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      houseNumber: '',
      interiorNumber: 1,
      licensePlate: '',
      brand: '',
      model: '',
      color: '',
    },
  });
  
  const onSubmit = async (data: ResidentFormValues) => {
    setIsLoading(true);
    
    const result = await createResident(data);

    if (result.success && result.data) {
      onResidentCreated(result.data);
      toast({
        title: 'Residente Creado',
        description: `El residente ${data.fullName} ha sido creado exitosamente.`,
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al crear residente',
        description: result.error || 'Ocurrió un error inesperado.',
      });
    }
    
    setIsLoading(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Residente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Residente</DialogTitle>
              <DialogDescription>
                Completa el formulario para registrar un nuevo residente y opcionalmente su vehículo. La contraseña es para el primer inicio de sesión.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                        <Input placeholder="Ej: Carolina Soto" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email (para inicio de sesión)</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="ejemplo@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                        <Input type="tel" placeholder="3001234567" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="interiorNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Interior / Torre</FormLabel>
                        <FormControl>
                        <Input type="number" placeholder="Ej: 5" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Casa / Apto (Identificador Único)</FormLabel>
                        <FormControl>
                        <Input placeholder="Ej: Int 5 Casa 101" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                
                <Separator />
                
                <Collapsible open={isVehicleSectionOpen} onOpenChange={setIsVehicleSectionOpen}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                <span>Añadir Vehículo (Opcional)</span>
                            </div>
                            {isVehicleSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="licensePlate"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Placa</FormLabel>
                                <FormControl>
                                    <Input placeholder="ABC-123" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Renault" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Sandero" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Rojo" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                </FormItem>
                                )}
                            />
                        </div>
                        {form.formState.errors.brand && <p className="text-sm text-destructive mt-1">{form.formState.errors.brand.message}</p>}
                    </CollapsibleContent>
                </Collapsible>
            </div>
            
            <DialogFooter className="pt-4">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Residente
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
