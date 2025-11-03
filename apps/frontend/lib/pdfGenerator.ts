"use client";

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Product, SalesReportData } from '@mi-tienda/types';

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toNumber' in (value as Record<string, unknown>)
  ) {
    const maybeToNumber = (value as { toNumber?: () => number }).toNumber;
    if (typeof maybeToNumber === 'function') {
      return maybeToNumber();
    }
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toString' in (value as Record<string, unknown>)
  ) {
    const maybeToString = (value as { toString?: () => string }).toString;
    if (typeof maybeToString === 'function') {
      return Number(maybeToString());
    }
  }

  return Number(value);
};

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(toNumber(value));

export const generateSalesReportPDF = (
  data: SalesReportData,
  from: Date,
  to: Date
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Reporte de Ventas', 14, 20);

  doc.setFontSize(12);
  doc.text(
    `Desde: ${from.toLocaleDateString()} Hasta: ${to.toLocaleDateString()}`,
    14,
    30
  );

  doc.text(
    `Total de ventas: ${data.summary.totalSales} | Monto total: ${formatCurrency(
      data.summary.totalAmount
    )}`,
    14,
    40
  );
  doc.text(
    `Costo total: ${formatCurrency(
      data.summary.totalCost
    )} | Ganancia total: ${formatCurrency(data.summary.totalProfit)}`,
    14,
    46
  );

  const head = [['ID', 'Fecha', 'Cliente', 'Total', 'Costo', 'Ganancia']];

  const body = data.sales.map((sale) => {
    const totalAmount = formatCurrency(sale.totalAmount);
    const totalCost = formatCurrency(sale.totalCost ?? 0);
    const totalProfit = formatCurrency(
      sale.profit ?? toNumber(sale.totalAmount) - toNumber(sale.totalCost ?? 0)
    );

    return [
      sale.id,
      new Date(sale.createdAt).toLocaleDateString(),
      sale.customerName ?? 'Cliente',
      totalAmount,
      totalCost,
      totalProfit,
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: 50,
  });

  doc.save('reporte-ventas.pdf');
};

type StockReportOptions = {
  categoryLabel?: string;
  stockFilterLabel?: string;
};

export const generateStockReportPDF = (
  products: Product[],
  options: StockReportOptions = {}
) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Reporte de Stock de Productos', 14, 20);

  doc.setFontSize(12);
  let currentY = 30;
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, currentY);
  currentY += 6;

  const filterDetails: string[] = [];
  if (options.categoryLabel) {
    filterDetails.push(`Categoría: ${options.categoryLabel}`);
  }
  if (options.stockFilterLabel) {
    filterDetails.push(`Stock: ${options.stockFilterLabel}`);
  }

  if (filterDetails.length > 0) {
    doc.text(filterDetails.join(' | '), 14, currentY);
    currentY += 6;
  }

  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
  const totalInventoryValue = products.reduce((sum, product) => {
    const cost = product.acquisitionCost ?? product.price;
    return sum + toNumber(cost) * (product.stock ?? 0);
  }, 0);

  doc.text(`Total de productos: ${totalProducts}`, 14, currentY);
  currentY += 6;
  doc.text(`Unidades en inventario: ${totalUnits}`, 14, currentY);
  currentY += 6;
  doc.text(`Valor estimado del inventario: ${formatCurrency(totalInventoryValue)}`, 14, currentY);
  currentY += 10;

  const head = [['ID', 'Producto', 'Stock', 'Precio Venta', 'Costo']];

  const body = products.map((product) => [
    product.id.toString(),
    product.name,
    product.stock.toString(),
    formatCurrency(product.price),
    product.acquisitionCost ? formatCurrency(product.acquisitionCost) : '—',
  ]);

  autoTable(doc, {
    head,
    body,
    startY: currentY,
  });

  doc.save('reporte-stock.pdf');
};
