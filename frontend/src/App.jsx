import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Components
import ProtectedRoute from '../components/ProtectedRoute';
import ChatbotWidget from '../components/ChatbotWidget';

// Pages
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Events from '../pages/Events';
import Tickets from '../pages/Tickets';
import Announcements from '../pages/Announcements';
import Merchandise from '../pages/Merchandise';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Fundraisers from '../pages/Fundraisers';
import Finance from '../pages/Finance';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import NotFound from '../pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Authentication Routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
        </Route>

        {/* Protected Dashboard Routes with DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/members" element={<Members />} />
          <Route path="/events" element={<Events />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/merchandise" element={<Merchandise />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/fundraisers" element={<Fundraisers />} />
          <Route path="/finance" element={<Finance />} />
        </Route>
      </Routes>

      {/* Global AI Chatbot Widget */}
      <ChatbotWidget />
    </BrowserRouter>
  );
}

