import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import productsService from '../services/products';
import authService from '../services/auth';
import { ShoppingBag, Plus, Edit, Trash2, AlertCircle, ShoppingCart, CheckCircle2, Search } from 'lucide-react';

const initialForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: '',
  is_available: 'true',
};

const availabilityVariant = (av) => (av ? 'success' : 'secondary');

export default function Merchandise() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [addedNotice, setAddedNotice] = useState('');

  const user = authService.getUser() || {};
  const role = (user.role || '').toLowerCase();
  const isAdmin = role.includes('admin') || role.includes('president');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to load merchandise.';
      setError(typeof msg === 'string' ? msg : 'Failed to load merchandise.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm(initialForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      stock: product.stock ?? '0',
      category: product.category || '',
      is_available: product.is_available !== false ? 'true' : 'false',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10) || 0,
        category: form.category || null,
        is_available: form.is_available === 'true',
      };
      if (editProduct) {
        await productsService.updateProduct(editProduct.id, payload);
      } else {
        await productsService.createProduct(payload);
      }
      setModalOpen(false);
      await fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Save failed.';
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Delete failed.';
      alert(typeof msg === 'string' ? msg : 'Delete failed.');
    }
  };

  const handleAddToCart = (product) => {
    try {
      const saved = localStorage.getItem('student_os_cart');
      const cart = saved ? JSON.parse(saved) : [];
      const existingIdx = cart.findIndex((i) => i.id === product.id);
      if (existingIdx >= 0) {
        cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        });
      }
      localStorage.setItem('student_os_cart', JSON.stringify(cart));
      setAddedNotice(`Added "${product.name}" to cart.`);
      setTimeout(() => setAddedNotice(''), 3000);
    } catch {
      alert('Could not update cart.');
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchandise Store</h1>
          <p className="text-sm text-slate-500">Organization apparel, stationery, and official accessories</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="secondary" size="sm">
              <ShoppingCart className="w-4 h-4 mr-1.5" /> View Cart
            </Button>
          </Link>
          {isAdmin && (
            <Button variant="primary" size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {addedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addedNotice}</span>
          </div>
          <Link to="/cart" className="font-semibold text-emerald-700 underline text-xs">
            Go to Cart
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      <Card>
        {loading ? (
          <Loading message="Loading merchandise catalog..." />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title="No merchandise items found"
            description={searchTerm ? "No products matched your search." : "No data available yet."}
            actionText={isAdmin ? 'Add Product' : undefined}
            onAction={isAdmin ? openAdd : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Product Name</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Category</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Price</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Stock</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Status</th>
                  <th className="pb-3 pl-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{p.category || 'General'}</td>
                    <td className="py-3 pr-4 text-slate-900 font-semibold">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">
                      {p.stock > 0 ? `${p.stock} units` : <span className="text-rose-600 font-medium">Out of stock</span>}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={availabilityVariant(p.is_available && p.stock > 0)}>
                        {p.is_available && p.stock > 0 ? 'In Stock' : 'Unavailable'}
                      </Badge>
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.is_available && p.stock > 0 && (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 rounded border border-sky-200 hover:bg-sky-100 transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        )}
                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                              aria-label="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              aria-label="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Product Name"
            name="name"
            required
            placeholder="e.g. Organization Hoodie"
            value={form.name}
            onChange={handleChange('name')}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Product details and specifications..."
              value={form.description}
              onChange={handleChange('description')}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              value={form.price}
              onChange={handleChange('price')}
            />
            <Input
              label="Stock Quantity"
              name="stock"
              type="number"
              min="0"
              required
              placeholder="0"
              value={form.stock}
              onChange={handleChange('stock')}
            />
          </div>
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Apparel, Accessories, Stationery"
            value={form.category}
            onChange={handleChange('category')}
          />
          <Select
            label="Availability"
            name="is_available"
            value={form.is_available}
            onChange={handleChange('is_available')}
            options={[
              { value: 'true', label: 'Available' },
              { value: 'false', label: 'Unavailable' },
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
