import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService';
import { getIngredients } from '../services/ingredientService';
import type { Product, ProductFormDto, ProductIngredient } from '../types/product';
import type { Ingredient } from '../types/ingredient';
import {
  Package, Plus, Trash2, RefreshCw, AlertCircle, Loader2,
  CheckCircle2, Search, Pencil, X, CheckSquare, Square
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Breakfast', 'Starters', 'Vegan', 'Main Dishes', 'Desserts', 'Drinks'];

const EMPTY_FORM: ProductFormDto = {
  name: '',
  description: '',
  price: 0,
  category: 'Breakfast',
  image: '',
  ingredients: '[]',
  dietary: '[]',
  productIngredients: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function displayToJson(display: string): string {
  if (!display.trim()) return '[]';
  const items = display.split(',').map(s => s.trim()).filter(Boolean);
  return JSON.stringify(items);
}

function jsonToDisplay(jsonStr: string): string {
  if (!jsonStr) return '';
  try {
    const arr = JSON.parse(jsonStr);
    return Array.isArray(arr) ? arr.join(', ') : '';
  } catch {
    return '';
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductRow({
  product,
  onEdit,
  onDelete,
  deleting,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="p-3 text-gray-500 font-mono text-xs">#{product.id}</td>
      <td className="p-3">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </td>
      <td className="p-3 text-white font-semibold text-sm">{product.name}</td>
      <td className="p-3">
        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-900/30 text-blue-300 whitespace-nowrap">
          {product.category}
        </span>
      </td>
      <td className="p-3">
        <span className="text-amber-400 font-bold text-sm">{product.price.toFixed(2)} MDL</span>
      </td>
      <td className="p-3 text-gray-400 text-xs truncate max-w-[200px]">
        {product.productIngredients && product.productIngredients.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {product.productIngredients.map((pi, idx) => (
              <span key={idx} className="bg-gray-800 px-2 py-0.5 rounded text-gray-300 text-[10px]">
                {pi.amountNeeded} {pi.unit} {pi.ingredientName}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-600 italic">No ingredients assigned</span>
        )}
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-400 hover:bg-blue-900/30 border border-blue-800/50 hover:border-blue-600 transition-all text-xs cursor-pointer"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(product.id)}
            disabled={deleting}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-900/30 border border-red-800/50 hover:border-red-600 transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dbIngredients, setDbIngredients] = useState<Ingredient[]>([]);
  
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<ProductFormDto>(EMPTY_FORM);
  const [dietaryDisplay, setDietaryDisplay] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchIngredientTerm, setSearchIngredientTerm] = useState('');

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoadStatus('loading');
    setLoadError(null);
    try {
      const [prods, ings] = await Promise.all([getProducts(), getIngredients()]);
      setProducts(prods);
      setDbIngredients(ings);
      setLoadStatus('idle');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unknown error loading data');
      setLoadStatus('error');
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Enter edit mode ───────────────────────────────────────────────────────────
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || 'Menu',
      image: product.image || '',
      ingredients: '[]', 
      dietary: product.dietary || '[]',
      productIngredients: product.productIngredients ? [...product.productIngredients] : [],
    });
    setDietaryDisplay(jsonToDisplay(product.dietary));
    setSubmitStatus('idle');
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDietaryDisplay('');
    setSubmitStatus('idle');
    setSubmitError(null);
  };

  // ── Ingredient Selection Logic ────────────────────────────────────────────────
  const toggleIngredient = (ing: Ingredient) => {
    setForm(f => {
      const exists = f.productIngredients.some(pi => pi.ingredientId === ing.id);
      if (exists) {
        return {
          ...f,
          productIngredients: f.productIngredients.filter(pi => pi.ingredientId !== ing.id)
        };
      } else {
        return {
          ...f,
          productIngredients: [...f.productIngredients, { ingredientId: ing.id, amountNeeded: 0, ingredientName: ing.name, unit: ing.unit }]
        };
      }
    });
  };

  const updateAmountNeeded = (ingredientId: number, amount: number) => {
    setForm(f => ({
      ...f,
      productIngredients: f.productIngredients.map(pi => 
        pi.ingredientId === ingredientId ? { ...pi, amountNeeded: amount } : pi
      )
    }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: ProductFormDto = {
      ...form,
      price: Number(form.price),
      dietary: displayToJson(dietaryDisplay),
    };

    setSubmitStatus('loading');
    setSubmitError(null);
    
    try {
      if (editingId !== null) {
        await updateProduct(editingId, payload);
        // Optimistic refresh
        loadData();
        setEditingId(null);
      } else {
        await createProduct(payload);
        loadData();
      }
      
      setForm(EMPTY_FORM);
      setDietaryDisplay('');
      setSubmitStatus('success');
      setSearchIngredientTerm('');
      setTimeout(() => setSubmitStatus('idle'), 2500);
    } catch (err: any) {
      // Show concrete message sent by our duplicate validations backend
      const errMsg = err?.message || 'Failed to save product';
      setSubmitError(errMsg.includes('already exists') ? 'A product with this name already exists.' : errMsg);
      setSubmitStatus('error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete product #${id}?`)) return;
    
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingId === id) handleClearForm();
    } catch {
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Search Products ───────────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(q);
  });

  const filteredSearchIngredients = dbIngredients.filter(i => 
    i.name.toLowerCase().includes(searchIngredientTerm.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Form Section ─────────────────────────────────────────────────────── */}
      <div id="product-form-section" className="bg-[#242424] rounded-2xl border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <div className="flex items-center gap-2">
            {editingId !== null ? <Pencil className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-blue-400" />}
            <h3 className="text-xl font-bold text-white">
              {editingId !== null ? `Edit Product #${editingId}` : 'Add New Product'}
            </h3>
          </div>
          {editingId !== null && (
            <button
              onClick={handleClearForm}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 text-sm transition-all cursor-pointer"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* General Settings */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">1. General Info</h4>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Name <span className="text-red-400">*</span></label>
                <input
                  type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Product name"
                  className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="w-full h-11 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Price (MDL) <span className="text-red-400">*</span></label>
                <input
                  type="number" required min={0} step={0.01} value={form.price === 0 ? '' : form.price}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Dietary Tags <span className="text-gray-600">(csv)</span></label>
                <input
                  type="text" value={dietaryDisplay}
                  onChange={e => setDietaryDisplay(e.target.value)}
                  placeholder="vegan, halal..."
                  className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  rows={2} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description..."
                  className="w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Image URL</label>
                <input
                  type="text" value={form.image}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="/images/... or https://..."
                  className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Relational Ingredients Setup */}
            <div className="lg:col-span-2 bg-[#1e1e1e] rounded-xl border border-gray-800 p-4">
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>2. Ingredients Recipe</span>
                <span className="text-xs font-normal text-blue-400 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-900/50">
                  {form.productIngredients.length} selected
                </span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[420px]">
                {/* Available Pool */}
                <div className="flex flex-col border border-gray-700 rounded-xl overflow-hidden bg-[#1a1a1a]">
                  <div className="p-3 border-b border-gray-700 flex items-center gap-2 bg-[#222]">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input 
                      type="text" placeholder="Search database ingredients..." 
                      value={searchIngredientTerm} onChange={e => setSearchIngredientTerm(e.target.value)}
                      className="bg-transparent text-sm text-white focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredSearchIngredients.length === 0 ? (
                      <p className="p-4 text-center text-xs text-gray-500">No ingredients match.</p>
                    ) : (
                      filteredSearchIngredients.map(ing => {
                        const isSelected = form.productIngredients.some(pi => pi.ingredientId === ing.id);
                        return (
                          <div 
                            key={ing.id} onClick={() => toggleIngredient(ing)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border ${
                              isSelected ? 'bg-blue-900/20 border-blue-900/50 text-white' : 'hover:bg-gray-800 border-transparent text-gray-400'
                            }`}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                            <span className="text-sm font-medium">{ing.name}</span>
                            <span className="text-xs text-gray-500 ml-auto">{ing.quantity} {ing.unit} in stock</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected Configurations */}
                <div className="flex flex-col border border-gray-800 rounded-xl overflow-hidden bg-[#242424]">
                  <div className="p-3 border-b border-gray-800 bg-[#2a2a2a]">
                    <span className="text-sm font-medium text-gray-300">Set Amounts Needed</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {form.productIngredients.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <Package className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">No ingredients assigned.</p>
                      </div>
                    ) : (
                      form.productIngredients.map(pi => (
                        <div key={pi.ingredientId} className="flex flex-col gap-2 p-3 bg-[#1a1a1a] rounded-xl border border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">{pi.ingredientName}</span>
                            <button type="button" onClick={() => toggleIngredient({ id: pi.ingredientId } as Ingredient)} className="text-gray-500 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" min={0} step="any" required placeholder="0"
                              value={pi.amountNeeded === 0 ? '' : pi.amountNeeded}
                              onChange={e => updateAmountNeeded(pi.ingredientId, parseFloat(e.target.value) || 0)}
                              className="w-24 h-8 px-2 rounded-lg bg-black border border-gray-700 text-white text-sm"
                            />
                            <span className="text-sm text-gray-400 relative top-px">{pi.unit}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex items-center gap-4">
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm text-white ${
                editingId !== null ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'
              }`}
            >
              {submitStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId !== null ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitStatus === 'loading' ? 'Processing…' : editingId !== null ? 'Save Product Changes' : 'Create Product'}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Clear Form
            </button>
            
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                {editingId !== null ? 'Product updated successfully!' : 'Product added successfully!'}
              </div>
            )}
            {submitStatus === 'error' && submitError && (
              <div className="flex items-center gap-2 text-red-400 font-medium bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ── Products Table ────────────────────────────────────────────────────── */}
      <div className="bg-[#242424] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Products Catalog</h3>
          </div>
          
          <div className="flex-1 max-w-md flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-white focus:outline-none text-sm"
            />
          </div>

          <button onClick={loadData} disabled={loadStatus === 'loading'} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 transition-all cursor-pointer">
            <RefreshCw className={`w-4 h-4 ${loadStatus === 'loading' ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {loadStatus === 'loading' && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading catalog...</p>
          </div>
        )}
        
        {loadStatus === 'idle' && filteredProducts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-transparent">
              <thead className="bg-[#1e1e1e]">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[150px]">Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[250px]">Configured Ingredients</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredProducts.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deletingId === product.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
