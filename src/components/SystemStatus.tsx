import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Wifi, HardDrive, Cpu, Thermometer } from 'lucide-react';

interface SystemStatusProps {
  isDark: boolean;
}

export default function SystemStatus({ isDark }: SystemStatusProps) {
  const [systemInfo, setSystemInfo] = useState({
    ipAddress: '192.168.1.125',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    temperature: 0,
    uptime: '2d 14h 32m'
  });

  const updateSystemInfo = useCallback(() => {
    setSystemInfo(prev => ({
      ...prev,
      cpuUsage: Math.random() * 100,
      memoryUsage: 35 + Math.random() * 20,
      diskUsage: 42 + Math.random() * 10,
      temperature: 45 + Math.random() * 15
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateSystemInfo, 3000);
    return () => clearInterval(interval);
  }, [updateSystemInfo]);

  const getUsageColor = useCallback((usage: number) => {
    if (usage < 50) return isDark ? 'text-green-400' : 'text-green-600';
    if (usage < 80) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  }, [isDark]);

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
              {systemInfo.ipAddress}
            </p>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Cpu className={`h-4 w-4 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  CPU
                </span>
              </div>
              <span className={`text-xs font-mono ${
                getUsageColor(systemInfo.cpuUsage)
              }`}>
                {systemInfo.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <div
                className="h-1.5 rounded-full bg-purple-500 transition-all duration-500"
                style={{ width: `${systemInfo.cpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <HardDrive className={`h-4 w-4 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Memory
                </span>
              </div>
              <span className={`text-xs font-mono ${
                getUsageColor(systemInfo.memoryUsage)
              }`}>
                {systemInfo.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <div
                className="h-1.5 rounded-full bg-orange-500 transition-all duration-500"
                style={{ width: `${systemInfo.memoryUsage}%` }}
              ></div>
            </div>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className={`h-4 w-4 ${
                  isDark ? 'text-red-400' : 'text-red-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Temp
                </span>
              </div>
              <span className={`text-sm font-mono ${
                systemInfo.temperature > 60 
                  ? isDark ? 'text-red-400' : 'text-red-600'
                  : isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {systemInfo.temperature.toFixed(1)}°C
              </span>
            </div>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Uptime
              </span>
              <span className={`text-sm font-mono ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`}>
                {systemInfo.uptime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}