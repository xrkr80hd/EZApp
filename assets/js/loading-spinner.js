/**
 * EZBaths Loading Spinner System
 * Universal loading indicators with customizable messages
 */

(function () {
    'use strict';

    // Create loading overlay
    const createLoadingOverlay = () => {
        if (document.getElementById('loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(26, 26, 46, 0.9);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                gap: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #loading-overlay.visible {
                opacity: 1;
            }

            .spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(255, 255, 255, 0.1);
                border-top-color: #3498db;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }

            .loading-message {
                color: white;
                font-size: 16px;
                font-weight: 500;
                text-align: center;
                max-width: 300px;
                padding: 0 20px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Inline loader for buttons */
            .btn-loading {
                position: relative;
                pointer-events: none;
                opacity: 0.7;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top-color: white;
                border-radius: 50%;
                animation: spin 0.6s linear infinite;
            }

            /* Card loader */
            .card-loading {
                position: relative;
                pointer-events: none;
            }

            .card-loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(26, 26, 46, 0.8);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                border-radius: inherit;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .card-loading::after {
                content: '';
                position: absolute;
                width: 40px;
                height: 40px;
                top: 50%;
                left: 50%;
                margin-left: -20px;
                margin-top: -20px;
                border: 3px solid rgba(255, 255, 255, 0.2);
                border-top-color: #3498db;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                z-index: 11;
            }

            /* Skeleton loader */
            .skeleton {
                background: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.05) 25%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0.05) 75%
                );
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 8px;
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .skeleton-text {
                height: 16px;
                margin: 8px 0;
            }

            .skeleton-title {
                height: 24px;
                width: 60%;
                margin: 12px 0;
            }

            .skeleton-button {
                height: 44px;
                width: 120px;
                margin: 12px 0;
            }

            /* Reduce motion support */
            @media (prefers-reduced-motion: reduce) {
                .spinner,
                .btn-loading::after,
                .card-loading::after,
                .skeleton {
                    animation: none;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // Show full-page loading overlay
    window.showLoading = function (message = 'Loading...') {
        createLoadingOverlay();
        const overlay = document.getElementById('loading-overlay');
        overlay.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-message" aria-label="${message}">${message}</div>
        `;
        overlay.style.display = 'flex';
        // Trigger reflow to ensure transition works
        overlay.offsetHeight;
        overlay.classList.add('visible');
        return overlay;
    };

    // Hide loading overlay
    window.hideLoading = function () {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    };

    // Button loading state
    window.setButtonLoading = function (button, loading = true) {
        if (!button) return;

        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
            button.setAttribute('data-original-text', button.textContent);
            // Keep original text but button will show spinner via CSS
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.textContent = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    };

    // Card loading state
    window.setCardLoading = function (element, loading = true) {
        if (!element) return;

        if (loading) {
            element.classList.add('card-loading');
        } else {
            element.classList.remove('card-loading');
        }
    };

    // Loading utility object
    window.loading = {
        show: (message) => showLoading(message),
        hide: () => hideLoading(),
        button: (button, state) => setButtonLoading(button, state),
        card: (element, state) => setCardLoading(element, state)
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLoadingOverlay);
    } else {
        createLoadingOverlay();
    }

    // Auto-hide loading on page load
    window.addEventListener('load', () => {
        hideLoading();
    });

})();
