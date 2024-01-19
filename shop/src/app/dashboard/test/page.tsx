'use client'

import React from 'react';
import { useDashboardData } from '@/data/useDashboardData'; // Assuming this is the correct path to your hook
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Page = () => {
  const payments = useDashboardData(); // Use the custom hook to get payments data

  return (
    <Card>
      <CardHeader>
          <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display the payments data */}
        <pre>{JSON.stringify(payments, null, 2)}</pre>
      </CardContent>
    </Card>
  );
};

export default Page;
