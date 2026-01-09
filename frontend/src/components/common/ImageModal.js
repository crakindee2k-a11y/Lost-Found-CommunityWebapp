import React, { useEffect } from 'react';
import './ImageModal.css';

const ImageModal = ({ image, onClose, images = [], currentIndex = 0, onNavigate }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        const handleArrow = (e) => {
            if (!onNavigate) return;
            
            if (e.key === 'ArrowLeft') {
                onNavigate('prev');
            } else if (e.key === 'ArrowRight') {
                onNavigate('next');
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleArrow);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleArrow);
            document.body.style.overflow = 'unset';
        };
    }, [onClose, onNavigate]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const hasMultipleImages = images.length > 1;
    const canGoPrev = hasMultipleImages && currentIndex > 0;
    const canGoNext = hasMultipleImages && currentIndex < images.length - 1;

    return (
        <div className="image-modal-overlay" onClick={handleBackdropClick}>
            <div className="image-modal-content">
                {/* Close Button */}
                <button className="image-modal-close" onClick={onClose} aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Navigation Arrows */}
                {canGoPrev && (
                    <button 
                        className="image-modal-nav prev" 
                        onClick={() => onNavigate('prev')}
                        aria-label="Previous image"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                )}

                {canGoNext && (
                    <button 
                        className="image-modal-nav next" 
                        onClick={() => onNavigate('next')}
                        aria-label="Next image"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                )}

                {/* Image */}
                <img 
                    src={image} 
                    alt="Expanded view" 
                    className="image-modal-img"
                    onClick={(e) => e.stopPropagation()}
                />

                {/* Image Counter */}
                {hasMultipleImages && (
                    <div className="image-modal-counter">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageModal;




