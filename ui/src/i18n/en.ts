/** Default (fallback) locale. Keys are shared with every other catalog. */
export const en = {
  'app.title': 'WhatsApp Connector',
  'app.loadingPortal': 'Loading portal',
  'app.openFromPortal': 'Open this page from inside your Bitrix24 portal.',
  'app.theme.toLight': 'Switch to light theme',
  'app.theme.toDark': 'Switch to dark theme',
  'app.language.label': 'Language',
  'app.language.en': 'EN',
  'app.language.pt': 'PT',
  'app.eventsNotReady.title': 'Replies from Bitrix24 are not being delivered.',
  'app.eventsNotReady.body':
    'This portal is missing the security token Bitrix24 sends when the app is installed, so messages your operators send are dropped. Incoming WhatsApp messages are unaffected. Reopening this page retries automatically - if it keeps showing, reinstall the app.',
  'app.numbers.title': 'WhatsApp numbers',
  'app.numbers.subtitle': 'Each number feeds one Bitrix24 Open Line.',
  'app.planAllowsNumbers': 'Your plan allows {n} number(s).',
  'app.addNumber': 'Add number',

  'crm.openFromRecord': 'Open this from a lead, deal, contact or company in Bitrix24.',
  'crm.title': 'WhatsApp',
  'crm.subtitle': 'Open an existing conversation, or start a new one.',
  'crm.noPhone': 'This record has no phone number on file.',
  'crm.noNumbers': 'No WhatsApp numbers yet. Open the WhatsApp Connector app and add one first.',
  'crm.phoneLabel': 'Phone number',
  'crm.existingConversation': ' - existing conversation',
  'crm.notBound':
    "This number isn’t linked to an Open Line yet - pick it in Contact Center’s connector settings first.",
  'crm.starting': 'Starting...',
  'crm.openConversation': 'Open conversation',
  'crm.startConversation': 'Start conversation',

  'settings.openFromContactCenter':
    'Open this from the Open Channel connector settings in Contact Center.',
  'settings.title': 'Connect a WhatsApp number',
  'settings.subtitle': 'Pick which connected number feeds this Open Line.',
  'settings.savedClose': 'Saved. You can close this window.',
  'settings.noNumbers': 'No numbers yet. Open the WhatsApp Connector app and add one first.',
  'settings.allowGroup': 'Allow group messages',
  'settings.allowGroupHint':
    'WhatsApp groups this number belongs to will also feed this Open Line.',
  'settings.allowGroupNotInPlan': 'Not included in your current plan.',

  'license.activateTitle': 'Activate licence',
  'license.activateHint':
    'Enter the licence key you received after purchase to unlock this portal.',
  'license.activate': 'Activate',
  'license.activating': 'Activating...',
  'license.status.active': 'Licensed',
  'license.status.expired': 'Licence expired',
  'license.status.suspended': 'Licence suspended',
  'license.status.unlicensed': 'No licence',

  'portal.title': 'Bitrix24 portal',
  'portal.portal': 'Portal',
  'portal.installed': 'Installed',
  'portal.channel': 'Contact Center channel',
  'portal.registered': 'Registered',
  'portal.notRegistered': 'Not registered',
  'portal.conversationsThisMonth': 'Conversations this month',

  'status.connected': 'Connected',
  'status.need_scan': 'Waiting for QR scan',
  'status.connecting': 'Connecting',
  'status.disconnected': 'Disconnected',
  'status.logged_out': 'Logged out on the phone',
  'status.expired': 'Session expired',
  'status.unknown': 'Unknown',
  'status.openLine': 'Open Line {id}',
  'numbers.emptyTitle': 'No numbers connected yet',
  'numbers.emptyBody':
    'Add a number to link it by QR code. Once connected, its conversations arrive in the Contact Center.',
  'numbers.reconnect': 'Reconnect',

  'qr.alt': 'WhatsApp linking QR code',
  'qr.scanTitle': 'Scan with the phone that holds this number',
  'qr.scanHint': 'WhatsApp, Settings, Linked devices, Link a device.',
  'qr.status': 'Status: {status}',
  'qr.done': 'Done',
  'qr.connected': 'WhatsApp connected!',

  'add.label': 'Label',
  'add.labelHint': 'Only used to identify the number in this list.',
  'add.phone': 'WhatsApp number',
  'add.phoneHint': 'International format, including the country code.',
  'add.creating': 'Creating...',
  'add.create': 'Create and show QR',
  'add.cancel': 'Cancel',

  'common.loading': 'Loading...',
  'common.numberPending': 'Number pending',
  'common.notConnected': 'Not connected ({status})',
  'common.save': 'Save',
  'common.saved': 'Saved',
  'common.saving': 'Saving...',

  'api.openFromPortal': 'Open this page from inside your Bitrix24 portal.',
  'api.requestFailed': 'Request failed ({status})',
  'api.emptyResponse': 'Unexpected empty response',
} as const;

export type MessageKey = keyof typeof en;
