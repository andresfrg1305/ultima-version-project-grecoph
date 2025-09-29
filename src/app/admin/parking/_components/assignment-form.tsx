
"use client";

import { useState, useMemo, useTransition } from 'react';
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
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ParkingAssignment, Profile, Vehicle, ParkingSpot } from '@/lib/types';
import { createParkingAssignment } from '../_actions/manage-parking';
import { useRouter } from 'next/navigation';


const formSchema = z.object({
  userId: z.string({ required_error: 'Debes seleccionar un residente.' }),
  vehicleId: z.string({ required_error: 'Debes seleccionar un vehículo.' }),
  parkingSpotId: z.string({ required_error: 'Debes seleccionar un parqueadero.' }),
  startDate: z.date({ required_error: 'La fecha de inicio es requerida.' }),
  endDate: z.date({ required_error: 'La fecha de fin es requerida.' }),
  paymentStatus: z.enum(['paid', 'unpaid']),
}).refine(data => data.endDate > data.startDate, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio.',
  path: ['endDate'],
});

export type AssignmentFormValues = z.infer<typeof formSchema>;

interface AssignmentFormProps {
  residentsWithVehicles: (Profile & { vehicles: Vehicle[] })[];
  availableSpots: ParkingSpot[];
}

export function AssignmentForm({ residentsWithVehicles, availableSpots }: AssignmentFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentStatus: 'unpaid',
      startDate: new Date(),
    },
  });

  const selectedUserId = form.watch('userId');
  
  const userVehicles = useMemo(() => {
    const selectedResident = residentsWithVehicles.find(r => r.id === selectedUserId);
    return selectedResident ? selectedResident.vehicles : [];
  }, [selectedUserId, residentsWithVehicles]);
  
  const onSubmit = async (data: AssignmentFormValues) => {
    startTransition(async () => {
      const result = await createParkingAssignment(data);

      if (result.success) {
        toast({
          title: 'Asignación Creada',
          description: `El parqueadero ha sido asignado al residente.`,
        });
        setOpen(false);
        form.reset();
        router.refresh(); // Recarga los datos de la página del servidor
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al crear la asignación',
          description: result.error || 'Ocurrió un error inesperado.',
        });
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Asignar Parqueadero</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Asignación de Parqueadero</DialogTitle>
          <DialogDescription>
            Completa el formulario para asignar un parqueadero a un residente.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un residente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residentsWithVehicles.map(resident => (
                        <SelectItem key={resident.id} value={resident.id}>
                          {resident.fullName} - {resident.houseNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo (Placa)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedUserId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un vehículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userVehicles.map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.licensePlate} ({vehicle.brand} {vehicle.color})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="parkingSpotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parqueadero Disponible</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un parqueadero" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSpots.map(spot => (
                        <SelectItem key={spot.id} value={spot.id}>
                          {spot.spotNumber} - {spot.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha Inicio</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha Fin</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

             <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del Pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unpaid">Pendiente</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Asignación
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}