# BRIEF — Momoz Game V1

## Contexte
Application web de créature virtuelle type Tamagotchi moderne.
Stack : React + Vite + localStorage. Zéro backend. Déploiement Vercel.
Repo : https://github.com/samso51-oss/momoz-game

## Assets visuels
Tous les assets sont dans `~/.openclaw/workspace/projects/momoz/visuals/assets/`
Les copier dans `public/assets/` du projet React.

| Fichier | Usage |
|---|---|
| momoz-oeuf.jpg | Écran création — avant éclosion |
| momoz-bebe.jpg | Stade S1 mâle |
| momoz-bebe-femelle.jpg | Stade S1 femelle |
| momoz-ado.jpg | Stade S2 mâle |
| momoz-ado-femelle.jpg | Stade S2 femelle |
| momoz-ado-femelle-v2.jpg | Stade S2 femelle variante |
| momoz-male-adulte.jpg | Stade S3 mâle |
| momoz-femelle-adulte.jpg | Stade S3 femelle |
| momoz-vieux.jpg | Stade S4 mâle |
| momoz-vieille-femelle.jpg | Stade S4 femelle |

---

## Architecture React (composants)

```
src/
├── main.jsx
├── App.jsx
├── store/
│   └── useMomoz.js        ← état global (localStorage)
├── screens/
│   ├── LoginScreen.jsx
│   ├── CreateScreen.jsx
│   ├── HomeScreen.jsx
│   ├── FoodScreen.jsx
│   ├── ActivityScreen.jsx
│   ├── ProfileScreen.jsx
│   └── DeathScreen.jsx
├── components/
│   ├── GaugeBar.jsx
│   ├── MomozSprite.jsx
│   └── ScoreDisplay.jsx
└── data/
    ├── foods.js
    └── activities.js
```

---

## Données — foods.js

```js
// Bonne bouffe : faim +15, santé +10
export const goodFood = [
  { id: 'salade', emoji: '🥗', name: 'Salade Turquoise' },
  { id: 'pomme', emoji: '🍎', name: 'Pomme Magique' },
  { id: 'banane', emoji: '🍌', name: 'Banana Booster' },
  { id: 'berries', emoji: '🫐', name: 'Berries Cosmiques' },
  { id: 'carotte', emoji: '🥕', name: 'Carotte Fusée' },
  { id: 'orange', emoji: '🍊', name: 'Orange Soleil' },
  { id: 'brocoli', emoji: '🥦', name: 'Brocoli Super-Héros' },
  { id: 'eau', emoji: '💧', name: 'Eau Pétillante Momoz' },
  { id: 'tisane', emoji: '🍵', name: 'Tisane Doudou' },
  { id: 'oeuf', emoji: '🥚', name: 'Œuf des Champions' },
]

// Malbouffe : bonheur +20, faim +10, santé -15
export const junkFood = [
  { id: 'burger', emoji: '🍔', name: 'MomosBurger Géant' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza Turbo' },
  { id: 'frites', emoji: '🍟', name: 'Frites Volantes' },
  { id: 'soda', emoji: '🧃', name: 'Jus Pétaradant' },
  { id: 'sucette', emoji: '🍭', name: 'Sucette Explosive' },
  { id: 'chocolat', emoji: '🍫', name: 'Chocolark Suprême' },
  { id: 'donut', emoji: '🍩', name: 'Donuts Interstellaire' },
  { id: 'glace', emoji: '🍦', name: 'Glace Folle' },
  { id: 'cupcake', emoji: '🧁', name: 'Cupcake du Chaos' },
  { id: 'milkshake', emoji: '🥤', name: 'Milk-Shake Atomique' },
]
```

---

## Données — activities.js

```js
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
// Dormir est la seule activité avec durée réelle (30 min → energie 0→100)
```

---

## État localStorage (useMomoz.js)

```js
// Structure du state
{
  player: {
    pseudo: string,
    avatarEmoji: string,       // choisi parmi 10 emojis
    pin: string,               // 4 chiffres
    totalScore: number,        // cumulatif tous Momoz
    history: [{ name, gender, livedDays, points, cause }]
  },
  momoz: null | {
    name: string,
    gender: 'M' | 'F',
    traits: string[],          // 2-3 traits aléatoires
    stage: 0|1|2|3,            // 0=bébé 1=ado 2=adulte 3=vieux
    bornAt: timestamp,
    gauges: { faim: 0-100, energie: 0-100, bonheur: 0-100, sante: 0-100 },
    lastUpdated: timestamp,
    junkFoodStreak: number,    // compteur malbouffe consécutive
    isSick: boolean,
    sickUntil: timestamp | null,
    isSleeping: boolean,
    sleepUntil: timestamp | null,
    sessionScore: number,      // points accumulés sur CE Momoz
  }
}
```

---

## Logique métier (useMomoz.js)

### Descente des jauges (calculée à chaque ouverture app)
```
Faim    : -12 pts/heure
Energie : -8 pts/heure (×2 si malade)
Bonheur : -6 pts/heure (×2 si malade)
Santé   : -3 pts/heure (×2 si malade, -15 par malbouffe)
```

