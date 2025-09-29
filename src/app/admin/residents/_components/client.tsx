
"use client";

import { useState, useMemo } from 'react';
import type { Profile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, FileDown, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ResidentForm } from './resident-form';
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
  const [data, setData] = useState<ResidentData[]>(initialData);
  const [filter, setFilter] = useState('');

  const handleResidentCreated = (newResidentData: ResidentData) => {
    setData(prevData => [newResidentData, ...prevData]);
  };

  const filteredData = useMemo(() => data.filter(item =>
    item.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    item.email.toLowerCase().includes(filter.toLowerCase()) ||
    item.houseNumber.toLowerCase().includes(filter.toLowerCase()) ||
    item.vehicles.toLowerCase().includes(filter.toLowerCase())
  ), [data, filter]);

  const handleExportPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const tableColumn = ["Nombre", "Vivienda", "Email", "Teléfono", "Vehículos"];
    const tableRows: (string | null)[][] = [];

    filteredData.forEach(item => {
        const itemData = [
            item.fullName,
            item.houseNumber,
            item.email,
            item.phone,
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron residentes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
