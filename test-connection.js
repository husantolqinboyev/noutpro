// Test Supabase Connection
// Browser console da ishga tushiring

const testSupabaseConnection = async () => {
  const SUPABASE_URL = 'https://xbuyuflvmfauvdlpguem.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhidXl1Zmx2bWZhdXZkbHBndWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MDIzNjgsImV4cCI6MjA4NzI3ODM2OH0.a0hDbd0jmAe-p4ZSLx5BZMapnAxftAVPv9kr77E4qNI';
  
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic API connection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      console.log('🎉 Supabase connection successful!');
    } else {
      console.log('❌ Supabase connection failed:', response.statusText);
    }
    
    // Test auth endpoint
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    });
    
    console.log('🔐 Auth response status:', authResponse.status);
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('🔍 This is likely a CORS or network issue');
      console.log('📝 Check Supabase Dashboard → Settings → API → CORS settings');
    }
  }
};

// Run test
testSupabaseConnection();
