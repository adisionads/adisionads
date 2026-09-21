'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppSupportButton() {
  const whatsappNumber = '2349123229843';
  const defaultMessage = encodeURIComponent(
    'Hello Adision Support, I am visiting adision.xyz and have an inquiry.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Adision Support"
      className="fixed bottom-5 right-5 z-40 flex items-center group"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 transition-all hover:scale-105 active:scale-95"
        title="Chat with Adision Support on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366] shrink-0" />
        <span className="hidden sm:inline-block tracking-wide">
          Chat with Support
        </span>
      </a>
    </aside>
  );
}

