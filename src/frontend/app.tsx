import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';

type App = {
    name: string;
    folder: string;
    port: number;
};

const BASE_URL = 'http://cang-vm.sg:5172';
const PLATFORM_URL = 'http://cang-vm.sg';

export default function AppManager() {
    const [apps, setApps] = useState<App[]>([]);
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const [logs, setLogs] = useState<Record<string, string>>({});
    const [customCommands, setCustomCommands] = useState<Record<string, string>>({});
    const [loadingCommand, setLoadingCommand] = useState<Record<string, boolean>>({});

    const [logIntervals, setLogIntervals] = useState<Record<string, NodeJS.Timeout>>({});

    const fetchApps = async () => {
        const res = await fetch(`${BASE_URL}/api/apps`);
        const data = (await res.json()) as App[];
        setApps(data);
    };

    const fetchStatuses = async () => {
        const res = await fetch(`${BASE_URL}/api/status`);
        const data = await res.json();
        setStatuses(data); // set into state
    };

    const fetchLogs = async (folder: string) => {
        const res = await fetch(`${BASE_URL}/api/logs?folder=${folder}`);
        const data = await res.text();
        setLogs((prev) => ({ ...prev, [folder]: data }));
    };

    const handleAction = async (app: App, action: string) => {
        await fetch(`${BASE_URL}/api/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: app.folder }),
        });

        await fetchLogs(app.folder);
        await fetchStatuses();
    };

    const startPollingLog = (folder: string) => {
      if (logIntervals[folder]) return;
      fetchLogs(folder);
      const interval = setInterval(() => fetchLogs(folder), 2000);
      setLogIntervals((prev) => ({ ...prev, [folder]: interval }));
    };

    const stopPollingLog = (folder: string) => {
        if (logIntervals[folder]) {
            clearInterval(logIntervals[folder]);
            setLogIntervals((prev) => {
                const newIntervals = { ...prev };
                delete newIntervals[folder];
                return newIntervals;
            });
        }
        setLogs((prev) => {
            const newLogs = { ...prev };
            delete newLogs[folder];
            return newLogs;
        });
    };


    useEffect(() => {
      fetchApps();
      fetchStatuses();
  }, []);

    return (
        <div className="p-6 space-y-6">
  <div className="overflow-x-auto rounded shadow border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Apps</th>
          <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Port</th>
          <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {apps.map((app) => (
          <React.Fragment key={app.name}>
            <tr>
              <td className="px-6 py-4 font-medium text-gray-800">{app.name}</td>
              <td className="px-6 py-4 text-gray-700">{app.port}</td>
              <td className="px-6 py-4 text-gray-700">
                <p>Status: {statuses[app.folder] || 'N/A'}</p>
              </td>
              <td className="px-6 py-4 space-x-2">
                {statuses[app.folder.toLowerCase()] !== 'online' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-sm"
                    onClick={() => handleAction(app, 'start')}
                  >
                    Start
                  </Button>
                )}

                {statuses[app.folder.toLowerCase()] === 'online' && (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm"
                    onClick={() => handleAction(app, 'stop')}
                  >
                    Stop
                  </Button>
                )}

                {!logs[app.folder] && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
                    onClick={() => startPollingLog(app.folder)}
                  >
                    View Logs
                  </Button>
                )}

                {logs[app.folder] && (
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 text-sm"
                    onClick={() => stopPollingLog(app.folder)}
                  >
                    Hide Logs
                  </Button>
                )}

                <a
                  href={`${PLATFORM_URL}:${app.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-red-700 text-white px-2 py-1 text-sm rounded inline-block text-center"
                >
                  Open
                </a>
                
                {app.name =='V2 Sync' && 
                  (<div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter command"
                    value={customCommands[app.folder] || ''}
                    onChange={(e) =>
                      setCustomCommands((prev) => ({
                        ...prev,
                        [app.folder]: e.target.value,
                      }))
                    }
                    className="text-sm px-2 py-1 border border-gray-300 rounded w-full"
                  />
                  <Button
                  className={`mt-1 px-2 py-1 text-sm text-white rounded ${
                    loadingCommand[app.folder]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  disabled={loadingCommand[app.folder]}
                  onClick={async () => {
                    const cmd = customCommands[app.folder];
                    if (!cmd) return alert('Please enter a command');

                    // Set loading state
                    setLoadingCommand((prev) => ({ ...prev, [app.folder]: true }));

                    try {
                      const res = await fetch(`${BASE_URL}/api/run-command`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ folder: app.folder, command: cmd }),
                      });
                      await fetchLogs(app.folder);
                    } catch (err) {
                      console.error(err);
                      alert('Failed to run command.');
                    } finally {
                      // Reset loading state
                      setLoadingCommand((prev) => ({ ...prev, [app.folder]: false }));
                    }
                  }}
                >
                  {loadingCommand[app.folder] ? 'Running...' : 'Run Command'}
                </Button>
                </div>)
                }
              </td>   
            </tr>

            {logs[app.folder] && (
                <tr>
                <td colSpan={4} className="px-6 py-4 bg-black text-green-400 text-xs font-mono rounded-b">
                  <div className="max-h-96 overflow-y-auto overflow-x-hidden break-words whitespace-pre-wrap">
                    <pre className="break-all whitespace-pre-wrap text-wrap">{logs[app.folder]}</pre>
                  </div>
                </td>
              </tr>
                )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  </div>
</div>
    );
}