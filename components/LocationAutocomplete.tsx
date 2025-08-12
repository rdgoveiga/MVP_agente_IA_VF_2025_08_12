
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPinIcon } from './icons';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const loadGoogleMapsScript = (apiKey: string, callback: () => void) => {
    if ((window as any).google && (window as any).google.maps) {
        callback();
        return;
    }
    
    const existingScript = document.getElementById('googleMapsScript');
    if (existingScript) {
        const originalCallback = (window as any).initAutocomplete;
        (window as any).initAutocomplete = () => {
            if (originalCallback) originalCallback();
            callback();
        };
        return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
    script.id = 'googleMapsScript';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    (window as any).initAutocomplete = () => {
        callback();
    };
};

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ value, onChange, disabled }) => {
  const GOOGLE_MAPS_API_KEY = (window as any).process?.env?.GOOGLE_MAPS_API_KEY;
  const shouldUseGooglePlaces = !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'INSIRA_SUA_GOOGLE_MAPS_API_KEY';
  
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (shouldUseGooglePlaces) {
      loadGoogleMapsScript(GOOGLE_MAPS_API_KEY, () => setIsScriptLoaded(true));
    }
  }, [shouldUseGooglePlaces, GOOGLE_MAPS_API_KEY]);

  useEffect(() => {
    if (isScriptLoaded && autocompleteInputRef.current && (window as any).google?.maps?.places) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        { types: ['(regions)'] }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.name) {
            onChange(place.name);
        }
      });
    }
  }, [isScriptLoaded, onChange]);
  
  const handleManualChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const manualValue = e.target.value;
    onChange(manualValue);
  }, [onChange]);

  if (!shouldUseGooglePlaces) {
    return (
        <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
                id="location"
                type="text"
                value={value}
                onChange={handleManualChange}
                placeholder="Ex: Curitiba, PR ou EUA"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
                disabled={disabled}
            />
        </div>
    );
  }

  return (
    <div className="relative">
      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        ref={autocompleteInputRef}
        id="location"
        type="text"
        defaultValue={value}
        onChange={handleManualChange}
        placeholder={isScriptLoaded ? "Digite uma cidade, estado ou país..." : "Carregando busca de local..."}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
        disabled={disabled || !isScriptLoaded}
      />
    </div>
  );
};
