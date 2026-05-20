import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { Modal } from '../../components/ui/Modal';

// ================= MOCK DATA =================
const initialProducts = [
  { idProducto: '301', nombre: 'Vacuna Antirrábica', descripcion: 'Dosis anual', unidadMedida: 'Ampolla', costo: '120.00', distribucion: 'Laboratorios VetBol', stock: 15 },
  { idProducto: '302', nombre: 'Champú Hipoalergénico', descripcion: 'Aroma avena 500ml', unidadMedida: 'Frasco', costo: '45.50', distribucion: 'PetCare Supply', stock: 4 },
  { idProducto: '303', nombre: 'Pipeta Antipulgas', descripcion: 'Para perros 10-20kg', unidadMedida: 'Unidad', costo: '85.00', distribucion: 'Bayer', stock: 0 },
  { idProducto: '304', nombre: 'Alimento Premium Cachorros', descripcion: 'Bolsa 3kg', unidadMedida: 'Bolsa', costo: '150.00', distribucion: 'Purina ProPlan', stock: 22 },
];

export default function Inventory() {
  // ================= ESTADOS =================
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('Todos');

  // Estados de Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Formulario mapeado a la tabla PRODUCTO (+ campo stock necesario para la lógica visual)
  const emptyProductForm = {
    nombre: '', descripcion: '', unidadMedida: '', costo: '', distribucion: '', stock: ''
  };
  
  const [formData, setFormData] = useState<any>(emptyProductForm);

  // ================= LÓGICA DE FILTRADO =================
  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.distribucion.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStock = true;
    if (stockFilter === 'En Stock') matchesStock = product.stock > 5;
    if (stockFilter === 'Stock Bajo') matchesStock = product.stock > 0 && product.stock <= 5;
    if (stockFilter === 'Agotado') matchesStock = product.stock === 0;

    return matchesSearch && matchesStock;
  });

  // ================= HANDLERS =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData(emptyProductForm);
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setFormData({ ...product });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando Producto al Backend (NestJS):", formData);
    setIsFormModalOpen(false);
  };

  const confirmDelete = () => {
    console.log(`Eliminando producto con ID: ${selectedProductId}`);
    // axios.delete(`/api/productos/${selectedProductId}`)
    setIsDeleteModalOpen(false);
    setSelectedProductId(null);
  };

  // Función auxiliar para determinar el color de la etiqueta de stock
  const getStockBadge = (stock: number) => {
    if (stock === 0) return { label: 'Agotado', classes: 'bg-error-container/20 text-error border-error/30', icon: 'error' };
    if (stock <= 5) return { label: 'Stock Bajo', classes: 'bg-tertiary-container/30 text-tertiary border-tertiary/30', icon: 'warning' };
    return { label: 'En Stock', classes: 'bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20', icon: 'check_circle' };
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* ================= CABECERA ================= */}
      <header className="pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="font-display text-4xl text-primary font-bold tracking-tight mb-2">Inventario y Productos</h2>
          <p className="font-body text-lg text-on-surface-variant">Gestiona los suministros médicos, productos de estética y ventas.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl shadow-ambient">
          <span className="material-symbols-outlined font-bold text-[20px]">add_box</span>
          NUEVO PRODUCTO
        </Button>
      </header>

      {/* ================= CONTENEDOR PRINCIPAL ================= */}
      <div className="bg-white rounded-[1.5rem] shadow-ambient border border-outline-variant/30 flex flex-col flex-1 overflow-hidden">
        
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="p-6 border-b border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="relative w-full md:w-96 group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[22px]">search</span>
            <input 
              type="text" 
              placeholder="Buscar producto o distribuidor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-outline/70"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="font-body text-sm font-bold text-on-surface-variant whitespace-nowrap">Disponibilidad:</label>
            <div className="relative w-full md:w-48">
              <select 
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="appearance-none w-full bg-surface-container-low border-2 border-transparent text-on-surface font-body text-sm font-bold pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
              >
                <option value="Todos">Todos los productos</option>
                <option value="En Stock">En Stock</option>
                <option value="Stock Bajo">Stock Bajo</option>
                <option value="Agotado">Agotados</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b-2 border-outline-variant/30">
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider w-20">ID</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Detalle del Producto</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Costo / U.M.</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider">Distribuidor</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Estado (Stock)</th>
                <th className="py-4 px-6 font-body text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const badge = getStockBadge(product.stock);
                  return (
                    <tr key={product.idProducto} className="hover:bg-surface-container/30 transition-colors group">
                      <td className="py-4 px-6 font-body text-sm font-bold text-on-surface-variant/80">#{product.idProducto}</td>
                      <td className="py-4 px-6">
                        <p className="font-body text-sm font-bold text-on-surface">{product.nombre}</p>
                        <p className="font-body text-xs text-on-surface-variant mt-0.5 truncate max-w-[250px]">{product.descripcion}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-body text-sm font-bold text-primary">Bs. {product.costo}</p>
                        <p className="font-body text-[11px] text-on-surface-variant uppercase tracking-wider mt-0.5">por {product.unidadMedida}</p>
                      </td>
                      <td className="py-4 px-6 font-body text-sm text-on-surface-variant">{product.distribucion}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full font-body text-xs font-bold border min-w-[110px] ${badge.classes}`}>
                          <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                          {badge.label} ({product.stock})
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(product)} className="w-8 h-8 rounded-lg flex items-center justify-center text-tertiary hover:bg-tertiary-container/50 transition-colors" title="Editar">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => openDeleteModal(product.idProducto)} className="w-8 h-8 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 transition-colors" title="Eliminar">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">inventory_2</span>
                    <p className="text-on-surface-variant font-body">No se encontraron productos con los filtros aplicados.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL FORMULARIO DE PRODUCTO ================= */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={isEditing ? "Editar Producto" : "Nuevo Producto"} maxWidth="max-w-3xl">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField label="Nombre del Producto:" icon="inventory" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Champú Antipulgas" required />
            </div>
            
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-on-surface font-bold text-[15px] font-body">Descripción (Opcional):</label>
              <textarea 
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                placeholder="Detalles sobre el uso, tipo de mascota o aplicación..."
                className="w-full p-3 border border-outline-variant rounded-lg font-body text-sm text-on-surface bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              ></textarea>
            </div>

            <InputField label="Unidad de Medida:" icon="straighten" name="unidadMedida" value={formData.unidadMedida} onChange={handleInputChange} placeholder="Ej. Ampolla, Frasco, Litro" required />
            <InputField label="Costo (Bs.):" icon="payments" type="number" step="0.01" name="costo" value={formData.costo} onChange={handleInputChange} placeholder="0.00" required />
            <InputField label="Distribuidor / Marca:" icon="local_shipping" name="distribucion" value={formData.distribucion} onChange={handleInputChange} placeholder="Ej. VetSupply / Bayer" required />
            
            {/* Campo Stock añadido para la UX del sistema */}
            <InputField label="Stock Físico Actual:" icon="inventory_2" type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Cantidad disponible" required />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30">
            <Button variant="outline" type="button" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" type="submit">{isEditing ? 'Guardar Cambios' : 'Registrar Producto'}</Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL DE ELIMINACIÓN HORIZONTAL (PERFECTO) ================= */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Eliminar Producto" 
        maxWidth="max-w-[480px]" 
      >
        <div className="flex flex-col w-full">
          <div className="flex flex-row items-start gap-5 mb-6 mt-2">
            <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[28px] icon-fill">warning</span>
            </div>
            <div className="flex-1 text-left mt-1">
              <h4 className="font-display text-xl font-bold text-on-surface mb-2">
                ¿Estás seguro?
              </h4>
              <p className="font-body text-[15px] text-on-surface-variant w-full leading-relaxed">
                Estás a punto de eliminar este producto del inventario. Esta acción no se puede deshacer y podría afectar el historial de recetas asociadas a este ítem.
              </p>
            </div>
          </div>
          
          <div className="flex flex-row justify-end gap-3 w-full pt-5 border-t border-outline-variant/20">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="action" onClick={confirmDelete} className="bg-error border-error hover:bg-error/90 shadow-none px-6">
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}