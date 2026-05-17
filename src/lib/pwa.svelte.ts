class PwaState {
	installPrompt = $state<any>(null);
	isInstalled = $state<boolean>(false);

	constructor() {
		if (typeof window !== 'undefined') {
			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				this.installPrompt = e;
			});

			window.addEventListener('appinstalled', () => {
				this.isInstalled = true;
				this.installPrompt = null;
			});
		}
	}

	async install() {
		if (!this.installPrompt) return;
		this.installPrompt.prompt();
		const { outcome } = await this.installPrompt.userChoice;
		if (outcome === 'accepted') {
			this.installPrompt = null;
		}
	}
}

export const pwa = new PwaState();
