// src/components/CustomAlert.js
import React from 'react';
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';

export const showCustomAlert = (message, type = 'error') => {
  // Remove any existing alerts
  const existingAlert = document.getElementById('custom-alert');
  if (existingAlert) existingAlert.remove();

  // Create alert container
  const alertDiv = document.createElement('div');
  alertDiv.id = 'custom-alert';
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 320px;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  const colors = {
    error: { bg: '#FEE2E2', border: '#DC2626', icon: '#DC2626' },
    success: { bg: '#D1FAE5', border: '#10B981', icon: '#10B981' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', icon: '#F59E0B' },
    info: { bg: '#DBEAFE', border: '#3B82F6', icon: '#3B82F6' }
  };

  const color = colors[type] || colors.error;

  alertDiv.innerHTML = `
    <div style="
      background: ${color.bg};
      border: 2px solid ${color.border};
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      display: flex;
      align-items: start;
      gap: 12px;
    ">
      <div style="flex-shrink: 0; margin-top: 2px;">
        ${type === 'success' ? `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color.icon}" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ` : type === 'warning' ? `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color.icon}" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ` : `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color.icon}" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        `}
      </div>
      <div style="flex: 1;">
        <p style="margin: 0; color: #1F2937; font-weight: 600; font-size: 15px; line-height: 1.5;">
          ${message}
        </p>
      </div>
      <button onclick="document.getElementById('custom-alert').remove()" style="
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        flex-shrink: 0;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(alertDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (document.getElementById('custom-alert')) {
      alertDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => alertDiv.remove(), 300);
    }
  }, 5000);
};