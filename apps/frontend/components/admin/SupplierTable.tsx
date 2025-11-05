// components/admin/SupplierTable.tsx

'use client';

import { Supplier } from '@mi-tienda/types';
import { Edit, Trash2, Building2, Eye } from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onView?: (supplier: Supplier) => void;
}

/**
 * Componente de UI "tonto" (dumb component).
 * Muestra una lista de proveedores en una tabla.
 */
export const SupplierTable = ({ suppliers, onEdit, onDelete, onView }: SupplierTableProps) => {
  
  // Función para formatear campos opcionales
  const formatOptionalField = (value: string | null | undefined) => {
    return value && value.trim() !== '' ? value : 'N/A';
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map((supplier) => {
              return (
                <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Nombre con icono */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {supplier.name}
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatOptionalField(supplier.contact)}
                    </div>
                  </td>

                  {/* Teléfono */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatOptionalField(supplier.phone)}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatOptionalField(supplier.email)}
                    </div>
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(supplier)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(supplier)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
                      title="Editar Proveedor"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(supplier)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
                      title="Eliminar Proveedor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};