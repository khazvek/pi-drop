import React from 'react';
import { Monitor, Wifi } from 'lucide-react';

interface SystemStatusProps {
  isDark: boolean;
}

export default function SystemStatus({ isDark }: SystemStatusProps) {
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
              isDark ? 'text-green-400' : 'text-green-600'
            }`} />
            <h3 className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              System Status
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-xs ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              Online
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
              <Wifi className={`h-4 w-4 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Network
              </span>
            </div>
            <p className={`text-sm font-mono ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              Local Network
            </p>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Status
              </span>
              <span className={`text-sm font-mono ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}