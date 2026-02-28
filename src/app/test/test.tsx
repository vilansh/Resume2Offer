export default function TestPage() {
    return (
      <div style={{ padding: '40px', color: 'white', fontFamily: 'monospace' }}>
        <h2>Environment Check</h2>
        <br />
        <p>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ loaded' : '❌ MISSING'}</p>
        <p>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ loaded' : '❌ MISSING'}</p>
      </div>
    )
  }