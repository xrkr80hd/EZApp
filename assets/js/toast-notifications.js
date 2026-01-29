/**
 * EZBaths Toast Notification System
 * Universal toast notifications with auto-dismiss and accessibility support
 */

(function () {
    'use strict';

    // Create toast container on page load
    const createToastContainer = () => {
        if (document.getElementById('toast-container')) return;

        const container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .toast {
                background: rgba(26, 26, 46, 0.95);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                pointer-events: auto;
                animation: slideIn 0.3s ease;
                border-left: 4px solid;
                transition: all 0.3s ease;
            }

            .toast:hover {
                transform: translateX(-5px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            }

            .toast.toast-success {
                border-left-color: #2ecc71;
                background: linear-gradient(135deg, rgba(46, 204, 113, 0.2), rgba(26, 26, 46, 0.95));
            }

            .toast.toast-error {
                border-left-color: #e74c3c;
                background: linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(26, 26, 46, 0.95));
            }

            .toast.toast-warning {
                border-left-color: #f39c12;
                background: linear-gradient(135deg, rgba(243, 156, 18, 0.2), rgba(26, 26, 46, 0.95));
            }

            .toast.toast-info {
                border-left-color: #3498db;
                background: linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(26, 26, 46, 0.95));
            }

            .toast-icon {
                font-size: 24px;
                flex-shrink: 0;
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                margin-bottom: 4px;
                font-size: 15px;
            }

            .toast-message {
                font-size: 14px;
                opacity: 0.9;
                line-height: 1.4;
            }

            .toast-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                opacity: 0.7;
                transition: opacity 0.2s;
                flex-shrink: 0;
            }

            .toast-close:hover {
                opacity: 1;
            }

            .toast-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 0 0 0 12px;
                animation: progress 3s linear;
            }

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
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            @keyframes progress {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }

            .toast.removing {
                animation: slideOut 0.3s ease;
            }

            @media (max-width: 480px) {
                #toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .toast {
                    min-width: auto;
                }
            }

            /* Reduce motion support */
            @media (prefers-reduced-motion: reduce) {
                .toast,
                .toast.removing {
                    animation: none;
                }

                .toast-progress {
                    animation: none;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Show toast notification
    window.showToast = function (options) {
        // Ensure container exists
        createToastContainer();

        const {
            type = 'info', // success, error, warning, info
            title = '',
            message = '',
            duration = 3000, // ms, 0 = no auto-dismiss
            icon = null
        } = options;

        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');

        // Default icons
        const defaultIcons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toastIcon = icon || defaultIcons[type] || defaultIcons.info;

        toast.innerHTML = `
            <div class="toast-icon">${toastIcon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
            ${duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));

        // Add to container
        container.appendChild(toast);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => removeToast(toast), duration);
        }

        return toast;
    };

    // Remove toast
    function removeToast(toast) {
        toast.classList.add('removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Helper methods for common toast types
    window.toast = {
        success: (message, title = 'Success') => showToast({ type: 'success', title, message }),
        error: (message, title = 'Error') => showToast({ type: 'error', title, message, duration: 5000 }),
        warning: (message, title = 'Warning') => showToast({ type: 'warning', title, message, duration: 4000 }),
        info: (message, title = '') => showToast({ type: 'info', title, message }),
        custom: (options) => showToast(options)
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToastContainer);
    } else {
        createToastContainer();
    }

    // Global error handler
    window.addEventListener('error', function (e) {
        if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
            toast.error('An unexpected error occurred. Please try again.', 'Oops!');
        }
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function (e) {
        if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
            toast.error('Something went wrong. Please refresh and try again.', 'Error');
        }
    });

})();
