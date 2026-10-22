import type { MessageKey } from './en';

/**
 * Brazilian Portuguese (pt-BR).
 * Chosen over pt-PT because ACP GROUP's Portuguese-speaking market and Bitrix24 portals
 * (*.bitrix24.com.br) use Brazilian Portuguese. Open Line → Canal Aberto, matching live
 * Bitrix24 copy on those portals.
 */
export const ptBR: Record<MessageKey, string> = {
  'app.title': 'Conector do WhatsApp',
  'app.loadingPortal': 'Carregando portal',
  'app.openFromPortal': 'Abra esta página de dentro do seu portal Bitrix24.',
  'app.theme.toLight': 'Alternar para o tema claro',
  'app.theme.toDark': 'Alternar para o tema escuro',
  'app.language.label': 'Idioma',
  'app.language.en': 'EN',
  'app.language.pt': 'PT',
  'app.eventsNotReady.title': 'As respostas do Bitrix24 não estão sendo entregues.',
  'app.eventsNotReady.body':
    'Este portal está sem o token de segurança que o Bitrix24 envia na instalação do aplicativo, então as mensagens enviadas pelos operadores são descartadas. As mensagens recebidas do WhatsApp não são afetadas. Reabrir esta página tenta de novo automaticamente — se o aviso continuar, reinstale o aplicativo.',
  'app.numbers.title': 'Números do WhatsApp',
  'app.numbers.subtitle': 'Cada número alimenta um Canal Aberto do Bitrix24.',
  'app.planAllowsNumbers': 'Seu plano permite {n} número(s).',
  'app.addNumber': 'Adicionar número',

  'crm.openFromRecord': 'Abra isto a partir de um lead, negócio, contato ou empresa no Bitrix24.',
  'crm.title': 'WhatsApp',
  'crm.subtitle': 'Abra uma conversa existente ou inicie uma nova.',
  'crm.noPhone': 'Este registro não tem número de telefone cadastrado.',
  'crm.noNumbers':
    'Ainda não há números do WhatsApp. Abra o aplicativo Conector do WhatsApp e adicione um primeiro.',
  'crm.phoneLabel': 'Número de telefone',
  'crm.existingConversation': ' - conversa existente',
  'crm.notBound':
    'Este número ainda não está vinculado a um Canal Aberto — escolha-o primeiro nas configurações do conector no Contact Center.',
  'crm.starting': 'Iniciando...',
  'crm.openConversation': 'Abrir conversa',
  'crm.startConversation': 'Iniciar conversa',

  'settings.openFromContactCenter':
    'Abra isto nas configurações do conector de Canal Aberto no Contact Center.',
  'settings.title': 'Conectar um número do WhatsApp',
  'settings.subtitle': 'Escolha qual número conectado alimenta este Canal Aberto.',
  'settings.savedClose': 'Salvo. Você pode fechar esta janela.',
  'settings.noNumbers':
    'Ainda não há números. Abra o aplicativo Conector do WhatsApp e adicione um primeiro.',
  'settings.allowGroup': 'Permitir mensagens de grupo',
  'settings.allowGroupHint':
    'Os grupos do WhatsApp dos quais este número participa também alimentarão este Canal Aberto.',
  'settings.allowGroupNotInPlan': 'Não incluído no seu plano atual.',

  'license.activateTitle': 'Ativar licença',
  'license.activateHint':
    'Digite a chave de licença que você recebeu após a compra para desbloquear este portal.',
  'license.activate': 'Ativar',
  'license.activating': 'Ativando...',
  'license.status.active': 'Licenciado',
  'license.status.expired': 'Licença expirada',
  'license.status.suspended': 'Licença suspensa',
  'license.status.unlicensed': 'Sem licença',

  'portal.title': 'Portal Bitrix24',
  'portal.portal': 'Portal',
  'portal.installed': 'Instalado',
  'portal.channel': 'Canal do Contact Center',
  'portal.registered': 'Registrado',
  'portal.notRegistered': 'Não registrado',
  'portal.conversationsThisMonth': 'Conversas este mês',

  'status.connected': 'Conectado',
  'status.need_scan': 'Aguardando leitura do QR',
  'status.connecting': 'Conectando',
  'status.disconnected': 'Desconectado',
  'status.logged_out': 'Desconectado no celular',
  'status.expired': 'Sessão expirada',
  'status.unknown': 'Desconhecido',
  'status.openLine': 'Canal Aberto {id}',
  'numbers.emptyTitle': 'Nenhum número conectado ainda',
  'numbers.emptyBody':
    'Adicione um número para vinculá-lo pelo código QR. Depois de conectado, as conversas chegam no Contact Center.',
  'numbers.reconnect': 'Reconectar',

  'qr.alt': 'Código QR para vincular o WhatsApp',
  'qr.scanTitle': 'Escaneie com o celular que tem este número',
  'qr.scanHint': 'WhatsApp, Configurações, Aparelhos conectados, Conectar um aparelho.',
  'qr.status': 'Status: {status}',
  'qr.done': 'Concluído',
  'qr.connected': 'WhatsApp conectado!',

  'add.label': 'Rótulo',
  'add.labelHint': 'Usado apenas para identificar o número nesta lista.',
  'add.phone': 'Número do WhatsApp',
  'add.phoneHint': 'Formato internacional, incluindo o código do país.',
  'add.creating': 'Criando...',
  'add.create': 'Criar e mostrar QR',
  'add.cancel': 'Cancelar',

  'common.loading': 'Carregando...',
  'common.numberPending': 'Número pendente',
  'common.notConnected': 'Não conectado ({status})',
  'common.save': 'Salvar',
  'common.saved': 'Salvo',
  'common.saving': 'Salvando...',

  'api.openFromPortal': 'Abra esta página de dentro do seu portal Bitrix24.',
  'api.requestFailed': 'A solicitação falhou ({status})',
  'api.emptyResponse': 'Resposta vazia inesperada',
};
