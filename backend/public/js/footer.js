// Footer injection script
document.addEventListener('DOMContentLoaded', function() {
    const styleText = `
        .vastra-footer {
            width: 100% !important;
            background: #000 !important;
            color: #fff !important;
            padding: 40px 20px !important;
            text-align: center !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            margin: 0 !important;
        }

        .vastra-footer-inner {
            width: 100% !important;
            max-width: 720px !important;
            margin: 0 auto !important;
        }

        .vastra-footer-inner h1 {
            font-size: 3rem !important;
            letter-spacing: 0.25em !important;
            margin-bottom: 0.5rem !important;
            text-transform: uppercase !important;
        }

        .vastra-footer-inner p {
            font-size: 1rem !important;
            color: #fff !important;
            margin: 0 !important;
            letter-spacing: 0.08em !important;
        }

        @media (max-width: 768px) {
            .vastra-footer-inner h1 {
                font-size: 2.5rem !important;
            }
            .vastra-footer-inner p {
                font-size: 0.95rem !important;
            }
        }

        @media (max-width: 480px) {
            .vastra-footer-inner h1 {
                font-size: 2rem !important;
            }
            .vastra-footer-inner p {
                font-size: 0.9rem !important;
            }
        }
    `;

    const styleTag = document.createElement('style');
    styleTag.textContent = styleText;
    document.head.appendChild(styleTag);

    const footerContainer = document.createElement('div');
    footerContainer.id = 'footer-container';
    document.body.appendChild(footerContainer);

    fetch('/templates/footer.html')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const footer = doc.querySelector('footer') || doc.body.firstElementChild;

            if (footer) {
                footerContainer.appendChild(footer);
            }
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});