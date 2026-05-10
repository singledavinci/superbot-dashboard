import { execSync } from 'node:child_process';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function viteGitSha(): string {
    const env =
        process.env.RAILWAY_GIT_COMMIT_SHA ||
        process.env.RAILWAY_GIT_COMMIT ||
        process.env.VITE_GIT_SHA ||
        '';
    const trimmed = env.trim();
    if (/^[a-f0-9]{40}$/i.test(trimmed)) return trimmed.toLowerCase();
    if (/^[a-f0-9]{7,}$/i.test(trimmed)) return trimmed.toLowerCase();
    try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().toLowerCase();
    } catch {
        return 'unknown';
    }
}

const VITE_GIT_SHA = viteGitSha();

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
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
