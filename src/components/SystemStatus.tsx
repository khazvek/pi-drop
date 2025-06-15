import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, Server, HardDrive } from 'lucide-react';

interface SystemStatusProps {
  isDark: boolean;
}

export default function SystemStatus({ isDark }: SystemStatusProps) {
  const [localIP, setLocalIP] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    // Get local IP address
    setLocalIP(window.location.hostname);
    
    // Check server status
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/files');
        setServerStatus(response.ok ? 'online' : 'offline');
      } catch {
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`rounded-lg border transition-colors duration-200 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`p-4 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className={`h-5 w-5 ${
              serverStatus === 'online' 
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              System Status
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={`text-xs ${
              serverStatus === 'online'
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {serverStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <Server className={`h-4 w-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Server
              </span>
            </div>
            <p className={`text-sm font-mono ${
              serverStatus === 'online'
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              {serverStatus === 'online' ? 'Running' : 'Disconnected'}
            </p>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <Wifi className={`h-4 w-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Network Address
              </span>
            </div>
            <p className={`text-sm font-mono ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {localIP || 'localhost'}:{window.location.port || '3001'}
            </p>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              <HardDrive className={`h-4 w-4 ${
                isDark ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                File Storage
              </span>
            </div>
            <p className={`text-sm font-mono ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              Up to 25GB per file
            </p>
          </div>

          <div className={`p-3 rounded border-2 border-dashed ${
            isDark ? 'border-blue-600 bg-blue-900/20' : 'border-blue-300 bg-blue-50'
          }`}>
            <p className={`text-xs ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <strong>Access from other devices:</strong><br/>
              Connect to the same WiFi network and visit:<br/>
              <span className="font-mono">http://{localIP}:{window.location.port || '3001'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}