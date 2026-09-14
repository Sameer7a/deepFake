import Link from 'next/link';

export default function Dashboard() {
  // Simulated global stats for the platform
  const stats = {
    threatsPrevented: "14,208",
    activeCampaigns: "43",
    financialLossPrevented: "$2.4M",
    reportsGenerated: "8,912"
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-gray-800 bg-gray-900/50 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-lg tracking-wide">RAKSHA</span>
            </div>
            
            {/* Nav Links */}
            <div className="hidden sm:flex gap-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Threat Scanner
              </Link>
              <span className="text-white font-bold border-b-2 border-red-500 pb-1">
                Global Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:inline-block">Logged in as Admin</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8 mt-4 animate-fade-in-up">
        
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Global Threat Intelligence</h1>
          <p className="text-gray-400">Real-time metrics on sextortion campaigns and deepfake mitigation across the network.</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Threats Prevented</span>
            <span className="text-5xl font-black text-green-500">{stats.threatsPrevented}</span>
            <span className="text-xs text-green-400 mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              +12% from last week
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Campaigns</span>
            <span className="text-5xl font-black text-red-500">{stats.activeCampaigns}</span>
            <span className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
              +3 new detected today
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Loss Prevented</span>
            <span className="text-5xl font-black text-blue-500">{stats.financialLossPrevented}</span>
            <span className="text-xs text-gray-500 mt-2">Estimated ransom demanded</span>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Reports to Cyber Police</span>
            <span className="text-5xl font-black text-orange-500">{stats.reportsGenerated}</span>
            <span className="text-xs text-gray-500 mt-2">Generated across all users</span>
          </div>

        </div>

        {/* Recent Activity Feed */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 bg-gray-950/50">
            <h2 className="text-xl font-bold text-white">Live Interception Feed</h2>
          </div>
          <ul className="divide-y divide-gray-800">
            {[
              { time: "Just now", action: "Critical threat blocked", location: "Mumbai, India", risk: "96/100" },
              { time: "2 min ago", action: "Deepfake image flagged", location: "Delhi, India", risk: "88/100" },
              { time: "5 min ago", action: "Extortion text analyzed", location: "Bangalore, India", risk: "92/100" },
              { time: "12 min ago", action: "Low risk message allowed", location: "Pune, India", risk: "12/100" },
              { time: "15 min ago", action: "Police report generated", location: "Chennai, India", risk: "98/100" }
            ].map((log, i) => (
              <li key={i} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${parseInt(log.risk) > 80 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-gray-200">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.location} • {log.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${parseInt(log.risk) > 80 ? 'text-red-400' : 'text-green-400'}`}>{log.risk}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
