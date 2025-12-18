<template>
  <Transition name="toast">
    <div v-if="visible" class="toast" :class="[`toast-${type}`, position]">
      <div class="toast-icon">
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="toast-content">
        <div v-if="title" class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-right';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  position: 'top'
});

const visible = ref(true);
let timer: number | null = null;

watch(() => visible.value, (newVal) => {
  if (newVal && props.duration > 0) {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(() => {
      visible.value = false;
    }, props.duration);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 500px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.toast.top {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast.bottom {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast.top-right {
  top: 20px;
  right: 20px;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.toast-success .toast-icon {
  background-color: #d1fae5;
  color: #065f46;
}

.toast-error .toast-icon {
  background-color: #fee2e2;
  color: #991b1b;
}

.toast-warning .toast-icon {
  background-color: #fef3c7;
  color: #92400e;
}

.toast-info .toast-icon {
  background-color: #dbeafe;
  color: #1e40af;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 15px;
  color: #1f2937;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  color: #6b7280;
  word-wrap: break-word;
}

/* 动画 */
.toast-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.2s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

.toast.top-right.toast-enter-active {
  animation: toast-in-right 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes toast-in-right {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .toast {
    min-width: auto;
    max-width: calc(100vw - 40px);
    left: 20px !important;
    right: 20px !important;
    transform: none !important;
  }

  .toast.top-right {
    left: 20px;
    right: 20px;
  }
}
</style>
