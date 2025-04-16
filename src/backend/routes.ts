import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const routes = express.Router();
routes.get('/logs', (req, res) => {
    const folder = req.query.folder;
    if (!folder) return res.status(400).send('Missing folder');

    exec(`pm2 logs ${folder} --lines 100 --nostream`, (err, stdout, stderr) => {
        if (err) return res.status(500).send(stderr || 'Failed to get logs');
        res.send(stdout);
    });
});
routes.get('/apps', (_, res) => {
    const basePath = process.env.PLATFORM_BASE_PATH ||'';
    const apps = fs.readdirSync(basePath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent, index) => {
            return {
                name: dirent.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), // format name
                folder: dirent.name,
                port: process.env.PLATFORM_PORT || 3000,
            };
        });

    res.json(apps);
});
routes.get('/status', (_, res) => {
    exec('pm2 jlist', (err, stdout, stderr) => {
        if (err) return res.status(500).json({ error: stderr });

        const list = JSON.parse(stdout);
        const statusMap: Record<string, string> = {};

        list.forEach((proc: { name: any; pm2_env: { status: any; }; }) => {
            const name = proc.name; // name in PM2
            const status = proc.pm2_env.status;
            statusMap[name] = status;
        });

        res.json(statusMap);
    });
});

routes.post('/start', (req, res) => {
    const basePath = process.env.PLATFORM_BASE_PATH ||'';
    const folder = req.body.folder;
    if (!folder) return res.status(400).json({ error: 'Missing folder name' });

    const fullPath = path.join(basePath || '', folder);

    // ✅ Use npm run dev via PM2
    const cmd = `pm2 start npm --name "${folder}" -- run dev --update-env`;

    exec(cmd, { cwd: fullPath }, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ PM2 start error:`, stderr);
            return res.status(500).json({ error: 'Failed to start app', details: stderr });
        }

        console.log(`✅ Started ${folder} with npm run dev`);
        res.json({ message: `Started ${folder}`, output: stdout });
    });
});

routes.post('/stop', (req, res) => {
    const folder = req.body.folder;
    if (!folder) {
        return res.status(400).json({ error: 'Missing folder name' });
    }

    const cmd = `pm2 delete ${folder}`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ PM2 stop error:`, stderr);
            return res.status(500).json({ error: 'Failed to stop app', details: stderr });
        }

        console.log(`🛑 Stopped app: ${folder}`);
        res.json({ message: `Stopped ${folder}`, output: stdout });
    });
});