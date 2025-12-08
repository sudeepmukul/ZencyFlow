import React from 'react';
import './AnimatedLogo.css';

const AnimatedLogo = () => {
    return (
        <div className="logo-wrapper">
            <div className="bolt-container">
                <svg className="bolt" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
                </svg>
            </div>
            <div className="zen-logo">
                <div className="logo-top">
                    <span className="char-z">Z</span>
                    <span className="char-en">EN</span>
                    <span className="char-si">सी</span>
                </div>
                <div className="logo-bottom">FLOW</div>
            </div>
        </div>
    );
};

export default AnimatedLogo;
