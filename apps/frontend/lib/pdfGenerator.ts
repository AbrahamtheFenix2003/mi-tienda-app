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
  let currentY = 20;

  // Título principal
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Inventario - Vista Actual', 14, currentY);
  currentY += 10;

  // Información de generación
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })}`, 14, currentY);
  currentY += 6;

  // Usuario generador (puedes pasarlo como opción si lo tienes disponible)
  const userEmail = 'usuario@sistema.com'; // TODO: pasar como parámetro si está disponible
  doc.text(`Generado por: ${userEmail}`, 14, currentY);
  currentY += 6;

  doc.text(`Total de productos mostrados: ${products.length}`, 14, currentY);
  currentY += 8;

  // Filtros aplicados
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (options.categoryLabel) {
    doc.text(`Filtro por categoría: ${options.categoryLabel}`, 14, currentY);
    currentY += 5;
  }
  if (options.stockFilterLabel) {
    doc.text(`Filtro por estado: ${options.stockFilterLabel}`, 14, currentY);
    currentY += 5;
  }
  doc.setTextColor(0);
  currentY += 3;

  // Resumen de Vista Actual
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen de Vista Actual:', 14, currentY);
  currentY += 7;

  const totalUnits = products.reduce((sum, product) => sum + (product.stock ?? 0), 0);
  const totalInventoryValue = products.reduce((sum, product) => {
    const cost = product.acquisitionCost ?? product.price;
    return sum + toNumber(cost) * (product.stock ?? 0);
  }, 0);
  const productsWithStock = products.filter(p => (p.stock ?? 0) > 0).length;
  const productsWithoutStock = products.filter(p => (p.stock ?? 0) === 0).length;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`- Stock total disponible: ${totalUnits} unidades`, 20, currentY);
  currentY += 6;
  doc.text(`- Valor total del inventario: ${formatCurrency(totalInventoryValue)}`, 20, currentY);
  currentY += 6;
  doc.text(`- Productos con stock: ${productsWithStock}`, 20, currentY);
  currentY += 6;
  doc.text(`- Productos sin stock: ${productsWithoutStock}`, 20, currentY);
  currentY += 10;

  // Separador
  doc.setDrawColor(200);
  doc.line(14, currentY, 196, currentY);
  currentY += 8;

  // Leyenda
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Leyenda:', 14, currentY);

  // Cuadrado verde para con stock
  doc.setFillColor(0, 128, 0);
  doc.rect(50, currentY - 3, 4, 4, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text('= Con Stock', 56, currentY);

  // Cuadrado rojo para sin stock
  doc.setFillColor(255, 0, 0);
  doc.rect(95, currentY - 3, 4, 4, 'F');
  doc.text('= Sin Stock', 101, currentY);
  currentY += 8;

  // Tabla de productos
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalle de Productos:', 14, currentY);
  currentY += 7;

  const head = [['Producto', 'Categoría', 'Stock', 'Precio', 'Valor Total', 'Estado']];

  const body = products.map((product) => {
    const stock = product.stock ?? 0;
    const price = toNumber(product.acquisitionCost ?? product.price);
    const totalValue = price * stock;
    const hasStock = stock > 0;

    return [
      product.name,
      product.category?.name ?? 'Sin categoría',
      stock.toString(),
      formatCurrency(product.price),
      formatCurrency(totalValue),
      hasStock ? 'SI' : 'NO'
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: currentY,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185], // Azul
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 10
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 55 }, // Producto
      1: { cellWidth: 35 }, // Categoría
      2: { cellWidth: 20, halign: 'center' }, // Stock
      3: { cellWidth: 25, halign: 'right' }, // Precio
      4: { cellWidth: 30, halign: 'right' }, // Valor Total
      5: { cellWidth: 20, halign: 'center' } // Estado
    },
    didParseCell: (data) => {
      // Colorear la columna de Estado según el valor
      if (data.column.index === 5 && data.section === 'body') {
        const cellValue = data.cell.text[0];
        if (cellValue === 'SI') {
          data.cell.styles.textColor = [255, 255, 255]; // Blanco
          data.cell.styles.fillColor = [0, 128, 0]; // Fondo verde
          data.cell.styles.fontStyle = 'bold';
        } else if (cellValue === 'NO') {
          data.cell.styles.textColor = [255, 255, 255]; // Blanco
          data.cell.styles.fillColor = [255, 0, 0]; // Fondo rojo
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  doc.save('reporte-stock.pdf');
};
