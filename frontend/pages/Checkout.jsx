import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import EmptyState from '../components/EmptyState';
import ordersService from '../services/orders';
import authService from '../services/auth';
import { ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [pickupNote, setPickupNote] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getUser();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('student_os_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity || 1,
        })),
      };

      const result = await ordersService.createOrder(payload);
      setCreatedOrder(result);
      setOrderComplete(true);
      localStorage.removeItem('student_os_cart');
      setCartItems([]);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Placed Successfully!</h1>
          <p className="text-sm text-slate-500 mt-2">
            Your order #{createdOrder?.id} has been recorded. Our merchandise team will prepare your items for pickup.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link to="/orders">
            <Button>View My Orders</Button>
          </Link>
          <Link to="/merchandise">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
            title="No items to checkout"
            description="Your cart is currently empty. Add items from the merchandise page before checking out."
            action={
              <Link to="/merchandise">
                <Button>Browse Merchandise</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Checkout</h1>
          <p className="text-sm text-slate-500">Confirm your merchandise items and campus pickup preferences.</p>
        </div>
        <Link to="/cart">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        <Card title="Pickup & Contact Information">
          <div className="space-y-4">
            <Input
              label="Student Name / Account"
              disabled
              value={currentUser ? `${currentUser.name || currentUser.username} (${currentUser.email || ''})` : 'Not signed in'}
            />
            <Input
              label="Campus Pickup Notes (Optional)"
              placeholder="e.g. Will pick up after Friday General Body meeting"
              value={pickupNote}
              onChange={(e) => setPickupNote(e.target.value)}
            />
          </div>
        </Card>

        <Card title="Order Items Review">
          <div className="divide-y divide-slate-100 text-sm">
            {cartItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="pt-3 flex justify-between font-bold text-base text-slate-900">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/cart">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting Order...' : `Confirm & Place Order ($${total.toFixed(2)})`}
          </Button>
        </div>
      </form>
    </div>
  );
}
