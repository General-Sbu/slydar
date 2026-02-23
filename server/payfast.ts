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

const PARAM_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_int1',
  'custom_int2',
  'custom_int3',
  'custom_int4',
  'custom_int5',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
  'email_confirmation',
  'confirmation_address',
  'payment_method',
];

export function generatePayFastSignature(data: Record<string, string | number | undefined>, passphrase: string = ''): string {
  let pfOutput = '';
  
  for (const key of PARAM_ORDER) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '') {
      pfOutput += `${key}=${encodeURIComponent(String(value).trim()).replace(/%20/g, '+')}&`;
    }
  }
  
  pfOutput = pfOutput.slice(0, -1);
  
  if (passphrase && passphrase.trim() !== '') {
    pfOutput += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }
  
  return crypto.createHash('md5').update(pfOutput).digest('hex');
}

export function createPayFastPaymentData(data: PayFastPaymentData, passphrase: string, sandbox: boolean = false): { url: string; fields: Record<string, string> } {
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
  
  const fields: Record<string, string> = {};
  for (const key of PARAM_ORDER) {
    const value = paymentData[key];
    if (value !== undefined && value !== null && value !== '') {
      fields[key] = String(value).trim();
    }
  }
  fields['signature'] = signature;
  
  return { url: baseUrl, fields };
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
