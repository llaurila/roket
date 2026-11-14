interface InstallPromptEvent extends Event {
    prompt: () => Promise<void>;
}

const DISMISSED_KEY = "installSuggestionDismissed";
const IOS_MESSAGE = "Install Roket: open the Share menu and choose Add to Home Screen.";

let suggestion: InstallSuggestion | undefined;

export function initializeInstallSuggestion() {
    suggestion = new InstallSuggestion();
}

export function setInstallSuggestionMenuVisible(visible: boolean) {
    suggestion?.setMenuVisible(visible);
}

export class InstallSuggestion {
    private readonly panel = document.getElementById("install-suggestion") as HTMLElement;
    private readonly message = document.getElementById("install-message") as HTMLElement;
    private readonly installButton =
        document.getElementById("install-button") as HTMLButtonElement;
    private readonly dismissButton =
        document.getElementById("install-dismiss") as HTMLButtonElement;
    private promptEvent: InstallPromptEvent | undefined;
    private menuVisible = false;
    private dismissed = this.wasDismissed();
    private installed = this.isInstalled();
    private readonly ios = this.isIos();

    public constructor() {
        window.addEventListener("beforeinstallprompt", (event) => { this.onInstallPrompt(event); });
        window.addEventListener("appinstalled", () => { this.onInstalled(); });
        this.installButton.addEventListener("click", () => { void this.install(); });
        this.dismissButton.addEventListener("click", () => { this.dismiss(); });
        if (this.ios) {
            this.message.textContent = IOS_MESSAGE;
            this.installButton.hidden = true;
        }
        this.updateVisibility();
    }

    public setMenuVisible(visible: boolean) {
        this.menuVisible = visible;
        this.updateVisibility();
    }

    private onInstallPrompt(event: Event) {
        event.preventDefault();
        this.promptEvent = event as InstallPromptEvent;
        this.updateVisibility();
    }

    private async install() {
        const event = this.promptEvent;
        if (!event) return;
        this.promptEvent = undefined;
        this.updateVisibility();
        try {
            await event.prompt();
        } catch {
            // The browser may reject a prompt that is no longer available.
        }
    }

    private dismiss() {
        this.dismissed = true;
        try {
            sessionStorage.setItem(DISMISSED_KEY, "true");
        } catch {
            // Storage can be unavailable in private browsing.
        }
        this.updateVisibility();
    }

    private onInstalled() {
        this.installed = true;
        this.promptEvent = undefined;
        this.updateVisibility();
    }

    private updateVisibility() {
        const available = this.ios || !!this.promptEvent;
        this.panel.hidden = !this.menuVisible || this.dismissed || this.installed || !available;
    }

    private wasDismissed(): boolean {
        try {
            return sessionStorage.getItem(DISMISSED_KEY) === "true";
        } catch {
            return false;
        }
    }

    private isInstalled(): boolean {
        const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
        return navigatorWithStandalone.standalone === true ||
            window.matchMedia("(display-mode: standalone)").matches ||
            window.matchMedia("(display-mode: fullscreen)").matches;
    }

    private isIos(): boolean {
        return /iPad|iPhone|iPod/u.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }
}
