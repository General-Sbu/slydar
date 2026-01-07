import crypto from "crypto";

interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_int1?: number;
  custom_int2?: number;
}

export function generatePayFastSignature(data: Record<string, string | number | undefined>, passphrase: string = ''): string {
  const filteredData: Record<string, string> = {};
  
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '' && key !== 'signature') {
      filteredData[key] = String(data[key]).trim();
    }
  }
  
  const sortedKeys = Object.keys(filteredData).sort();
  
  let paramString = '';
  for (const key of sortedKeys) {
    const encodedValue = encodeURIComponent(filteredData[key]).replace(/%20/g, '+');
    paramString += `${key}=${encodedValue}&`;
  }
  
  paramString = paramString.slice(0, -1);
  
  if (passphrase && passphrase.trim() !== '') {
    paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  return crypto.createHash('md5').update(paramString).digest('hex');
}

export function createPayFastPaymentUrl(data: PayFastPaymentData, passphrase: string, sandbox: boolean = false): string {
  const paymentData: Record<string, string | number | undefined> = {
    merchant_id: data.merchant_id,
    merchant_key: data.merchant_key,
    return_url: data.return_url,
    cancel_url: data.cancel_url,
    notify_url: data.notify_url,
    name_first: data.name_first,
    name_last: data.name_last,
    email_address: data.email_address,
    m_payment_id: data.m_payment_id,
    amount: data.amount,
    item_name: data.item_name,
    item_description: data.item_description,
    custom_str1: data.custom_str1,
    custom_str2: data.custom_str2,
    custom_str3: data.custom_str3,
    custom_int1: data.custom_int1,
    custom_int2: data.custom_int2,
  };

  const signature = generatePayFastSignature(paymentData, passphrase);
  
  const baseUrl = sandbox ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process';
  
  const params = new URLSearchParams();
  
  const orderedKeys = [
    'merchant_id', 'merchant_key', 'return_url', 'cancel_url', 'notify_url',
    'name_first', 'name_last', 'email_address', 'm_payment_id', 'amount',
    'item_name', 'item_description', 'custom_str1', 'custom_str2', 'custom_str3',
    'custom_int1', 'custom_int2'
  ];
  
  for (const key of orderedKeys) {
    const value = paymentData[key];
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value).trim());
    }
  }
  params.append('signature', signature);
  
  return `${baseUrl}?${params.toString()}`;
}

export function verifyPayFastITN(data: Record<string, string>, passphrase: string): boolean {
  const receivedSignature = data.signature;
  if (!receivedSignature) {
    return false;
  }
  
  const dataWithoutSignature: Record<string, string | number | undefined> = {};
  for (const key of Object.keys(data)) {
    if (key !== 'signature') {
      dataWithoutSignature[key] = data[key];
    }
  }
  
  const calculatedSignature = generatePayFastSignature(dataWithoutSignature, passphrase);
  
  return receivedSignature === calculatedSignature;
}

export function validatePayFastAmount(receivedAmount: string, expectedAmount: string): boolean {
  const received = parseFloat(receivedAmount);
  const expected = parseFloat(expectedAmount);
  
  return Math.abs(received - expected) < 0.01;
}
