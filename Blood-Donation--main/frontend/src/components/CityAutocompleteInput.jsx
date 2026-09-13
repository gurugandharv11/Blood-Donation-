import React, { useState, useEffect, useRef } from 'react';
import { CITIES_AND_VILLAGES } from '../services/utils';

export const CityAutocompleteInput = ({ value, onChange, placeholder = 'Search city or village...', id, className = 'form-control-custom' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const q = value.trim().toLowerCase();
      const matches = CITIES_AND_VILLAGES.filter(c => c.toLowerCase().includes(q)).slice(0, 10);
      setSuggestions(matches);
      setIsOpen(matches.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onChange({ target: { value: city } });
    setIsOpen(false);
  };

  return (
    <div className="position-relative w-100" ref={wrapperRef}>
      <input
        type="text"
        id={id}
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <ul
          className="position-absolute w-100 list-unstyled rounded-3 shadow-lg m-0 p-1 border overflow-auto"
          style={{
            top: '100%',
            left: 0,
            zIndex: 1050,
            maxHeight: '220px',
            backgroundColor: '#0F172A',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(12px)'
          }}
        >
          {suggestions.map((city, idx) => (
            <li
              key={idx}
              className="px-3 py-2 text-white small rounded-2 cursor-pointer hover-highlight d-flex align-items-center justify-content-between"
              style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
              onClick={() => handleSelect(city)}
            >
              <span><i className="bi bi-geo-alt-fill text-danger me-2"></i>{city}</span>
              <span className="text-white-50 text-xs" style={{ fontSize: '0.7rem' }}>Select</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
