/**
 * Custom React Hook for Speech Recognition
 * Abstracts browser speech recognition API
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Speech Recognition Hook
 * @param {object} options - Configuration options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {boolean} options.continuous - Continuous recognition (default: false)
 * @param {function} options.onResult - Callback when speech is recognized
 * @param {function} options.onError - Callback on error
 */
export function useSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  onResult,
  onError,
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onResult?.(result);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [lang, continuous, onResult, onError]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition not supported');
      return false;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.(error.message);
      return false;
    }
  }, [onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Abort listening (stops immediately without waiting for final result)
  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    abortListening,
  };
}

export default useSpeechRecognition;





