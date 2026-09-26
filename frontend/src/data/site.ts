/** Site-wide contact details. The sell site is email-only today, so the WhatsApp number below is a
 *  placeholder (Ofcom drama range). Replace it with the real business number in E.164 form, no "+" or spaces. */
export const SUPPORT_EMAIL = 'support@cashmymobile.co.uk';
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? '447700900123';
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 6)} ${WHATSAPP_NUMBER.slice(6)}`;
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi CashMyMobile, I have a question about buying a phone.')}`;
export const SUPPORT_HOURS = 'Monday to Friday, 9am to 5:30pm';
