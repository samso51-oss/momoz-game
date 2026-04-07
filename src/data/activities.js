export const activities = [
  { id: 'jouer',    emoji: '🎮', name: 'Jouer',      effects: { bonheur: +20, energie: -5 },           points: 10 },
  { id: 'dormir',   emoji: '😴', name: 'Dormir',     effects: { energie: +30, bonheur: +5, sante: +5 }, points: 10, durationMin: 30 },
  { id: 'laver',    emoji: '🛁', name: 'Se laver',   effects: { sante: +20, energie: +5, bonheur: +10 }, points: 10 },
  { id: 'lire',     emoji: '📚', name: 'Lire',       effects: { bonheur: +10, energie: -5 },            points: 20 },
  { id: 'danser',   emoji: '💃', name: 'Danser',     effects: { bonheur: +20, energie: +15 },           points: 10 },
  { id: 'courir',   emoji: '🏃', name: 'Courir',     effects: { energie: +20, bonheur: +10, faim: -5 }, points: 10 },
  { id: 'calin',    emoji: '🤗', name: 'Câlin',      effects: { bonheur: +25 },                         points: 10 },
  { id: 'dessiner', emoji: '🎨', name: 'Dessiner',   effects: { bonheur: +15, energie: -5 },            points: 20 },
]
