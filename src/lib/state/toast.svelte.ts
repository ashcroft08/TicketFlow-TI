class ToastState {
    toasts = $state<{ id: number; type: 'success' | 'error' | 'info' | 'warning'; message: string; duration: number }[]>([]);
    nextId = 0;

    show(type: 'success' | 'error' | 'info' | 'warning', message: string, duration = 4000) {
        const id = this.nextId++;
        this.toasts = [...this.toasts, { id, type, message, duration }];
        
        setTimeout(() => {
            this.dismiss(id);
        }, duration);
    }

    success(message: string, duration = 4000) {
        this.show('success', message, duration);
    }

    error(message: string, duration = 4000) {
        this.show('error', message, duration);
    }

    info(message: string, duration = 4000) {
        this.show('info', message, duration);
    }

    warning(message: string, duration = 4000) {
        this.show('warning', message, duration);
    }

    dismiss(id: number) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}

export const toast = new ToastState();
