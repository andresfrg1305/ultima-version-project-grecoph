
"use client";

import { useState, useMemo, useTransition } from 'react';
import type { Profile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, FileDown, ChevronDown, CheckCircle, XCircle, Eye, Trash2, UserCheck } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResidentForm } from './resident-form';
import { PaymentStatusDialog } from './payment-status-dialog';
import { deleteResident, createAuthAccountForExistingResident } from '../_actions/manage-residents';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ResidentData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interiorNumber: number;
  houseNumber: string;
  paymentStatus: 'current' | 'overdue';
  vehicleCount: number;
  vehicles: string;
};

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface ResidentsClientProps {
    initialData: ResidentData[];
}

export function ResidentsClient({ initialData }: ResidentsClientProps) {
  const { toast } = useToast();
  const [data, setData] = useState<ResidentData[]>(initialData);
  const [filter, setFilter] = useState('');
  const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createAccountDialogOpen, setCreateAccountDialogOpen] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isCreatingAccount, startCreateAccountTransition] = useTransition();

  const handleResidentCreated = (newResidentData: ResidentData) => {
    setData(prevData => [newResidentData, ...prevData]);
  };

  const handlePaymentStatusUpdate = () => {
    // Recargar la página para obtener los datos actualizados
    window.location.reload();
  };

  const handleUpdatePaymentStatus = (resident: ResidentData) => {
    setSelectedResident(resident);
    setPaymentDialogOpen(true);
  };

  const handleViewDetails = (resident: ResidentData) => {
    setSelectedResident(resident);
    setDetailsDialogOpen(true);
  };

  const handleDeleteResident = (resident: ResidentData) => {
    setSelectedResident(resident);
    setDeleteDialogOpen(true);
  };

  const handleCreateAccount = (resident: ResidentData) => {
    setSelectedResident(resident);
    setCreateAccountDialogOpen(true);
  };

  const confirmCreateAccount = () => {
    if (!selectedResident) return;

    // Usar una contraseña por defecto para residentes existentes
    const defaultPassword = 'Residente123!';

    startCreateAccountTransition(async () => {
      try {
        const result = await createAuthAccountForExistingResident(selectedResident.id, defaultPassword);

        if (result.success) {
          toast({
            title: 'Cuenta de Acceso Creada',
            description: `Cuenta creada para ${selectedResident.fullName}. Contraseña temporal: ${defaultPassword}`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error al crear cuenta',
            description: result.error || 'No se pudo crear la cuenta de acceso.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ocurrió un error inesperado al crear la cuenta.',
        });
      } finally {
        setCreateAccountDialogOpen(false);
        setSelectedResident(null);
      }
    });
  };

  const confirmDeleteResident = () => {
    if (!selectedResident) return;

    startDeleteTransition(async () => {
      try {
        const result = await deleteResident(selectedResident.id);

        if (result.success) {
          // Remover el residente de la lista local
          setData(prevData => prevData.filter(r => r.id !== selectedResident.id));

          toast({
            title: 'Residente Eliminado',
            description: `El residente ${selectedResident.fullName} ha sido eliminado exitosamente.`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Error al eliminar',
            description: result.error || 'No se pudo eliminar el residente.',
          });
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ocurrió un error inesperado al eliminar el residente.',
        });
      } finally {
        setDeleteDialogOpen(false);
        setSelectedResident(null);
      }
    });
  };

  const filteredData = useMemo(() => data.filter(item =>
    item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    item.email.toLowerCase().includes(filter.toLowerCase()) ||
    String(item.houseNumber).toLowerCase().includes(filter.toLowerCase()) ||
    item.vehicles.toLowerCase().includes(filter.toLowerCase())
  ), [data, filter]);

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const tableColumn = ["Nombre", "Vivienda", "Email", "Teléfono", "Estado Pagos", "Vehículos"];
    const tableRows: (string | null)[][] = [];

    filteredData.forEach(item => {
        const itemData = [
            item.fullName,
            item.houseNumber,
            item.email,
            item.phone,
            item.paymentStatus === 'current' ? 'Al día' : 'Moroso',
            item.vehicles || 'N/A'
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.text("Reporte de Residentes", 14, 15);
    doc.save("reporte_residentes.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(item => ({
        "Nombre Completo": item.fullName,
        "Vivienda": item.houseNumber,
        "Email": item.email,
        "Teléfono": " " + item.phone,
        "Estado Pagos": item.paymentStatus === 'current' ? 'Al día' : 'Moroso',
        "Placas Vehículos": item.vehicles || 'N/A',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Residentes");
    XLSX.writeFile(workbook, "reporte_residentes.xlsx");
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Buscar por nombre, email, casa, placa..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" /> Exportar <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>Exportar a PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Exportar a Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ResidentForm onResidentCreated={handleResidentCreated} />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Vivienda</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado Pagos</TableHead>
              <TableHead>Vehículos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((resident) => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">{resident.fullName}</TableCell>
                  <TableCell>{resident.houseNumber}</TableCell>
                  <TableCell>{resident.email}</TableCell>
                  <TableCell>{resident.phone}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {resident.paymentStatus === 'current' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={resident.paymentStatus === 'current' ? 'text-green-700' : 'text-red-700'}>
                        {resident.paymentStatus === 'current' ? 'Al día' : 'Moroso'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{resident.vehicles || 'N/A'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(resident)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCreateAccount(resident)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Crear cuenta de acceso
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePaymentStatus(resident)}>
                          Actualizar Estado de Pago
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteResident(resident)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron residentes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de detalles del residente */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalles del Residente</DialogTitle>
            <DialogDescription>
              Información completa del residente seleccionado.
            </DialogDescription>
          </DialogHeader>
          {selectedResident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <p className="text-sm text-muted-foreground">{selectedResident.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vivienda</label>
                  <p className="text-sm text-muted-foreground">{selectedResident.houseNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedResident.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="text-sm text-muted-foreground">{selectedResident.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado de Pagos</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedResident.paymentStatus === 'current' ? 'Al día' : 'Moroso'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vehículos</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedResident.vehicleCount > 0 ? selectedResident.vehicles : 'Sin vehículos'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de crear cuenta de acceso */}
      <AlertDialog open={createAccountDialogOpen} onOpenChange={setCreateAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Crear Cuenta de Acceso</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una cuenta de Firebase Auth para el residente
              {selectedResident && ` "${selectedResident.fullName}"`} con una contraseña temporal.
              El residente podrá iniciar sesión y cambiar su contraseña después.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCreatingAccount}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCreateAccount}
              disabled={isCreatingAccount}
            >
              {isCreatingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente al residente
              {selectedResident && ` "${selectedResident.fullName}"`} y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteResident}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedResident && (
        <PaymentStatusDialog
          resident={selectedResident}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onPaymentStatusUpdated={handlePaymentStatusUpdate}
        />
      )}
    </div>
  );
}
