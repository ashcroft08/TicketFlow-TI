class ConfirmState {
    show = $state(false);
    title = $state('¿Estás seguro?');
    message = $state('Esta acción no se puede deshacer.');
    onConfirmCallback = $state<(() => void) | null>(null);

    ask(title: string, message: string, onConfirm: () => void) {
        this.title = title;
        this.message = message;
        this.onConfirmCallback = onConfirm;
        this.show = true;
    }

    confirm() {
        if (this.onConfirmCallback) {
            try {
                this.onConfirmCallback();
            } catch (err) {
                console.error('Error executing confirm callback:', err);
            }
        }
        this.show = false;
        this.onConfirmCallback = null;
    }

    cancel() {
        this.show = false;
        this.onConfirmCallback = null;
    }
}

export const confirmState = new ConfirmState();
