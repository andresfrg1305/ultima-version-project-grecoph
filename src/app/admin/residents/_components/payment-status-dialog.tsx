"use client";

import { useState, useTransition } from 'react';
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
import { updateResidentPaymentStatus } from '../_actions/manage-residents';
import type { ResidentData } from './client';

const formSchema = z.object({
  paymentStatus: z.enum(['current', 'overdue'], {
    required_error: 'Debe seleccionar el estado de pagos.',
  }),
  lastPaymentDate: z.date().optional(),
}).refine(data => {
  if (data.paymentStatus === 'current' && !data.lastPaymentDate) {
    return false;
  }
  return true;
}, {
  message: 'Si el estado es "Al día", debe proporcionar la fecha del último pago.',
  path: ['lastPaymentDate'],
});

type PaymentStatusFormValues = z.infer<typeof formSchema>;

interface PaymentStatusDialogProps {
  resident: ResidentData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentStatusUpdated: () => void;
}

export function PaymentStatusDialog({
  resident,
  open,
  onOpenChange,
  onPaymentStatusUpdated
}: PaymentStatusDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PaymentStatusFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentStatus: resident.paymentStatus,
      lastPaymentDate: undefined,
    },
  });

  const selectedStatus = form.watch('paymentStatus');

  const onSubmit = async (data: PaymentStatusFormValues) => {
    startTransition(async () => {
      const result = await updateResidentPaymentStatus(
        resident.id,
        data.paymentStatus,
        data.lastPaymentDate
      );

      if (result.success) {
        toast({
          title: 'Estado de pago actualizado',
          description: `El estado de pago de ${resident.fullName} ha sido actualizado.`,
        });
        onOpenChange(false);
        onPaymentStatusUpdated();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar estado de pago',
          description: result.error || 'Ocurrió un error inesperado.',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Pago</DialogTitle>
          <DialogDescription>
            Actualiza el estado de pagos de administración para {resident.fullName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Pagos de Administración</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el estado de pagos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="current">Al día</SelectItem>
                      <SelectItem value="overdue">Moroso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStatus === 'current' && (
              <FormField
                control={form.control}
                name="lastPaymentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Último Pago</FormLabel>
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
                            {field.value ? format(field.value, "PPP") : <span>Selecciona la fecha</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Estado
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}