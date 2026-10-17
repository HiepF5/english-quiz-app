// Helper utility for Web Speech API with gender-differentiated voices

export interface SpeechVoiceOptions {
  pitch?: number;
  rate?: number;
  gender?: 'man' | 'woman';
}

// Get voices with fallback
export function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(v => v.lang.startsWith('en'));
}

export function pickVoiceForGender(gender: 'man' | 'woman'): SpeechSynthesisVoice | null {
  const englishVoices = getEnglishVoices();
  if (englishVoices.length === 0) return null;

  const lowerGender = gender.toLowerCase();
  
  if (lowerGender === 'woman') {
    // Look for voices with female names or characteristics
    const femaleVoice = englishVoices.find(v => 
      /female|zira|samantha|victoria|karen|moira|fiona|cora|jenny/i.test(v.name)
    );
    if (femaleVoice) return femaleVoice;
  } else {
    // Look for voices with male names
    const maleVoice = englishVoices.find(v => 
      /male|david|george|daniel|oliver|guy|tom|alex|mark|fred/i.test(v.name)
    );
    if (maleVoice) return maleVoice;
  }

  // Fallback to first available english voice
  return englishVoices[0] || null;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakSingleSentence(
  text: string, 
  gender: 'man' | 'woman' = 'man', 
  rate = 1.0,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert('Trình duyệt của bạn không hỗ trợ Web Speech API.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;

  const matchedVoice = pickVoiceForGender(gender);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Differentiate pitch
  if (gender === 'man') {
    utterance.pitch = 0.85; // Lower pitch for male
  } else {
    utterance.pitch = 1.15; // Higher pitch for female
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

