import { createApp, h } from 'vue';
import Toast from '../components/Toast.vue';

interface ToastOptions {
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right';
}

export function showToast(options: ToastOptions) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  const app = createApp({
    render() {
      return h(Toast, {
        ...options,
        onVnodeMounted: () => {
          setTimeout(() => {
            app.unmount();
            document.body.removeChild(container);
          }, options.duration || 3000);
        }
      });
    }
  });

  app.mount(container);
}

export const toast = {
  success: (message: string, title?: string, duration = 3000) =>
    showToast({ message, title, type: 'success', duration }),

  error: (message: string, title?: string, duration = 3000) =>
    showToast({ message, title, type: 'error', duration }),

  warning: (message: string, title?: string, duration = 3000) =>
    showToast({ message, title, type: 'warning', duration }),

  info: (message: string, title?: string, duration = 3000) =>
    showToast({ message, title, type: 'info', duration })
};
