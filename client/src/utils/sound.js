// Sound effects utility for barcode & POS scanning matching CellOn XI

export const playSound = (soundType) => {
  try {
    let soundFile = '/sounds/Digits.mp3';
    if (soundType === 'duplicate') {
      soundFile = '/sounds/Duplicate.mp3';
    }
    const audio = new Audio(soundFile);
    audio.play().catch(e => console.log('Audio autoplay prevented:', e));
  } catch (err) {
    console.error('Audio playback error:', err);
  }
};