### Modificateurs traits
```
Gourmand  → faim descend ×1.5
Energique → energie descend ×1.5
Paresseux → energie descend ×2
Calin     → bonheur descend ×1.5
Tetu      → soins restaurent ×0.7
Curieux   → pas d'effet sur descente, lire/dessiner +5 pts bonus
```

### Mort prématurée
- UNE jauge à 0 → mort prématurée
- sessionScore = 0 (perte totale)
- totalScore inchangé (les anciens Momoz conservés)

### Évolution par stade (semaines réelles)
```
S1 bébé  : 0-7j
S2 ado   : 7-14j
S3 adulte: 14-21j
S4 vieux : 21-28j
Mort nat : 28j → +200 pts bonus + sessionScore ajouté à totalScore
```

### Barème points
```
Bonne nourriture    : +5
Malbouffe           : +1
Activité            : +10 (lire/dessiner : +20)
Soigner maladie     : +15
Connexion quotidienne: +5
Bébé→Ado           : +50
Ado→Adulte         : +100
Adulte→Vieux       : +150
Mort naturelle      : +200 bonus
```

### Maladie
- 3 malbouffes consécutives → isSick=true, sickUntil = now+24h
- Pendant maladie : toutes jauges descendent ×2
- Guérison : 3 bonnes bouffes + 1 activité (câlin ou se laver)

### Sommeil
- Activité Dormir → isSleeping=true, sleepUntil = now+30min
- Pendant sommeil : jauge énergie remonte progressivement 0→100 en 30min
- Momoz indisponible (autres actions bloquées)

---

## Écrans

### LoginScreen
- Logo "Momoz" centré
- Si localStorage vide → bouton "Créer un compte"
- Si compte existant → champs Pseudo + PIN → bouton Jouer

### CreateScreen
- Choix genre : 2 boutons "Garçon 💙" / "Fille 💗"
- Choix avatar : grille 10 emojis (🐱🐶🦊🐸🦁🐯🐼🐨🦋🌟)
- Champ pseudo (texte)
- Champ PIN (4 chiffres, masqué)
- Email parent (optionnel)
- Bouton "Créer" → CreateMomozScreen

### CreateMomozScreen (dans CreateScreen)
- Animation œuf (momoz-oeuf.jpg) qui tremble
- Champ : "Donne un prénom à ton Momoz"
- Bouton "Faire éclore !" → animation + révèle bébé M ou F
- Affiche les traits tirés au sort (2-3 parmi les 6)

### HomeScreen
- Fond orange dégradé (#F5A623 → #E8850A)
- Score éleveur + pseudo en haut
- MomozSprite centré (image selon stage + gender, animée idle CSS)
  - Badge maladie si isSick
  - Zzz si isSleeping
- Nom du Momoz + stade + jours de vie
- 4 GaugeBars (Faim / Énergie / Bonheur / Santé)
  - Couleur : vert >60%, orange >30%, rouge <30%
- 3 boutons en bas : 🍖 Nourrir · 🎮 Activités · 👤 Profil
- Bouton 🛁 Soigner visible si isSick

### FoodScreen
- Grille 4×5 (20 aliments mélangés, ordre aléatoire à chaque ouverture)
- Tap → animation de mangeaille + effets jauges
- Retour auto vers HomeScreen après 1s

### ActivityScreen
- Grille 2×4 (8 activités)
- Tap → animation + effets + message fun ("Ton Momoz adore danser !")
- Dormir → modal "Ton Momoz va dormir 30 min 😴 Reviens plus tard !"

### ProfileScreen
- Pseudo + avatar emoji
- Score total
- Tableau historique Momoz (nom · stade atteint · durée · points)

### DeathScreen
- Mort naturelle : fond doux, animation confettis, "Ton Momoz a vécu une belle vie ! +200 pts ✨"
- Mort prématurée : fond gris, animation larme, "Ton Momoz s'est envolé... Points perdus 💔"
- Bouton "Adopter un nouvel œuf" → CreateMomozScreen

---

## Style global
- Fond : `linear-gradient(180deg, #F5A623 0%, #E8850A 100%)`
- Font : Nunito ou Fredoka One (Google Fonts) — round et enfantin
- Couleur principale : #3ECFCF (turquoise Momoz)
- Boutons : grands, arrondis (border-radius 20px), ombres douces
- Mobile-first (max-width 430px centré)

---

## Commandes pour démarrer

```bash
cd ~/.openclaw/workspace/projects/momoz-code
npm create vite@latest . -- --template react
npm install
# Copier les assets
cp ~/.openclaw/workspace/projects/momoz/visuals/assets/*.jpg public/assets/
npm run dev
```

## Deploy Vercel
```bash
vercel --prod
```

---

## Points d'attention
1. Tout l'état dans localStorage → recalculer les jauges à chaque mount (delta temps écoulé)
2. Tester la mort prématurée avec une jauge forcée à 0
3. Le Momoz doit changer d'image automatiquement à chaque nouveau stade
4. Animation idle CSS simple (légère oscillation up/down)
5. Responsive mobile-first — tester sur 375px de large
