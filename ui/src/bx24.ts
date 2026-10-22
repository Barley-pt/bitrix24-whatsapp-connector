/** Shared ambient type for the legacy BX24 script (install.ts loads `//api.bitrix24.com/api/v1/`).
 * A single declaration: TypeScript requires every `declare global` for the same interface member
 * to agree exactly, so this must not be duplicated per component. */
declare global {
  interface Window {
    BX24?: {
      init(callback: () => void): void;
      closeApplication(callback?: () => void): void;
      callMethod(method: string, params?: object, callback?: (result: any) => void): void;
      im?: { openMessenger(dialogId: string, callback?: () => void): void };
    };
  }
}

export {};
