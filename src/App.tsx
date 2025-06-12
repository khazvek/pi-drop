import React, { useState, useEffect } from 'react';
import { Moon, Sun, Cherry as Raspberry } from 'lucide-react';
import FileUpload from './components/FileUpload';
import MessageSystem from './components/MessageSystem';
import SystemStatus from './components/SystemStatus';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-900' 
        : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-200 ${
        isDark 
          ? 'bg-gray-900/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-red-900/30' : 'bg-red-100'
              }`}>
                <Raspberry className={`h-5 w-5 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Kaury Pi Hub
                </h1>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Local Transfer & Messaging
                </p>
              </div>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <div className="lg:col-span-2">
            <FileUpload isDark={isDark} />
          </div>

          {/* System Status */}
          <div>
            <SystemStatus isDark={isDark} />
          </div>
        </div>

        {/* Message System */}
        <div className="mt-6">
          <MessageSystem isDark={isDark} />
        </div>
      </main>
    </div>
  );
}

export default App;