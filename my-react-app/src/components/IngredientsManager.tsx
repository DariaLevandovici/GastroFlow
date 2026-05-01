import { useState, useEffect, useCallback } from 'react';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../services/ingredientService';
import type { Ingredient, IngredientFormDto } from '../types/ingredient';
import {
  Package, Plus, Trash2, RefreshCw, AlertCircle, Loader2,
  CheckCircle2, Search, Pencil, X, AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Vegetables', 'Meat', 'Dairy', 'Dry Goods', 'Spices', 'Drinks', 'Other'];
const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'packs'];

const EMPTY_FORM: IngredientFormDto = {
  name: '',
  quantity: 0,
  unit: 'kg',
  minStock: 0,
  category: 'Vegetables',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function IngredientRow({
  ingredient,
  onEdit,
  onDelete,
  deleting,
}: {
  ingredient: Ingredient;
  onEdit: (i: Ingredient) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  const isLowStock = ingredient.quantity < ingredient.minStock;

  return (
    <tr className={`border-t border-gray-800 hover:bg-gray-800/40 transition-colors ${isLowStock ? 'bg-red-900/10' : ''}`}>
      <td className="p-3 text-gray-500 font-mono text-xs">#{ingredient.id}</td>
      <td className="p-3 text-white font-semibold flex items-center gap-2">
        {ingredient.name}
        {isLowStock && (
          <span className="flex items-center gap-1 bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border border-red-800/50">
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </span>
        )}
      </td>
      <td className="p-3">
        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-900/30 text-blue-300 whitespace-nowrap">
          {ingredient.category}
        </span>
      </td>
      <td className="p-3">
        <span className={`font-bold text-sm ${isLowStock ? 'text-red-400' : 'text-white'}`}>
          {ingredient.quantity}
        </span>
        <span className="text-gray-400 text-xs ml-1">{ingredient.unit}</span>
      </td>
      <td className="p-3">
        <span className="text-gray-400 text-sm">{ingredient.minStock}</span>
        <span className="text-gray-500 text-xs ml-1">{ingredient.unit}</span>
      </td>
      <td className="p-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(ingredient)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-400 hover:bg-blue-900/30 border border-blue-800/50 hover:border-blue-600 transition-all text-xs cursor-pointer"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(ingredient.id)}
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

export function IngredientsManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<IngredientFormDto>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null); // null = create mode

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadIngredients = useCallback(async () => {
    setLoadStatus('loading');
    setLoadError(null);
    try {
      const data = await getIngredients();
      setIngredients(data);
      setLoadStatus('idle');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unknown error');
      setLoadStatus('error');
    }
  }, []);

  useEffect(() => { loadIngredients(); }, [loadIngredients]);

  // ── Enter edit mode ───────────────────────────────────────────────────────────
  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setForm({
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      minStock: ingredient.minStock,
      category: ingredient.category || 'Other',
    });
    setSubmitStatus('idle');
    setSubmitError(null);
    
    // Smooth scroll to top where form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSubmitStatus('idle');
    setSubmitError(null);
  };

  // ── Submit (create or update) ─────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: IngredientFormDto = {
      ...form,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
    };

    setSubmitStatus('loading');
    setSubmitError(null);
    
    try {
      if (editingId !== null) {
        // Update
        await updateIngredient(editingId, payload);
        setIngredients(prev => prev.map(i => i.id === editingId ? { ...i, ...payload, id: editingId } : i));
        setEditingId(null);
      } else {
        // Create
        const created = await createIngredient(payload);
        setIngredients(prev => [created, ...prev]);
      }
      
      setForm(EMPTY_FORM);
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 2500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save ingredient');
      setSubmitStatus('error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete ingredient #${id}?`)) return;
    
    setDeletingId(id);
    try {
      await deleteIngredient(id);
      setIngredients(prev => prev.filter(i => i.id !== id));
      if (editingId === id) handleClearForm();
    } catch {
      alert("Failed to delete ingredient. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Search & Filter ───────────────────────────────────────────────────────────
  const filteredIngredients = ingredients.filter(i => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return i.name.toLowerCase().includes(q);
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Form Section ─────────────────────────────────────────────────────── */}
      <div id="ingredient-form-section" className="bg-[#242424] rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {editingId !== null ? (
              <Pencil className="w-5 h-5 text-amber-400" />
            ) : (
              <Plus className="w-5 h-5 text-blue-400" />
            )}
            <h3 className="text-xl font-bold text-white">
              {editingId !== null ? `Edit Ingredient #${editingId}` : 'Add New Ingredient'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Row 1 */}
            <div>
              <label htmlFor="ingredient-name" className="block text-sm text-gray-400 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="ingredient-name" type="text" required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Tomato"
                className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="ingredient-category" className="block text-sm text-gray-400 mb-1.5">Category</label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm(f => ({ ...f, category: value }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Row 2 */}
            <div>
              <label htmlFor="ingredient-quantity" className="block text-sm text-gray-400 mb-1.5">
                Quantity <span className="text-red-400">*</span>
              </label>
              <input
                id="ingredient-quantity" type="number" required min={0} step="any"
                value={form.quantity === 0 ? '' : form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label htmlFor="ingredient-unit" className="block text-sm text-gray-400 mb-1.5">Unit</label>
              <Select
                value={form.unit}
                onValueChange={(value) => setForm(f => ({ ...f, unit: value }))}
              >
                <SelectTrigger className="w-full h-11 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-[#1a1a1a] border border-gray-700 text-white">
                  {UNITS.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="ingredient-minStock" className="block text-sm text-gray-400 mb-1.5">
                Min Stock (Alert Level) <span className="text-red-400">*</span>
              </label>
              <input
                id="ingredient-minStock" type="number" required min={0} step="any"
                value={form.minStock === 0 ? '' : form.minStock}
                onChange={e => setForm(f => ({ ...f, minStock: parseFloat(e.target.value) || 0 }))}
                placeholder="Alert threshold"
                className="w-full h-11 px-4 rounded-xl bg-[#1a1a1a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm text-white ${
                editingId !== null ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              {submitStatus === 'loading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId !== null ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {submitStatus === 'loading'
                ? 'Processing…'
                : editingId !== null
                ? 'Save Changes'
                : 'Add Ingredient'}
            </button>

            <button
              type="button"
              onClick={handleClearForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 cursor-pointer border border-gray-700"
            >
              <RefreshCw className="w-4 h-4" /> Clear Form
            </button>
            
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {editingId !== null ? 'Ingredient updated!' : 'Ingredient added!'}
              </div>
            )}
            {submitStatus === 'error' && submitError && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {submitError}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* ── Table Section ────────────────────────────────────────────────────── */}
      <div className="bg-[#242424] rounded-2xl border border-gray-800 overflow-hidden shadow-lg">
        {/* Header + Search */}
        <div className="p-6 border-b border-gray-800 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Inventory Database</h3>
              {loadStatus === 'idle' && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs font-medium">
                  {filteredIngredients.length}{filteredIngredients.length !== ingredients.length && ` of ${ingredients.length}`} items
                </span>
              )}
            </div>
            <button
              onClick={loadIngredients}
              disabled={loadStatus === 'loading'}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadStatus === 'loading' ? 'animate-spin' : ''}`} />
              Refresh list
            </button>
          </div>

          <div className="flex items-center gap-3 bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-2.5 focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search ingredients by name or category..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-500 hover:text-white cursor-pointer transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* States */}
        {loadStatus === 'loading' && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading ingredients from backend...</p>
          </div>
        )}
        
        {loadStatus === 'error' && loadError && (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-semibold mb-2 text-lg">Connection Error</p>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{loadError}</p>
            <button onClick={loadIngredients} className="px-6 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white text-sm transition-all cursor-pointer font-medium">
              Try Again
            </button>
          </div>
        )}
        
        {loadStatus === 'idle' && filteredIngredients.length === 0 && (
          <div className="p-16 text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 font-medium text-lg mb-2">
              {searchTerm ? 'No search results found' : 'No ingredients found'}
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm ? `No ingredients match "${searchTerm}".` : 'The inventory database is currently empty. Add your first ingredient above.'}
            </p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 px-4 py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Custom Table */}
        {loadStatus === 'idle' && filteredIngredients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1e1e1e]">
                <tr>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Min Stock (Alert)</th>
                  <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredIngredients.map(ingredient => (
                  <IngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    deleting={deletingId === ingredient.id}
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
