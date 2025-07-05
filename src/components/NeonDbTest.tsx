import React, { useEffect, useState } from 'react';
import { testConnection } from '../services/neonApiService';

const NeonDbTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    const runTest = async () => {
      try {
        console.log('Testing Neon DB connection...');
        
        // Log the connection string (with password masked)
        const connectionString = 'postgresql://neondb_owner:***@ep-misty-bird-a8emrqlr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';
        console.log('Using connection string:', connectionString);
        
        // Test the connection
        const result = await testConnection();
        console.log('Test result:', result);
        
        if (result.success) {
          setTestResult(result.result);
          setConnectionStatus('success');
        } else {
          throw new Error('Connection test failed');
        }
      } catch (error) {
        console.error('Neon DB connection error:', error);
        
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setConnectionStatus('error');
      }
    };

    runTest();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Neon DB Connection Test</h2>
      
      {connectionStatus === 'loading' && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <p>Testing connection...</p>
        </div>
      )}
      
      {connectionStatus === 'success' && (
        <div className="space-y-4">
          <div className="bg-green-100 text-green-700 p-3 rounded-md">
            <p className="font-semibold">Connection successful!</p>
            <p className="text-sm">The Neon DB connection is working properly.</p>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="font-medium mb-2">Test Query Result:</p>
            <pre className="text-xs overflow-auto bg-gray-800 text-white p-2 rounded">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md">
          <p className="font-semibold">Connection failed</p>
          <p className="text-sm">{errorMessage}</p>
          <p className="text-xs mt-2">Check the browser console for more details.</p>
        </div>
      )}
    </div>
  );
};

export default NeonDbTest; 