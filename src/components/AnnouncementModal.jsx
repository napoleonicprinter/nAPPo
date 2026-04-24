import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Mail, Copy, Check, Megaphone } from 'lucide-react';
import './AnnouncementModal.css';

const AnnouncementModal = ({ message, onClose }) => {
    const [copied, setCopied] = useState(false);

    if (!message) return null;

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(message.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = message.email;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return createPortal(
        <div className="view-modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className="view-modal-content glass-panel announcement-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                {/* Image */}
                {message.image && (
                    <div className="announcement-image-container">
                        <img
                            src={message.image}
                            alt={message.title}
                            className="announcement-image"
                        />
                        <div className="announcement-image-overlay" />
                    </div>
                )}

                {/* Body */}
                <div className="announcement-body">
                    <h2 className="announcement-title">{message.title}</h2>
                    <p className="announcement-description">{message.description}</p>

                    <div className="announcement-actions">
                        {/* Link button */}
                        {message.link && (
                            <a
                                href={message.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="announcement-link-btn"
                            >
                                <ExternalLink size={18} />
                                Learn More
                            </a>
                        )}

                        {/* Email row */}
                        {message.email && (
                            <div className="announcement-email-row">
                                <Mail size={18} />
                                <span className="announcement-email-text">{message.email}</span>
                                <button
                                    className={`announcement-copy-btn ${copied ? 'copied' : ''}`}
                                    onClick={handleCopyEmail}
                                >
                                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AnnouncementModal;
