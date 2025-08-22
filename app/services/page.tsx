import React, { Suspense } from 'react';
import ClientServicesPage from './ClientServicesPage';

export default function ServicesPage() {
  return (
    <Suspense>
      {/* Client component handles useSearchParams and router navigation */}
      <ClientServicesPage />
    </Suspense>
  );
}
