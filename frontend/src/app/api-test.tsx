'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Temporary component to test API connection
 * TODO: Remove before phase complete
 */
export function ApiTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get<{ status: string; timestamp: string }>('/health')
      .then((response) => {
        if (response.success && response.data) {
          setStatus('success');
          setMessage(`Connected: ${response.data.status} at ${response.data.timestamp}`);
        } else {
          setStatus('error');
          setMessage(response.error || 'Unknown error');
        }
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'Connection failed');
      });
  }, []);

  return (
    <div className="mb-4 rounded-lg border p-4">
      <h2 className="mb-2 text-lg font-bold">API Connection Test</h2>
      <p className={status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-gray-600'}>
        {status === 'loading' && 'Connecting...'}
        {status === 'success' && `✓ ${message}`}
        {status === 'error' && `✗ ${message}`}
      </p>
    </div>
  );
}

