import React, { useState, useEffect, useCallback } from 'react';
import { Monitor, Wifi, HardDrive, Cpu, Thermometer, AlertCircle, RefreshCw } from 'lucide-react';

interface SystemInfo {
  ipAddress: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  temperature: number;
  uptime: string;
  timestamp?: number;
  error?: string;
}

interface SystemStatusProps {
  isDark: boolean;
}

export default function SystemStatus({ isDark }: SystemStatusProps) {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    ipAddress: '127.0.0.1',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    temperature: 0,
    uptime: '0d 0h 0m'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/system-info');
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
        setIsOnline(true);
        setLastUpdate(new Date());
        setError(data.error || null);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (fetchError) {
      console.error('Error fetching system info:', fetchError);
      setIsOnline(false);
      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
      
      // Keep the last known data but mark as offline
      // Don't reset systemInfo to preserve last known values
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchSystemInfo();

    // Set up interval for regular updates
    const interval = setInterval(fetchSystemInfo, 3000);

    return () => clearInterval(interval);
  }, [fetchSystemInfo]);

  const getUsageColor = useCallback((usage: number) => {
    if (usage < 50) return isDark ? 'text-green-400' : 'text-green-600';
    if (usage < 80) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  }, [isDark]);

  const getTemperatureColor = useCallback((temp: number) => {
    if (temp < 50) return isDark ? 'text-green-400' : 'text-green-600';
    if (temp < 70) return isDark ? 'text-yellow-400' : 'text-yellow-600';
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
              isOnline 
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
            {isLoading ? (
              <RefreshCw className={`h-3 w-3 animate-spin ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
            ) : (
              <>
                <div className={`h-2 w-2 rounded-full ${
                  isOnline 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span className={`text-xs ${
                  isOnline 
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                }`}>
                  {isOnline ? 'Live Data' : 'Offline'}
                </span>
              </>
            )}
          </div>
        </div>
        {lastUpdate && (
          <p className={`text-xs mt-1 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="p-4">
        {!isOnline && !isLoading && (
          <div className={`p-3 rounded mb-4 flex items-start space-x-2 ${
            isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
          }`}>
            <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`} />
            <div className="min-w-0">
              <p className={`text-sm font-medium ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`}>
                System API Offline
              </p>
              <p className={`text-xs mt-1 ${
                isDark ? 'text-red-300' : 'text-red-500'
              }`}>
                Run "npm run server" in a new terminal to start the system monitoring service
              </p>
              {error && (
                <p className={`text-xs mt-1 font-mono ${
                  isDark ? 'text-red-200' : 'text-red-400'
                }`}>
                  Error: {error}
                </p>
              )}
            </div>
          </div>
        )}

        {systemInfo.error && isOnline && (
          <div className={`p-3 rounded mb-4 flex items-start space-x-2 ${
            isDark ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
            <div className="min-w-0">
              <p className={`text-xs ${
                isDark ? 'text-yellow-300' : 'text-yellow-600'
              }`}>
                {systemInfo.error}
              </p>
            </div>
          </div>
        )}

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
                style={{ width: `${Math.min(Math.max(systemInfo.cpuUsage, 0), 100)}%` }}
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
                style={{ width: `${Math.min(Math.max(systemInfo.memoryUsage, 0), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className={`p-3 rounded ${
            isDark ? 'bg-gray-700' : 'bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <HardDrive className={`h-4 w-4 ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Disk
                </span>
              </div>
              <span className={`text-xs font-mono ${
                getUsageColor(systemInfo.diskUsage)
              }`}>
                {systemInfo.diskUsage.toFixed(1)}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <div
                className="h-1.5 rounded-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${Math.min(Math.max(systemInfo.diskUsage, 0), 100)}%` }}
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
                  Temperature
                </span>
              </div>
              <span className={`text-sm font-mono ${
                getTemperatureColor(systemInfo.temperature)
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