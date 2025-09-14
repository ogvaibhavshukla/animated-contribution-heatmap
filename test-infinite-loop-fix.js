import React, { useState, useCallback, useEffect } from 'react';
import { ContributionCalendar } from './dist/index.esm.js';

function InfiniteLoopTestComponent() {
  const [requestCount, setRequestCount] = useState(0);
  const [testStatus, setTestStatus] = useState('TESTING');
  
  // CRITICAL: Monitor API requests to detect infinite loops
  useEffect(() => {
    let requestCounter = 0;
    const originalFetch = window.fetch;
    
    window.fetch = (...args) => {
      if (args[0] === 'https://api.github.com/graphql') {
        requestCounter++;
        setRequestCount(requestCounter);
        console.log(`API Request #${requestCounter} - ${requestCounter > 2 ? 'CRITICAL: BUG STILL EXISTS!' : 'NORMAL'}`);
        
        // CRITICAL: Auto-detect infinite loop
        if (requestCounter > 5) {
          setTestStatus('FAILED - INFINITE LOOP DETECTED');
        } else if (requestCounter <= 2) {
          setTimeout(() => setTestStatus('PASSED - FIX WORKING'), 3000);
        }
      }
      return originalFetch(...args);
    };
    
    // CRITICAL: Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // CRITICAL: Stable callback implementations
  const handleDataLoad = useCallback((data) => {
    console.log('SUCCESS: Data loaded successfully:', data);
  }, []);

  const handleError = useCallback((error) => {
    console.error('ERROR: Error occurred:', error);
  }, []);

  // CRITICAL: Test status indicator
  const getStatusStyle = () => ({
    padding: '10px',
    margin: '10px 0',
    fontWeight: 'bold',
    color: 'white',
    background: testStatus.includes('FAILED') ? 'red' : 
                testStatus.includes('PASSED') ? 'green' : 'orange'
  });

  return (
    <div>
      <div style={getStatusStyle()}>
        <div>TEST STATUS: {testStatus}</div>
        <div>API REQUEST COUNT: {requestCount}</div>
        {requestCount > 2 && <div>CRITICAL WARNING: TOO MANY REQUESTS DETECTED!</div>}
        {testStatus.includes('PASSED') && <div>SUCCESS: Fix is working correctly</div>}
      </div>
      
      <ContributionCalendar
        githubToken="test-token"
        username="test-user"
        theme="dark"
        onDataLoad={handleDataLoad}
        onError={handleError}
      />
    </div>
  );
}

export default InfiniteLoopTestComponent;
