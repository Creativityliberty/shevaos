/**
 * Utility for generating standardized WhatsApp communication links
 */
export function getWhatsAppLink(phone: string, message: string) {
  // Clean phone number (remove +, spaces, etc.)
  const cleanPhone = phone.replace(/[^\d]/g, "");
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

const FOLLOW_UP_TEMPLATES = {
  CONFIRMATION: "Bonjour {name}, c'est l'équipe SHEVA. Votre commande {order_number} est confirmée et sera expédiée prochainement. Merci !",
  DELIVERY_ATTEMPT: "Bonjour {name}, notre livreur a tenté de vous joindre pour votre commande {order_number}. Pourriez-vous nous confirmer votre disponibilité ? Merci.",
  DELIVERY_FAILED: "Bonjour {name}, nous n'avons pas pu livrer votre commande {order_number}. Souhaitez-vous reprogrammer la livraison ? Merci.",
  WELCOME: "Bienvenue chez SHEVA {name} ! Votre compte est prêt."
};

export function getTemplate(type: keyof typeof FOLLOW_UP_TEMPLATES, params: Record<string, string>) {
  let template = FOLLOW_UP_TEMPLATES[type];
  Object.entries(params).forEach(([key, value]) => {
    template = template.replace(`{${key}}`, value);
  });
  return template;
}
