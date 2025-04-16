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
                                <td className="px-6 py-4 text-gray-700"><p>Status: {statuses[app.folder] || 'N/A'}</p></td>
                                <td className="px-6 py-4 space-x-2">
                                    {statuses[app.folder.toLowerCase()] !== 'online' &&
                                        (<Button
                                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-sm"
                                            onClick={() => handleAction(app, 'start')}>
                                            Start
                                        </Button>)
                                    }

                                    {statuses[app.folder.toLowerCase()] === 'online' && (
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm"
                                            onClick={() => handleAction(app, 'stop')}
                                        >
                                            Stop
                                        </Button>
                                    )}

                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 text-sm"
                                            onClick={() => fetchLogs(app.folder)}>
                                        View Logs
                                    </Button>
                                    <a
                                        href={`${PLATFORM_URL}:${app.port}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm rounded inline-block text-center"
                                    >
                                        Open
                                    </a>
                                </td>
                            </tr>
                            {logs[app.folder] && (
                                <tr>
                                    <td colSpan={4}
                                        className="px-6 py-4 bg-black text-green-400 font-mono text-xs whitespace-pre-wrap rounded-b">
                                        <pre>{logs[app.folder]}</pre>
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