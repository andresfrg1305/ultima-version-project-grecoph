
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Profile, Vehicle, ParkingSpot } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, FileDown } from 'lucide-react';
import { AssignmentForm } from './assignment-form';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export type AssignmentData = {
  id: string;
  userName: string;
  userHouse: string;
  vehiclePlate: string;
  spotNumber: string;
  startDate: Date;
  endDate: Date;
  paymentStatus: 'paid' | 'unpaid';
  status: 'active' | 'expired' | 'cancelled';
};

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

interface ParkingClientProps {
    initialData: AssignmentData[];
    residentsWithVehicles: (Profile & { vehicles: Vehicle[] })[];
    availableSpots: ParkingSpot[];
}

export function ParkingClient({ initialData, residentsWithVehicles, availableSpots }: ParkingClientProps) {
  const [data, setData] = useState<AssignmentData[]>(initialData);
  const [filter, setFilter] = useState('');

  // Sincroniza el estado con las props si cambian (por ej, al refrescar la página)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const [visibleColumns, setVisibleColumns] = useState({
    userHouse: true,
    userName: true,
    vehiclePlate: true,
    spotNumber: true,
    startDate: true,
    endDate: true,
    paymentStatus: true,
  });

  const filteredData = useMemo(() => 
    data.filter(item =>
        item.userName.toLowerCase().includes(filter.toLowerCase()) ||
        item.userHouse.toLowerCase().includes(filter.toLowerCase()) ||
        item.vehiclePlate.toLowerCase().includes(filter.toLowerCase()) ||
        item.spotNumber.toLowerCase().includes(filter.toLowerCase())
    ),
    [data, filter]
  );
  
  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const tableColumn = ["Casa", "Residente", "Placa", "Parqueadero", "Inicio", "Fin", "Estado Pago"];
    const tableRows: (string | null)[][] = [];

    filteredData.forEach(item => {
        const itemData = [
            item.userHouse,
            item.userName,
            item.vehiclePlate,
            item.spotNumber,
            format(new Date(item.startDate), 'dd/MM/yyyy'),
            format(new Date(item.endDate), 'dd/MM/yyyy'),
            item.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.text("Reporte de Asignaciones de Parqueadero", 14, 15);
    doc.save("reporte_parqueaderos.pdf");
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(item => ({
        "Casa": item.userHouse,
        "Residente": item.userName,
        "Placa": item.vehiclePlate,
        "Parqueadero": item.spotNumber,
        "Inicio": format(new Date(item.startDate), 'dd/MM/yyyy'),
        "Fin": format(new Date(item.endDate), 'dd/MM/yyyy'),
        "Estado Pago": item.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente',
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asignaciones");
    XLSX.writeFile(workbook, "reporte_parqueaderos.xlsx");
  };

  const paymentStatusVariant = {
    paid: 'default',
    unpaid: 'destructive',
  } as const;


  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Input
            placeholder="Buscar por nombre, casa, placa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.keys(visibleColumns).map((key) => (
                <DropdownMenuCheckboxItem
                    key={key}
                    className="capitalize"
                    checked={visibleColumns[key as keyof typeof visibleColumns]}
                    onCheckedChange={(value) =>
                    setVisibleColumns(prev => ({ ...prev, [key]: !!value }))
                    }
                >
                    {key.replace(/([A-Z])/g, ' $1')}
                </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF}><FileDown className="mr-2 h-4 w-4" /> Exportar PDF</Button>
            <Button variant="outline" onClick={handleExportExcel}><FileDown className="mr-2 h-4 w-4" /> Exportar Excel</Button>
            <AssignmentForm 
              residentsWithVehicles={residentsWithVehicles}
              availableSpots={availableSpots}
            />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.userHouse && <TableHead>Casa</TableHead>}
              {visibleColumns.userName && <TableHead>Residente</TableHead>}
              {visibleColumns.vehiclePlate && <TableHead>Placa</TableHead>}
              {visibleColumns.spotNumber && <TableHead>Parqueadero</TableHead>}
              {visibleColumns.startDate && <TableHead>Inicio</TableHead>}
              {visibleColumns.endDate && <TableHead>Fin</TableHead>}
              {visibleColumns.paymentStatus && <TableHead>Estado Pago</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  {visibleColumns.userHouse && <TableCell>{item.userHouse}</TableCell>}
                  {visibleColumns.userName && <TableCell className="font-medium">{item.userName}</TableCell>}
                  {visibleColumns.vehiclePlate && <TableCell>{item.vehiclePlate}</TableCell>}
                  {visibleColumns.spotNumber && <TableCell>{item.spotNumber}</TableCell>}
                  {visibleColumns.startDate && <TableCell>{format(new Date(item.startDate), 'dd/MM/yyyy')}</TableCell>}
                  {visibleColumns.endDate && <TableCell>{format(new Date(item.endDate), 'dd/MM/yyyy')}</TableCell>}
                  {visibleColumns.paymentStatus && (
                    <TableCell>
                      <Badge variant={paymentStatusVariant[item.paymentStatus]}>
                        {item.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
