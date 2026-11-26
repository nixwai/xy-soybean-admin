import { createPinia, setActivePinia } from 'pinia';

// 页面级 Pinia store 需要在无组件实例的场景下可用，测试进程统一激活一个实例。
setActivePinia(createPinia());

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();
const eventListeners = new Map<string, Set<EventListener>>();

const windowStub = {
  localStorage: memoryLocalStorage,
  sessionStorage: memorySessionStorage,
  addEventListener(type: string, listener: EventListener) {
    const listeners = eventListeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    eventListeners.set(type, listeners);
  },
  removeEventListener(type: string, listener: EventListener) {
    eventListeners.get(type)?.delete(listener);
  },
  open: () => undefined,
  $message: {
    error: () => undefined,
    success: () => undefined,
    warning: () => undefined
  },
  $dialog: { error: () => undefined },
  $notification: { success: () => undefined }
};

globalThis.window = windowStub as unknown as Window & typeof globalThis;
globalThis.localStorage = memoryLocalStorage;
globalThis.sessionStorage = memorySessionStorage;
