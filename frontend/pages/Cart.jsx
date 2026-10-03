import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

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

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem('student_os_cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('student_os_cart', JSON.stringify(updated));
  };

  const total = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
          <p className="text-sm text-slate-500">Review selected organization merchandise before checkout.</p>
        </div>
        <Link to="/merchandise">
          <Button variant="secondary" size="sm">
            Browse Merchandise
          </Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
            title="Your cart is currently empty"
            description="Browse our organization merchandise store to add t-shirts, hoodies, and accessories."
            action={
              <Link to="/merchandise">
                <Button>Explore Merchandise</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-500">Unit Price: ${Number(item.price).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-sm"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-sm"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-semibold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-rose-600 hover:underline flex items-center justify-end gap-1 mt-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card title="Order Summary">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900 text-base">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
