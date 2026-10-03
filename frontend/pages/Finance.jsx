import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Badge from '../components/Badge';
import financeService from '../services/finance';
import authService from '../services/auth';

export default function Finance() {
  const [activeTab, setActiveTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReimbursementModalOpen, setIsReimbursementModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    source: '',
    description: '',
    amount: '',
    category: 'Sponsorship',
    received_date: new Date().toISOString().slice(0, 10),
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'Events',
    vendor: '',
    expense_date: new Date().toISOString().slice(0, 10),
  });

  const [reimbursementForm, setReimbursementForm] = useState({
    requested_by: '',
    description: '',
    amount: '',
    receipt_url: '',
  });

  const currentUser = authService.getUser();
  const userRole = (currentUser?.role || '').toUpperCase();
  const canManageFinance = userRole === 'ADMIN' || userRole === 'TREASURER';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (canManageFinance) {
        const [sumRes, incRes, expRes, reimbRes] = await Promise.allSettled([
          financeService.getFinanceSummary(),
          financeService.getIncome(),
          financeService.getExpenses(),
          financeService.getReimbursements(),
        ]);

        if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
        if (incRes.status === 'fulfilled') setIncomes(incRes.value || []);
        if (expRes.status === 'fulfilled') setExpenses(expRes.value || []);
        if (reimbRes.status === 'fulfilled') setReimbursements(reimbRes.value || []);
      } else {
        // Members / Volunteers can submit and view reimbursements
        try {
          const reimbData = await financeService.getReimbursements();
          setReimbursements(reimbData || []);
        } catch {
          // If unauthorized to list all, keep empty
          setReimbursements([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIncome = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeService.createIncome({
        source: incomeForm.source,
        description: incomeForm.description || null,
        amount: parseFloat(incomeForm.amount),
        category: incomeForm.category || null,
        received_date: new Date(incomeForm.received_date).toISOString(),
      });
      setIsIncomeModalOpen(false);
      setIncomeForm({
        source: '',
        description: '',
        amount: '',
        category: 'Sponsorship',
        received_date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to record income');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeService.createExpense({
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category || null,
        vendor: expenseForm.vendor || null,
        expense_date: new Date(expenseForm.expense_date).toISOString(),
      });
      setIsExpenseModalOpen(false);
      setExpenseForm({
        description: '',
        amount: '',
        category: 'Events',
        vendor: '',
        expense_date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReimbursement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeService.createReimbursement({
        requested_by: reimbursementForm.requested_by || currentUser?.name || 'Member',
        description: reimbursementForm.description,
        amount: parseFloat(reimbursementForm.amount),
        receipt_url: reimbursementForm.receipt_url || null,
      });
      setIsReimbursementModalOpen(false);
      setReimbursementForm({
        requested_by: '',
        description: '',
        amount: '',
        receipt_url: '',
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to submit reimbursement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReimbursementStatus = async (id, status) => {
    try {
      await financeService.updateReimbursementStatus(id, status);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to update reimbursement status');
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading financial records..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance & Treasury</h1>
          <p className="text-sm text-slate-500">Track organization income, operational expenses, and reimbursement claims.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setIsReimbursementModalOpen(true)}>
            Request Reimbursement
          </Button>
          {canManageFinance && (
            <>
              <Button variant="secondary" onClick={() => setIsIncomeModalOpen(true)}>
                Record Income
              </Button>
              <Button onClick={() => setIsExpenseModalOpen(true)}>
                Record Expense
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {canManageFinance && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Income</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.total_income)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Expenses</span>
              <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(summary.total_expenses)}</p>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Balance</span>
              <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-6">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Overview
        </button>
        {canManageFinance && (
          <>
            <button
              onClick={() => setActiveTab('income')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'income'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Income ({incomes.length})
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'expenses'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Expenses ({expenses.length})
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('reimbursements')}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reimbursements'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Reimbursements ({reimbursements.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Income */}
            <Card title="Recent Income Entries">
              {incomes.length === 0 ? (
                <EmptyState title="No income entries" description="No organization income has been logged yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {incomes.slice(0, 5).map((inc) => (
                    <div key={inc.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{inc.source}</p>
                        <p className="text-xs text-slate-500">{inc.category || 'General'} | {formatDate(inc.received_date)}</p>
                      </div>
                      <span className="font-semibold text-emerald-600">+{formatCurrency(inc.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Expenses */}
            <Card title="Recent Expense Entries">
              {expenses.length === 0 ? (
                <EmptyState title="No expense entries" description="No expenses have been recorded yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {expenses.slice(0, 5).map((exp) => (
                    <div key={exp.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-800">{exp.description}</p>
                        <p className="text-xs text-slate-500">{exp.vendor ? `${exp.vendor} | ` : ''}{exp.category || 'General'} | {formatDate(exp.expense_date)}</p>
                      </div>
                      <span className="font-semibold text-rose-600">-{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Income Tab */}
      {activeTab === 'income' && canManageFinance && (
        <Card>
          {incomes.length === 0 ? (
            <EmptyState
              title="No income records"
              description="Record incoming funds, grants, ticket sales or donations."
              action={<Button onClick={() => setIsIncomeModalOpen(true)}>Record Income</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Date Received</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{inc.source}</td>
                      <td className="px-4 py-3">{inc.category || 'General'}</td>
                      <td className="px-4 py-3 text-slate-500">{inc.description || 'None'}</td>
                      <td className="px-4 py-3">{formatDate(inc.received_date)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">+{formatCurrency(inc.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && canManageFinance && (
        <Card>
          {expenses.length === 0 ? (
            <EmptyState
              title="No expense records"
              description="Record operational spending, equipment, catering and event costs."
              action={<Button onClick={() => setIsExpenseModalOpen(true)}>Record Expense</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{exp.description}</td>
                      <td className="px-4 py-3">{exp.category || 'General'}</td>
                      <td className="px-4 py-3 text-slate-500">{exp.vendor || 'N/A'}</td>
                      <td className="px-4 py-3">{formatDate(exp.expense_date)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={exp.status === 'approved' ? 'success' : 'default'}>{exp.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-rose-600">-{formatCurrency(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Reimbursements Tab */}
      {activeTab === 'reimbursements' && (
        <Card>
          {reimbursements.length === 0 ? (
            <EmptyState
              title="No reimbursement claims"
              description="Submit expense reimbursement requests with receipts."
              action={<Button onClick={() => setIsReimbursementModalOpen(true)}>Request Reimbursement</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Requested By</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Receipt</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Submitted</th>
                    {canManageFinance && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reimbursements.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{r.requested_by}</td>
                      <td className="px-4 py-3">{r.description}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(r.amount)}</td>
                      <td className="px-4 py-3">
                        {r.receipt_url ? (
                          <a
                            href={r.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline text-xs"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">None attached</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            r.status === 'approved' || r.status === 'paid'
                              ? 'success'
                              : r.status === 'rejected'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(r.submitted_at)}</td>
                      {canManageFinance && (
                        <td className="px-4 py-3 text-right space-x-1">
                          {r.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateReimbursementStatus(r.id, 'approved')}
                                className="px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded border border-emerald-200 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateReimbursementStatus(r.id, 'rejected')}
                                className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 rounded border border-rose-200 hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateReimbursementStatus(r.id, 'paid')}
                              className="px-2 py-1 text-xs font-medium text-sky-700 bg-sky-50 rounded border border-sky-200 hover:bg-sky-100"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Record Income Modal */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Record Income Entry"
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <Input
            label="Source / Payer"
            required
            placeholder="e.g., Student Union Grant, Ticket Sales"
            value={incomeForm.source}
            onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
          />
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={incomeForm.amount}
            onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
          />
          <Select
            label="Category"
            value={incomeForm.category}
            onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
            options={[
              { value: 'Sponsorship', label: 'Sponsorship' },
              { value: 'Grant', label: 'Grant' },
              { value: 'Ticket Sales', label: 'Ticket Sales' },
              { value: 'Merchandise', label: 'Merchandise' },
              { value: 'Donation', label: 'Donation' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Date Received"
            type="date"
            required
            value={incomeForm.received_date}
            onChange={(e) => setIncomeForm({ ...incomeForm, received_date: e.target.value })}
          />
          <Input
            label="Description (Optional)"
            placeholder="Reference notes or memo"
            value={incomeForm.description}
            onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setIsIncomeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Save Income'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Record Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Organization Expense"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <Input
            label="Description"
            required
            placeholder="e.g., Refreshments for General Body Meeting"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
          />
          <Select
            label="Category"
            value={expenseForm.category}
            onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            options={[
              { value: 'Events', label: 'Events' },
              { value: 'Equipment', label: 'Equipment' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Food & Catering', label: 'Food & Catering' },
              { value: 'Logistics', label: 'Logistics' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Input
            label="Vendor / Payee (Optional)"
            placeholder="e.g., Campus Bookstore, Pizza Store"
            value={expenseForm.vendor}
            onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
          />
          <Input
            label="Expense Date"
            type="date"
            required
            value={expenseForm.expense_date}
            onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Recording...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Reimbursement Modal */}
      <Modal
        isOpen={isReimbursementModalOpen}
        onClose={() => setIsReimbursementModalOpen(false)}
        title="Request Expense Reimbursement"
      >
        <form onSubmit={handleCreateReimbursement} className="space-y-4">
          <Input
            label="Your Name / Member Name"
            required
            placeholder="Full Name"
            value={reimbursementForm.requested_by}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, requested_by: e.target.value })}
          />
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            value={reimbursementForm.amount}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, amount: e.target.value })}
          />
          <Input
            label="Expense Description"
            required
            placeholder="Describe what was purchased and for which event/activity"
            value={reimbursementForm.description}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, description: e.target.value })}
          />
          <Input
            label="Receipt URL / Link (Optional)"
            placeholder="Link to uploaded receipt file or cloud drive"
            value={reimbursementForm.receipt_url}
            onChange={(e) => setReimbursementForm({ ...reimbursementForm, receipt_url: e.target.value })}
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setIsReimbursementModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
