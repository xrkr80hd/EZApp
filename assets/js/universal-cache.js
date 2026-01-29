/**
 * Universal Auto-Cache System for EZ Bath App
 * Automatically saves and restores form data across all pages
 */

const UniversalCache = {
    // Get current customer and page-specific cache key
    getCacheKey(pageName) {
        const currentCustomer = localStorage.getItem('currentCustomer');
        return `cache_${pageName}_${currentCustomer || 'temp'}`;
    },

    // Save all form fields on a page
    savePageData(pageName, additionalData = {}) {
        const cacheKey = this.getCacheKey(pageName);
        const formData = {
            timestamp: new Date().toISOString(),
            ...additionalData
        };

        // Collect all text inputs
        document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"]').forEach(input => {
            if (input.id) {
                formData[input.id] = input.value;
            }
        });

        // Collect all textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            if (textarea.id) {
                formData[textarea.id] = textarea.value;
            }
        });

        // Collect all select dropdowns
        document.querySelectorAll('select').forEach(select => {
            if (select.id) {
                formData[select.id] = select.value;
            }
        });

        // Collect all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.id) {
                formData[checkbox.id] = checkbox.checked;
            }
        });

        // Collect all radio buttons (by name)
        const radioGroups = {};
        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            if (radio.name) {
                radioGroups[radio.name] = radio.value;
            }
        });
        formData.radioGroups = radioGroups;

        localStorage.setItem(cacheKey, JSON.stringify(formData));
        console.log(`✓ Page data cached: ${pageName}`);
        return formData;
    },

    // Load cached data for a page
    loadPageData(pageName) {
        const cacheKey = this.getCacheKey(pageName);
        const cached = localStorage.getItem(cacheKey);

        if (!cached) {
            console.log(`No cached data found for: ${pageName}`);
            return null;
        }

        try {
            const data = JSON.parse(cached);
            console.log(`✓ Loading cached data for: ${pageName}`);

            // Restore text inputs
            Object.keys(data).forEach(key => {
                if (key === 'timestamp' || key === 'radioGroups') return;

                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                }
            });

            // Restore radio buttons
            if (data.radioGroups) {
                Object.keys(data.radioGroups).forEach(name => {
                    const radio = document.querySelector(`input[name="${name}"][value="${data.radioGroups[name]}"]`);
                    if (radio) {
                        radio.checked = true;
                    }
                });
            }

            console.log(`✓ Cached data restored for: ${pageName}`);
            return data;
        } catch (error) {
            console.error(`Error loading cached data for ${pageName}:`, error);
            return null;
        }
    },

    // Clear cache for a page
    clearPageCache(pageName) {
        const cacheKey = this.getCacheKey(pageName);
        localStorage.removeItem(cacheKey);
        console.log(`✓ Cache cleared for: ${pageName}`);
    },

    // Setup auto-save for a page
    setupAutoSave(pageName, intervalSeconds = 5) {
        console.log(`Setting up auto-save for: ${pageName} (every ${intervalSeconds}s)`);

        // Save on input/change events
        document.addEventListener('input', () => {
            this.savePageData(pageName);
        });

        document.addEventListener('change', () => {
            this.savePageData(pageName);
        });

        // Save periodically
        setInterval(() => {
            this.savePageData(pageName);
        }, intervalSeconds * 1000);

        // Save before leaving page
        window.addEventListener('beforeunload', () => {
            this.savePageData(pageName);
        });

        // Load cached data on page load
        window.addEventListener('DOMContentLoaded', () => {
            this.loadPageData(pageName);
        });
    },

    // Show save confirmation
    showSaveConfirmation(message = '✓ Data saved') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

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
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    },

    // Check if there's unsaved data
    hasUnsavedData(pageName) {
        const cacheKey = this.getCacheKey(pageName);
        return localStorage.getItem(cacheKey) !== null;
    }
};

// Make it globally available
window.UniversalCache = UniversalCache;
