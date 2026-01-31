// Payment message parser for M-Pesa and e-Mola transactions

export interface PaymentInfo {
  transactionCode: string;
  amount: number;
  method: 'mpesa' | 'emola';
}

// M-Pesa message patterns (Mozambique)
// Example: "Confirmado. Recebeu 500,00MT de 84XXXXXXX. Novo saldo: 1.000,00MT. Transação: MP2XXXXX. Data: 01/01/2024 12:00"
const MPESA_PATTERNS = {
  // Transaction code patterns
  transactionCode: [
    /Transac[çc][aã]o[:\s]+([A-Z0-9]+)/i,
    /Trans[:\s]+([A-Z0-9]+)/i,
    /Ref[:\s]+([A-Z0-9]+)/i,
    /MP[0-9A-Z]+/i,
    /([A-Z]{2}[0-9]{6,}[A-Z0-9]*)/i,
  ],
  // Amount patterns
  amount: [
    /Recebeu\s+([0-9.,]+)\s*MT/i,
    /([0-9.,]+)\s*MT/i,
    /Valor[:\s]+([0-9.,]+)/i,
    /MZN\s*([0-9.,]+)/i,
    /([0-9.,]+)\s*MZN/i,
  ],
};

// e-Mola message patterns (Mozambique)
// Example: "Transferência recebida de 84XXXXXXX. Valor: 500MT. Código: EM2XXXXX"
const EMOLA_PATTERNS = {
  transactionCode: [
    /C[óo]digo[:\s]+([A-Z0-9]+)/i,
    /Ref[:\s]+([A-Z0-9]+)/i,
    /EM[0-9A-Z]+/i,
    /([A-Z]{2}[0-9]{6,}[A-Z0-9]*)/i,
  ],
  amount: [
    /Valor[:\s]+([0-9.,]+)\s*MT/i,
    /([0-9.,]+)\s*MT/i,
    /MZN\s*([0-9.,]+)/i,
    /([0-9.,]+)\s*MZN/i,
  ],
};

function parseAmount(amountStr: string): number {
  // Remove spaces and handle different decimal separators
  let cleaned = amountStr.replace(/\s/g, '');
  
  // Handle Portuguese format (1.000,50) vs English format (1,000.50)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Assume Portuguese format if comma comes after dot
    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    // Only comma - could be decimal separator
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  return parseFloat(cleaned) || 0;
}

function extractMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  return null;
}

function detectPaymentMethod(message: string): 'mpesa' | 'emola' | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('m-pesa') || lowerMessage.includes('mpesa') || lowerMessage.includes('vodacom')) {
    return 'mpesa';
  }
  
  if (lowerMessage.includes('e-mola') || lowerMessage.includes('emola') || lowerMessage.includes('movitel')) {
    return 'emola';
  }
  
  // Try to detect by transaction code prefix
  if (/\bMP[0-9A-Z]+/i.test(message)) {
    return 'mpesa';
  }
  
  if (/\bEM[0-9A-Z]+/i.test(message)) {
    return 'emola';
  }
  
  return null;
}

export function parsePaymentMessage(message: string): PaymentInfo | null {
  if (!message || message.trim().length < 10) {
    return null;
  }

  const method = detectPaymentMethod(message);
  
  if (!method) {
    // If we can't detect method, try both pattern sets
    const mpesaResult = tryParseWithPatterns(message, MPESA_PATTERNS, 'mpesa');
    if (mpesaResult) return mpesaResult;
    
    const emolaResult = tryParseWithPatterns(message, EMOLA_PATTERNS, 'emola');
    if (emolaResult) return emolaResult;
    
    return null;
  }
  
  const patterns = method === 'mpesa' ? MPESA_PATTERNS : EMOLA_PATTERNS;
  return tryParseWithPatterns(message, patterns, method);
}

function tryParseWithPatterns(
  message: string, 
  patterns: typeof MPESA_PATTERNS, 
  method: 'mpesa' | 'emola'
): PaymentInfo | null {
  const transactionCode = extractMatch(message, patterns.transactionCode);
  const amountStr = extractMatch(message, patterns.amount);
  
  if (!transactionCode) {
    return null;
  }
  
  const amount = amountStr ? parseAmount(amountStr) : 0;
  
  // Clean up transaction code
  const cleanCode = transactionCode.replace(/[:\s]/g, '').toUpperCase();
  
  return {
    transactionCode: cleanCode,
    amount,
    method,
  };
}

export function validateTransactionCode(code: string): boolean {
  if (!code || code.length < 6) {
    return false;
  }
  
  // Transaction codes should be alphanumeric
  return /^[A-Z0-9]+$/i.test(code);
}

export function formatPaymentMethod(method: 'mpesa' | 'emola' | null): string {
  switch (method) {
    case 'mpesa':
      return 'M-Pesa';
    case 'emola':
      return 'e-Mola';
    default:
      return '';
  }
}
