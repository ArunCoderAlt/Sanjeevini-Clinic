import React, { Suspense, lazy } from 'react';
import Loading from '../components/common/Loading';

const AdminApp = lazy(() => import('../admin/AdminApp'));

export default function AdminRoutes() {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <AdminApp />
    </Suspense>
  );
}
