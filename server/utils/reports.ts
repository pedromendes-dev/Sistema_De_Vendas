import type { Sale, Attendant } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface SalesReport {
  period: string;
  totalSales: number;
  totalValue: number;
  averageTicket: number;
  topAttendants: Array<{
    name: string;
    sales: number;
    value: number;
  }>;
  salesByDay: Array<{
    date: string;
    sales: number;
    value: number;
  }>;
}

export function generateSalesReport(
  sales: Sale[], 
  attendants: Attendant[],
  startDate: Date,
  endDate: Date
): SalesReport {
  // Filter sales by period
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= startDate && saleDate <= endDate;
  });

  // Calculate totals
  const totalSales = filteredSales.length;
  const totalValue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.value), 0);
  const averageTicket = totalSales > 0 ? totalValue / totalSales : 0;

  // Group by attendant
  const salesByAttendant = new Map<number, { sales: number; value: number }>();
  filteredSales.forEach(sale => {
    const current = salesByAttendant.get(sale.attendantId) || { sales: 0, value: 0 };
    salesByAttendant.set(sale.attendantId, {
      sales: current.sales + 1,
      value: current.value + parseFloat(sale.value)
    });
  });

  // Top attendants
  const topAttendants = Array.from(salesByAttendant.entries())
    .map(([attendantId, data]) => {
      const attendant = attendants.find(a => a.id === attendantId);
      return {
        name: attendant?.name || "Desconhecido",
        sales: data.sales,
        value: data.value
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Sales by day
  const salesByDay = new Map<string, { sales: number; value: number }>();
  filteredSales.forEach(sale => {
    const date = format(new Date(sale.createdAt), "yyyy-MM-dd");
    const current = salesByDay.get(date) || { sales: 0, value: 0 };
    salesByDay.set(date, {
      sales: current.sales + 1,
      value: current.value + parseFloat(sale.value)
    });
  });

  const salesByDayArray = Array.from(salesByDay.entries())
    .map(([date, data]) => ({
      date,
      sales: data.sales,
      value: data.value
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period: `${format(startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(endDate, "dd/MM/yyyy", { locale: ptBR })}`,
    totalSales,
    totalValue,
    averageTicket,
    topAttendants,
    salesByDay: salesByDayArray
  };
}

export function exportToCSV(data: any[], filename: string): string {
  if (data.length === 0) return "";

  // Get headers
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");

  // Convert data to CSV rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
}