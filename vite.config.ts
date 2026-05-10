import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function shortGitSha(): string {
    const env = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.VITE_GIT_SHA || '';
    if (env.length >= 7) return env.slice(0, 7);
    if (env.length > 0) return env;
    try {
        return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
}

const VITE_GIT_SHA = shortGitSha();

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'html-git-sha-meta',
            transformIndexHtml(html: string) {
                return html.replace(
                    '</head>',
                    `<meta name="x-git-sha" content="${VITE_GIT_SHA}" />\n` +
                        `<meta http-equiv="Cache-Control" content="no-cache" />\n</head>`,
                );
            },
        },
    ],
    define: {
        'import.meta.env.VITE_GIT_SHA': JSON.stringify(VITE_GIT_SHA),
    },
});
