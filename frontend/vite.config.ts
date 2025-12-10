// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Vite는 프로젝트 루트(= frontend) 기준으로 env를 읽습니다.
    const env = loadEnv(mode, process.cwd(), ''); // VITE_* 포함
    const target = (env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

    console.log('[vite] API proxy target =', target);

    return {
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target,
                    changeOrigin: true,
                    secure: false,
                    // 백엔드가 /api 프리픽스를 그대로 쓰면 rewrite 불필요
                    // rewrite: (path) => path, // 그대로 둠
                },
            },
        },
        build: {
            outDir: '../build',
        },
        resolve: {
            alias: { '@': path.resolve(__dirname, './src') },
        },
    };
});
