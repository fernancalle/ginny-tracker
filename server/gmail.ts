import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Gmail authentication not available');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

export async function getGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function getUserProfile() {
  const gmail = await getGmailClient();
  const profile = await gmail.users.getProfile({ userId: 'me' });
  return {
    email: profile.data.emailAddress,
  };
}

const DOMINICAN_BANKS = [
  'banreservas',
  'popular',
  'bhd',
  'scotiabank',
  'banesco',
  'santa cruz',
  'promerica',
  'bdi',
  'ademi',
  'lafise',
  'caribe',
  'vimenca',
  'banco múltiple',
];

export async function fetchBankEmails(maxResults: number = 50) {
  const gmail = await getGmailClient();
  
  const bankQueries = DOMINICAN_BANKS.map(bank => `from:${bank}`).join(' OR ');
  const query = `(${bankQueries}) OR subject:(transaccion OR transacción OR compra OR retiro OR deposito OR depósito OR transferencia OR pago OR notificacion OR notificación)`;
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  const messages = response.data.messages || [];
  const emails = [];

  for (const message of messages) {
    try {
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'full',
      });

      const headers = msg.data.payload?.headers || [];
      const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
      const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      const date = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

      let body = '';
      if (msg.data.payload?.body?.data) {
        body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
      } else if (msg.data.payload?.parts) {
        const textPart = msg.data.payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      emails.push({
        id: message.id,
        subject,
        from,
        date,
        body,
        snippet: msg.data.snippet || '',
      });
    } catch (err) {
      console.error(`Error fetching email ${message.id}:`, err);
    }
  }

  return emails;
}

export interface ParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  bankName: string;
  emailId: string;
  transactionDate: Date;
}

export function parseEmailForTransaction(email: { id: string; subject: string; from: string; date: string; body: string; snippet: string }): ParsedTransaction | null {
  const content = `${email.subject} ${email.body} ${email.snippet}`.toLowerCase();
  
  let bankName = 'Unknown Bank';
  for (const bank of DOMINICAN_BANKS) {
    if (email.from.toLowerCase().includes(bank) || content.includes(bank)) {
      bankName = bank.charAt(0).toUpperCase() + bank.slice(1);
      if (bank === 'bhd') bankName = 'BHD León';
      if (bank === 'popular') bankName = 'Banco Popular';
      if (bank === 'banreservas') bankName = 'Banreservas';
      break;
    }
  }

  const amountPatterns = [
    /RD\$\s*([\d,]+\.?\d*)/gi,
    /DOP\s*([\d,]+\.?\d*)/gi,
    /\$\s*([\d,]+\.?\d*)/gi,
    /monto[:\s]*([\d,]+\.?\d*)/gi,
    /valor[:\s]*([\d,]+\.?\d*)/gi,
    /cantidad[:\s]*([\d,]+\.?\d*)/gi,
  ];

  let amount = 0;
  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match) {
      const numStr = match[0].replace(/[^\d.,]/g, '').replace(',', '');
      const parsed = parseFloat(numStr);
      if (parsed > 0 && parsed < 100000000) {
        amount = parsed;
        break;
      }
    }
  }

  if (amount === 0) return null;

  const isIncome = /deposito|depósito|abono|crédito|salario|nómina|ingreso|transferencia recibida/.test(content);
  const type = isIncome ? 'income' : 'expense';

  let category = 'other';
  if (/supermercado|mercado|alimento|comida|restaurante|delivery|uber eats|pedidos ya/.test(content)) {
    category = 'food';
  } else if (/gasolina|combustible|peaje|uber|taxi|indriver|transporte/.test(content)) {
    category = 'transport';
  } else if (/edenorte|edesur|edeeste|claro|altice|viva|tricom|agua|luz|electricidad/.test(content)) {
    category = 'utilities';
  } else if (/cine|netflix|spotify|entretenimiento|juego/.test(content)) {
    category = 'entertainment';
  } else if (/tienda|compra|amazon|jumbo|sirena|plaza|mall/.test(content)) {
    category = 'shopping';
  } else if (/farmacia|hospital|clínica|médico|salud|laboratorio/.test(content)) {
    category = 'health';
  } else if (/universidad|colegio|escuela|curso|educación/.test(content)) {
    category = 'education';
  } else if (/salario|nómina|pago.*empresa/.test(content)) {
    category = 'salary';
  } else if (/transferencia/.test(content)) {
    category = 'transfer';
  }

  const description = email.subject.length > 100 
    ? email.subject.substring(0, 100) + '...' 
    : email.subject || 'Bank transaction';

  return {
    amount,
    type,
    category,
    description,
    bankName,
    emailId: email.id,
    transactionDate: new Date(email.date),
  };
}
