"use client";

import { useState, ChangeEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Category, Product, SalesReportData } from "@mi-tienda/types";
import { Button } from "@/components/ui/Button";
import { getSalesReport } from "@/services/reportsService";
import { fetchProducts } from "@/services/productService";
import { fetchCategories } from "@/services/categoryService";
import { generateSalesReportPDF, generateStockReportPDF } from "@/lib/pdfGenerator";

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type StockFilter = "all" | "with" | "without";

const getDefaultDateRange = (): DateRange => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    from: firstDayOfMonth,
    to: today,
  };
};

const formatInputDate = (date: Date | undefined) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type ReportType = "sales" | "stock";

const getStockFilterLabel = (filter: StockFilter) => {
  switch (filter) {
    case "with":
      return "Solo con stock";
    case "without":
      return "Solo sin stock";
    default:
      return "Todos";
  }
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange);
  const [reportType, setReportType] = useState<ReportType>("sales");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const salesMutation = useMutation<
    SalesReportData,
    unknown,
    { from: Date; to: Date }
  >({
    mutationFn: (dates: { from: Date; to: Date }) =>
      getSalesReport(dates.from, dates.to),
    onSuccess: (data, variables) => {
      generateSalesReportPDF(data, variables.from, variables.to);
    },
    onError: (error) => {
      console.error("Error al generar reporte:", error);
      alert("No se pudo generar el reporte. Intente nuevamente.");
    },
  });

  const stockMutation = useMutation<
    Product[],
    unknown,
    { categoryId: number | "all"; stockFilter: StockFilter; categoryName: string }
  >({
    mutationFn: async () => fetchProducts(),
    onSuccess: (products, variables) => {
      const filteredProducts = products.filter((product) => {
        const matchesCategory =
          variables.categoryId === "all"
            ? true
            : product.categoryId === variables.categoryId;

        let matchesStock = true;
        if (variables.stockFilter === "with") {
          matchesStock = product.stock > 0;
        } else if (variables.stockFilter === "without") {
          matchesStock = product.stock <= 0;
        }

        return matchesCategory && matchesStock;
      });

      if (filteredProducts.length === 0) {
        alert("No se encontraron productos para los filtros seleccionados.");
        return;
      }

      generateStockReportPDF(filteredProducts, {
        categoryLabel: variables.categoryName,
        stockFilterLabel: getStockFilterLabel(variables.stockFilter),
      });
    },
    onError: (error) => {
      console.error("Error al generar reporte de stock:", error);
      alert("No se pudo generar el reporte de stock. Intente nuevamente.");
    },
  });

  const isPending =
    reportType === "sales" ? salesMutation.isPending : stockMutation.isPending;

  const handleDateChange =
    (key: "from" | "to") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setDateRange((prev) => ({
        ...prev,
        [key]: value ? new Date(value) : undefined,
      }));
    };

  const handleGenerateReport = () => {
    if (reportType === "sales") {
      if (dateRange?.from && dateRange?.to) {
        salesMutation.mutate({ from: dateRange.from, to: dateRange.to });
      }
    } else {
      const categoryId =
        categoryFilter === "all" ? "all" : Number(categoryFilter);

      let categoryName = "Todas";
      if (categoryId !== "all") {
        categoryName =
          categories?.find((category) => category.id === categoryId)?.name ??
          "Categoría";
      }

      stockMutation.mutate({
        categoryId,
        stockFilter,
        categoryName,
      });
    }
  };

  const isButtonDisabled =
    isPending ||
    (reportType === "sales" &&
      (!dateRange?.from ||
        !dateRange?.to ||
        dateRange.from > dateRange.to));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generar Reportes</h1>

      <div className="space-y-4 md:max-w-2xl">
        <label className="flex flex-col text-sm font-medium text-gray-700">
          Tipo de reporte
          <select
            value={reportType}
            onChange={(event) =>
              setReportType(event.target.value as ReportType)
            }
            className="mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
          >
            <option value="sales">Ventas</option>
            <option value="stock">Stock de productos</option>
          </select>
        </label>

        {reportType === "sales" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Desde
              <input
                type="date"
                value={formatInputDate(dateRange.from)}
                onChange={handleDateChange("from")}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
              />
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Hasta
              <input
                type="date"
                value={formatInputDate(dateRange.to)}
                onChange={handleDateChange("to")}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
              />
            </label>
          </div>
        )}

        {reportType === "stock" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-gray-700">
              Categoría
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
              >
                <option value="all">Todas</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col text-sm font-medium text-gray-700">
              Stock
              <select
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value as StockFilter)
                }
                className="mt-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500"
              >
                <option value="all">Todos</option>
                <option value="with">Solo con stock</option>
                <option value="without">Solo sin stock</option>
              </select>
            </label>
          </div>
        )}
      </div>

      {reportType === "sales" &&
        dateRange.from &&
        dateRange.to &&
        dateRange.from > dateRange.to && (
          <p className="text-sm text-red-600">
            La fecha desde no puede ser posterior a la fecha hasta.
          </p>
        )}

      <Button onClick={handleGenerateReport} disabled={isButtonDisabled}>
        {isPending
          ? "Generando..."
          : reportType === "sales"
          ? "Generar PDF de ventas"
          : "Generar PDF de stock"}
      </Button>
    </div>
  );
}
