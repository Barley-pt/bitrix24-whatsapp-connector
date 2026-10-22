import { Hono } from 'hono';
import { callMethod } from '../bitrix';
import { getPortalById } from '../db';
import { deleteAudioStaging, uploadAudioStaging } from '../media';
import { sessionApiKey } from '../sessions';
import type { Env, PortalRow, SessionRow } from '../types';
import { b64urlDecode, b64urlEncode, hmacSign, hmacVerify, nowSec, uuid } from '../util';
import { wasender } from '../wasender';

/**
 * Routes for the IM_TEXTAREA audio recorder widget (task 4532).
 *
 * Two endpoints:
 *   GET /widget/audio-record   — serves the recording UI (opened by Bitrix in an iframe)
 *   POST /widget/send-audio — receives recorded audio, sends via Wasender, posts Garcia bot
 *                                 notification in the chat
 */

const widgetRoutes = new Hono<{ Bindings: Env }>();

const WIDGET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;flex-direction:row;align-items:center;justify-content:center;min-height:72px;padding:4px;-webkit-font-smoothing:antialiased}
#app{display:flex;flex-direction:row;align-items:center;justify-content:center}
button{border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .12s ease,box-shadow .15s ease,filter .15s ease,opacity .15s ease;-webkit-tap-highlight-color:transparent}
button:hover{filter:brightness(1.06)}
button:active{transform:scale(.94)}
button:focus-visible{outline:2px solid #3498db;outline-offset:2px}
button:disabled{opacity:.5;cursor:default;transform:none;filter:none}
button svg{display:block;pointer-events:none}
button.rec{width:50px;height:50px;border-radius:14px;background:#25D366;box-shadow:0 2px 6px rgba(37,211,102,.35),0 1px 2px rgba(0,0,0,.12)}
button.rec:hover{box-shadow:0 4px 12px rgba(37,211,102,.45),0 1px 3px rgba(0,0,0,.14)}
button.rec svg rect{fill:#fff}
#recordingUI{display:flex;flex-direction:row;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;padding:4px 6px;background:#fff;border:1px solid #e6e8eb;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
button.cancel,button.stop,button.send{width:36px;height:36px;border-radius:10px}
button.cancel{background:#eef0f2}
button.cancel:hover{background:#e2e5e8;filter:none}
button.stop{background:#e74c3c;box-shadow:0 1px 3px rgba(231,76,60,.35)}
button.send{background:#3498db;box-shadow:0 1px 3px rgba(52,152,219,.35)}
.timer{display:inline-flex;align-items:center;gap:6px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:16px;font-weight:700;color:#1f2328;min-width:58px;justify-content:center;font-variant-numeric:tabular-nums}
.timer.pulse::before{content:"";width:8px;height:8px;border-radius:50%;background:#c4c8cc}
#recordingUI:has(#stopBtn:not(.hidden)) .timer.pulse::before{background:#e74c3c;animation:pulse 1.2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.25;transform:scale(.8)}}
.status{flex-basis:100%;font-size:12px;color:#6a737d;text-align:center;line-height:1.3}
.status:empty{display:none}
.hidden{display:none!important}
</style>
</head>
<body>
<div id="app">
  <button class="rec" id="recBtn" onclick="startRec()" title="Tap to record" aria-label="Record voice message">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" stroke-width="2"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
  </button>
  <div id="recordingUI" class="hidden">
    <button class="cancel" id="cancelBtn" onclick="cancelRec()" title="Cancel" aria-label="Cancel recording">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#555" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <span class="timer pulse" id="timer">0:00</span>
    <button class="stop" id="stopBtn" onclick="stopRec()" title="Stop" aria-label="Stop recording">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
    </button>
    <button class="send" id="sendBtn" onclick="sendAudio()" disabled title="Send" aria-label="Send voice message">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
    <div class="status" id="status"></div>
  </div>
</div>
<script>
var dialogId = '', audioToken = '';
var recorder = null, stream = null, audioChunks = [], recMime = '', tickInterval = null;
// No recording length cap: Wasender's audio ceiling is 16 MB (docs/wasenderapi.md), hours of Opus
// away, so a client-side limit only truncated what the operator could say.
var FORMATS = ['audio/ogg;codecs=opus', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'];

function el(id){ return document.getElementById(id); }
function setStatus(msg){ el('status').textContent = msg; }

// Try each format in order of preference; the first one the browser accepts wins.
function createRecorder(s){
  for(var i = 0; i < FORMATS.length; i++){
    var fmt = FORMATS[i];
    if(typeof MediaRecorder.isTypeSupported === 'function' && !MediaRecorder.isTypeSupported(fmt)) continue;
    try { return new MediaRecorder(s, { mimeType: fmt }); } catch(e) { /* try next */ }
  }
  // Last resort: let the browser pick its default container.
  return new MediaRecorder(s);
}

function stopTracks(){
  if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); }
  stream = null;
}

function startRec(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined'){
    el('recordingUI').classList.remove('hidden');
    setStatus('Audio recording is not supported in this browser');
    return;
  }
  setStatus('');
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(s){
      stream = s;
      audioChunks = [];
      recorder = createRecorder(s);
      recMime = recorder.mimeType || 'audio/webm';

      recorder.ondataavailable = function(e){
        if(e.data && e.data.size > 0) audioChunks.push(e.data);
      };
      recorder.onstop = function(){
        stopTracks();
        if(!audioChunks.length){
          setStatus('No audio captured');
          return;
        }
        el('stopBtn').classList.add('hidden');
        el('sendBtn').classList.remove('hidden');
        el('sendBtn').disabled = false;
        setStatus(Math.round(totalSize() / 1024) + ' KB recorded');
      };

      recorder.start();

      el('recBtn').classList.add('hidden');
      el('recordingUI').classList.remove('hidden');
      el('stopBtn').classList.remove('hidden');
      el('sendBtn').classList.add('hidden');
      el('cancelBtn').classList.remove('hidden');
      startTimer();
    })
    .catch(function(err){
      stopTracks();
      el('recordingUI').classList.remove('hidden');
      setStatus('Microphone access denied: ' + (err && err.message ? err.message : err));
    });
}

function startTimer(){
  var sec = 0;
  el('timer').textContent = '0:00';
  clearInterval(tickInterval);
  tickInterval = setInterval(function(){
    sec++;
    var m = String(Math.floor(sec / 60)), s = String(sec % 60).padStart(2, '0');
    el('timer').textContent = m + ':' + s;
  }, 1000);
}

function stopRec(){
  clearInterval(tickInterval);
  if(recorder && recorder.state !== 'inactive'){
    recorder.stop(); // fires a final ondataavailable, then onstop
  }
  stopTracks();
}

function totalSize(){ return audioChunks.reduce(function(n, c){ return n + c.size; }, 0); }

function cancelRec(){
  clearInterval(tickInterval);
  if(recorder){
    recorder.ondataavailable = null;
    recorder.onstop = null;
    if(recorder.state !== 'inactive') recorder.stop();
  }
  stopTracks();
  recorder = null;
  audioChunks = [];
  recMime = '';
  el('timer').textContent = '0:00';
  el('recBtn').classList.remove('hidden');
  el('recordingUI').classList.add('hidden');
  el('stopBtn').classList.remove('hidden');
  el('sendBtn').classList.add('hidden');
  el('sendBtn').disabled = false;
  setStatus('');
}

function getExt(mime){
  if(mime.indexOf('opus') >= 0 || mime.indexOf('ogg') >= 0) return 'ogg';
  if(mime.indexOf('mp4') >= 0) return 'mp4';
  return 'webm';
}

function sendAudio(){
  if(!audioChunks.length) return;
  el('sendBtn').disabled = true;
  setStatus('Sending...');
  var mime = recMime || 'audio/webm';
  var blob = new Blob(audioChunks, { type: mime });
  var fd = new FormData();
  fd.append('audio', blob, 'voice.' + getExt(mime));
  fd.append('dialogId', dialogId);
  fetch('/widget/send-audio', {
    method: 'POST',
    body: fd,
    headers: { 'X-Audio-Token': audioToken }
  })
    .then(function(res){ return res.json(); })
    .then(function(data){
      if(data && data.success){
        setStatus('Sent!');
        setTimeout(function(){ window.location.reload(); }, 1500);
      } else {
        setStatus('Error: ' + ((data && data.error) || 'unknown'));
        el('sendBtn').disabled = false;
      }
    })
    .catch(function(){
      setStatus('Network error');
      el('sendBtn').disabled = false;
    });
}
</script>
</body>
</html>`;

/**
 * Generate a signed one-time token tied to a specific dialogId,
 * so POST /widget/send-audio can verify the request came from a widget
 * we served for that chat.
 *
 * Lifetime has to outlive an uncapped recording (recording length is no longer limited, so the
 * operator may record for many minutes after the page loaded): 2h comfortably covers a long
 * take while still keeping a leaked token useless the next day.
 */
async function makeAudioToken(env: Env, dialogId: string): Promise<string> {
  const payload = { d: dialogId, exp: nowSec() + 7200, nonce: uuid() };
  const body = b64urlEncode(JSON.stringify(payload));
  return body + '.' + await hmacSign(env.APP_SECRET, body);
}

export async function verifyAudioToken(
  env: Env,
  token: string,
  dialogId: string,
): Promise<boolean> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;
  if (!(await hmacVerify(env.APP_SECRET, body, sig))) return false;
  try {
    const payload = JSON.parse(b64urlDecode(body)) as { d: string; exp: number };
    if (payload.d !== dialogId) return false;
    if (payload.exp < nowSec()) return false;
    return true;
  } catch {
    return false;
  }
}

// ─── GET /widget/audio-record ───────────────────────────────────────────

widgetRoutes.get('/widget/audio-record', async (c) => {
  const dialogId = c.req.query('dialogId') ?? '';
  const domain = c.req.query('DOMAIN') ?? 'acp.bitrix24.com';
  // Derive frame-ancestors from the portal domain (e.g. elyzee.bitrix24.ae → *.bitrix24.ae)
  const baseDomain = domain.replace(/^[^.]*\./, '*.');
  if (!dialogId) return c.text('Missing dialogId', 400);

  const token = await makeAudioToken(c.env, dialogId);
  const page = WIDGET_HTML.replace(
    "dialogId = ''",
    `dialogId = '${dialogId.replace(/'/g, "\\'")}'`,
  ).replace(
    "audioToken = ''",
    `audioToken = '${token}'`,
  );

  return new Response(page, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        `frame-ancestors 'self' https://${domain} ${baseDomain};`,
    },
  });
});

