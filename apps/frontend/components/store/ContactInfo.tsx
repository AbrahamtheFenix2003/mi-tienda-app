'use client';

import { Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function ContactInfo() {
  const phones = [
    { number: '+51 938 256 218', label: 'Teléfono 1' },
    { number: '+51 931 257 162', label: 'Teléfono 2' },
  ];

  const location = 'URB. Huanchaco #401 - Chepen';

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://www.facebook.com/profile.php?id=100066980643442&locale=es_LA',
      color: 'text-blue-600 bg-blue-50 hover:text-blue-700',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/braholet_importaciones?igsh=MXd1OGI0NmNhdWF0ag%3D%3D&utm_source=qr',
      color: 'text-pink-600 bg-pink-50 hover:text-pink-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-rose-500 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Contacto</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Phones Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Teléfonos</h3>
          <div className="space-y-2">
            {phones.map((phone, index) => (
              <a
                key={index}
                href={`tel:${phone.number.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-gray-700 hover:text-rose-600 transition-colors group"
              >
                <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
                  <Phone className="h-4 w-4 text-rose-600" />
                </div>
                <span className="text-sm font-medium">{phone.number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Ubicación</h3>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-gray-700 hover:text-rose-600 transition-colors group"
          >
            <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors mt-1 flex-shrink-0">
              <MapPin className="h-4 w-4 text-rose-600" />
            </div>
            <span className="text-sm font-medium leading-relaxed">{location}</span>
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Social Links Section */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Síguenos</h3>
          <div className="flex gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.name}
                  className={`${social.color} p-3 rounded-lg transition-all hover:scale-110 hover:shadow-md`}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Email CTA removed — not used */}
      </div>
    </div>
  );
}
