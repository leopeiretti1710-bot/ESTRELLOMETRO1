import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import basicSsl from '@vitejs/plugin-basic-ssl';
// basicSsl: sirve la app por https en desarrollo (el celular solo deja usar la cámara en páginas https)
export default defineConfig({plugins:[react(),basicSsl()]});