// ─── POST /widget/audio-record (Bitrix POSTs placement pages) ────────────

widgetRoutes.post('/widget/audio-record', async (c) => {
  const form = await c.req.parseBody().catch(() => ({}));
  const raw = (form as Record<string, string>)['PLACEMENT_OPTIONS'] ?? '{}';
  let options: { dialogId?: string };
  try { options = JSON.parse(raw); } catch { options = {}; }

  const dialogId = options.dialogId ?? c.req.query('dialogId') ?? '';
  const domain = c.req.query('DOMAIN') ?? 'acp.bitrix24.com';
  const baseDomain = domain.replace(/^[^.]*\./, '*.');
  if (!dialogId) return c.text('Missing dialogId', 400);

  const token = await makeAudioToken(c.env, dialogId);
  const page = WIDGET_HTML.replace(
    "dialogId = ''",
    `dialogId = '${dialogId.replace(/'/g, "\\'")}'`,
  ).replace(
    "audioToken = ''",
    `audioToken = '${token}'`,
  );

  return new Response(page, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        `frame-ancestors 'self' https://${domain} ${baseDomain};`,
    },
  });
});

// ─── POST /widget/send-audio ────────────────────────────────────────

widgetRoutes.post('/widget/send-audio', async (c) => {
  const token = c.req.header('X-Audio-Token') ?? '';
  const fd = await c.req.formData().catch(() => null);
  if (!fd) return c.json({ success: false, error: 'invalid form' }, 400);

  const dialogId = fd.get('dialogId') as string | null;
  const audioFile = fd.get('audio') as File | null;
  if (!dialogId || !audioFile) {
    return c.json({ success: false, error: 'dialogId and audio are required' }, 400);
  }

  if (!(await verifyAudioToken(c.env, token, dialogId))) {
    return c.json({ success: false, error: 'invalid or expired token' }, 403);
  }

  // Map dialogId (chatNNN) to a session via chat_map
  const match = dialogId.match(/^chat(\d+)$/);
  if (!match) return c.json({ success: false, error: 'invalid dialogId format' }, 400);
  const bitrixChatId = match[1];

  const chat = await c.env.DB.prepare(
    'SELECT session_id, wa_jid, wa_phone FROM chat_map WHERE bitrix_chat_id = ?',
  ).bind(bitrixChatId).first<{ session_id: string; wa_jid: string; wa_phone: string }>();

  console.warn(JSON.stringify({
    msg: 'widget send-audio: chat_map lookup',
    dialogId,
    bitrixChatId,
    found: !!chat,
    sessionId: chat?.session_id ?? null,
    waJid: chat?.wa_jid ?? null,
    waPhone: chat?.wa_phone ?? null,
  }));

  if (!chat?.wa_phone) {
    return c.json({ success: false, error: 'unknown chat' }, 404);
  }

  // Upload audio to R2 and generate a Wasender-fetchable URL
  const ext = audioFile.name.split('.').pop()?.toLowerCase() ?? 'ogg';
  const blob = await audioFile.arrayBuffer();
  const { key, url } = await uploadAudioStaging(c.env, chat.session_id, blob, ext);

  console.warn(JSON.stringify({
    msg: 'widget send-audio: staged audio in R2',
    fileName: audioFile.name,
    mimeType: audioFile.type,
    ext,
    bytes: blob.byteLength,
    key,
    url,
  }));

  // Send via Wasender
  const session = await c.env.DB.prepare(
    'SELECT * FROM whatsapp_sessions WHERE id = ?',
  ).bind(chat.session_id).first<SessionRow>();

  if (!session?.wasender_api_key) {
    await deleteAudioStaging(c.env, key);
    return c.json({ success: false, error: 'session not found or missing API key' }, 404);
  }

  const portal = await getPortalById(c.env, session.portal_id);
  if (!portal) {
    await deleteAudioStaging(c.env, key);
    return c.json({ success: false, error: 'portal not found' }, 404);
  }

  // WhatsApp voice notes only accept Ogg Opus. Other browser recordings (audio/mp4 from Chrome,
  // audio/webm) are sent as a document so they still arrive as a playable file.
  const kind = ext === 'ogg' || ext === 'opus' ? 'audio' : 'document';

  let result: { msgId: number; status: string } | null = null;
  try {
    const apiKey = await sessionApiKey(c.env, session);
    result = await wasender(c.env).sendMedia(apiKey, chat.wa_phone,
      kind === 'audio' ? { kind, url } : { kind, url, fileName: audioFile.name },
    );
    console.warn(JSON.stringify({
      msg: 'widget send-audio: Wasender sendMedia result',
      sessionId: session.id,
      to: chat.wa_phone,
      kind,
      url,
      msgId: result.msgId,
      status: result.status,
    }));
  } catch (err) {
    console.warn(JSON.stringify({
      msg: 'widget send-audio: Wasender sendMedia failed',
      sessionId: session.id,
      to: chat.wa_phone,
      url,
      error: err instanceof Error ? err.message : String(err),
    }));
    // R2 cleanup best-effort: if delete fails, the TTL will expire it.
    await deleteAudioStaging(c.env, key).catch(() => {});
    return c.json({
      success: false,
      error: err instanceof Error ? err.message : 'send failed',
    }, 502);
  }

  // Only delete the R2 staging file if Wasender confirms the audio was sent.
  // Wasender returns `status: "in_progress"` when it queues the send — the file may not have
  // been fetched yet, so deleting it here would cause delivery to fail silently.
  if (result.status === 'sent') {
    await deleteAudioStaging(c.env, key).catch((err) => {
      console.warn(JSON.stringify({
        msg: 'widget send-audio: R2 staging delete failed',
        key,
        error: err instanceof Error ? err.message : String(err),
      }));
    });
  } else {
    console.warn(JSON.stringify({
      msg: 'widget send-audio: Wasender returned non-final status, R2 file kept for retry',
      sessionId: session.id,
      status: result.status,
      key,
    }));
  }

  // Log the outbound message for echo detection
  const msgId = uuid();
  await c.env.DB.prepare(
    `INSERT INTO message_log (id, session_id, direction, status, wa_message_id, echo_jid, echo_phone, created_at)
     VALUES (?, ?, 'outbound', 'sent', ?, ?, ?, ?)`,
  ).bind(msgId, chat.session_id, msgId, chat.wa_jid, chat.wa_phone, nowSec()).run();

  // Post Garcia bot notification in the chat
  const garciaBotId = portal.garcia_bot_id;
  if (garciaBotId) {
    console.warn(JSON.stringify({
      msg: 'widget send-audio: posting Garcia bot notification',
      chatId: Number(bitrixChatId),
      botId: garciaBotId,
    }));
    // Fire-and-forget: a bot notification failure is not critical.
    // Use imbot.message.add with SYSTEM=Y and SKIP_CONNECTOR=Y so the message
    // is visible only to operators and NOT forwarded to the customer on WhatsApp.
    const promise = callMethod(c.env, portal, 'imbot.message.add', {
      BOT_ID: garciaBotId,
      DIALOG_ID: 'chat' + bitrixChatId,
      MESSAGE: 'Voice message sent via WhatsApp',
      SYSTEM: 'Y',
      SKIP_CONNECTOR: 'Y',
    }).catch((err) => {
      console.warn(JSON.stringify({
        msg: 'widget send-audio: Garcia bot notification failed',
        error: err instanceof Error ? err.message : String(err),
      }));
    });
    c.executionCtx.waitUntil(promise);
  }

  return c.json({ success: true });
});

export { widgetRoutes };