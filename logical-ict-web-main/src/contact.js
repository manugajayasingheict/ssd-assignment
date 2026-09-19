import React from "react";
import { MessageCircle, Facebook, Youtube, Music } from "lucide-react";

export default function Contact() {
  const socialLinks = [
    {
      name: "WhatsApp",
      url: "https://wa.me/94769643748",
      icon: MessageCircle,
      color: "#25D366",
      hoverColor: "#128C7E",
      description: "Chat with us directly"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/manuga.official?mibextid=wwXIfr&mibextid=wwXIfr",
      icon: Facebook,
      color: "#1877F2",
      hoverColor: "#0C63D4",
      description: "Follow our Facebook page"
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@manugajayasinghe_logicalict?si=JB4QlBeJdZaZDxkh",
      icon: Youtube,
      color: "#FF0000",
      hoverColor: "#CC0000",
      description: "Subscribe to our channel"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@ict_manuga_jayasinghe?_r=1&_t=ZS-91ETiPgnydw",
      icon: Music,
      color: "#000000",
      hoverColor: "#EE1D52",
      description: "Follow us on TikTok"
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#0f172a' }}>
      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mb-6 shadow-lg shadow-orange-500/20">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with us on your favorite platform. We're here to help you with your ICT learning journey!
          </p>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <button
                key={index}
                onClick={() => handleSocialClick(social.url)}
                className="rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 text-left group"
                style={{ backgroundColor: '#1e293b' }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-lg"
                    style={{ 
                      backgroundColor: social.color,
                      boxShadow: `0 10px 25px ${social.color}40`
                    }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors">
                      {social.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {social.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg 
                      className="w-6 h-6 text-gray-500 group-hover:text-orange-500 transition-all duration-300 transform group-hover:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Additional Info Card */}
        <div className="rounded-2xl shadow-xl p-8 text-center" style={{ backgroundColor: '#1e293b' }}>
          <h2 className="text-2xl font-black mb-4 text-white">
            Need Help?
          </h2>
          <p className="text-gray-400 mb-6">
            Choose any platform above to connect with us. We typically respond within 24 hours on all channels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="rounded-xl px-6 py-3" style={{ backgroundColor: '#334155' }}>
              <p className="text-sm font-bold text-gray-300">Response Time</p>
              <p className="text-lg font-black text-orange-500">24 Hours</p>
            </div>
            <div className="rounded-xl px-6 py-3" style={{ backgroundColor: '#334155' }}>
              <p className="text-sm font-bold text-gray-300">Support Hours</p>
              <p className="text-lg font-black text-orange-500">24/7</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center mt-8 text-gray-500 text-sm">
          Click any button above to open the platform in a new window
        </p>
      </div>
    </div>
  );
}