export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info';
}

class ToastState {
	list = $state<Toast[]>([]);

	show(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 4000) {
		const id = Math.random().toString(36).substring(2, 9);
		const newToast: Toast = { id, message, type };
		this.list = [...this.list, newToast];

		setTimeout(() => {
			this.remove(id);
		}, duration);
	}

	remove(id: string) {
		this.list = this.list.filter((t) => t.id !== id);
	}
}

export const toast = new ToastState();
