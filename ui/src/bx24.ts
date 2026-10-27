/** Shared ambient type for the legacy BX24 script (install.ts loads `//api.bitrix24.com/api/v1/`).
 * A single declaration: TypeScript requires every `declare global` for the same interface member
 * to agree exactly, so this must not be duplicated per component. */
declare global {
  interface Window {
    BX24?: {
      init(callback: () => void): void;
      closeApplication(callback?: () => void): void;
      callMethod(method: string, params?: object, callback?: (result: any) => void): void;
      /** Resize the iframe to fit its content (Bitrix docs: BX24.fitWindow). */
      fitWindow?(): void;
      /** Legacy explicit size, used when fitWindow is unavailable. */
      resizeWindow?(width: number, height: number): void;
      im?: { openMessenger(dialogId: string, callback?: () => void): void };
    };
  }
}

/**
 * The Contact Center connector-settings iframe opens at Bitrix's small default height, which
 * forces scrolling through the number picker and Save button. Grow it to fit after BX24 has
 * initialised. Guarded end to end: outside Bitrix (window.BX24 undefined) this is a no-op, and
 * `init` may never call back on a broken script, so nothing here can throw or block the screen.
 *
 * fitWindow is the documented, content-aware call; resizeWindow is the fallback for older
 * portals, with a height comfortably above the default so the whole form is visible.
 */
export function fitConnectorSettingsWindow(): void {
  const bx = window.BX24;
  if (!bx) return;
  bx.init(() => {
    if (typeof bx.fitWindow === 'function') {
      bx.fitWindow();
      return;
    }
    if (typeof bx.resizeWindow === 'function') {
      bx.resizeWindow(Math.max(window.innerWidth || 0, 620), 720);
    }
  });
}

export {};
