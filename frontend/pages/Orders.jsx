import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import ordersService from '../services/orders';
import { Package, AlertCircle } from 'lucide-react';

const statusVariant = (s) => {
  const m = {
    pending: 'warning',
    confirmed: 'info',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger',
  };
  return m[s] || 'secondary';
};

const formatDate = (iso) => {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ordersService.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to load orders.';
        setError(typeof msg === 'string' ? msg : 'Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">Merchandise purchase and fulfillment history</p>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        {loading ? (
          <Loading message="Loading orders..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title="No orders found"
            description="No data available yet. Orders placed through the merchandise store will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Order ID</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Date</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Items</th>
                  <th className="pb-3 pr-4 font-semibold text-slate-600">Total</th>
                  <th className="pb-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-700">#{order.id}</td>
                    <td className="py-3 pr-4 text-slate-700">{formatDate(order.order_date)}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">
                      {Array.isArray(order.items) && order.items.length > 0
                        ? order.items.map((i) => `${i.product?.name || 'Product'} x${i.quantity}`).join(', ')
                        : '--'}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
