import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
          <span className="text-5xl">🚫</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Access Denied</h2>
          <p className="text-gray-600 mt-2 text-sm">
            You do not have administrator privileges to view this page.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
