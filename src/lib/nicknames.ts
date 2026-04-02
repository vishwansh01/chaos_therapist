const adjectives = [
  'Confused', 'Crying', 'Anxious', 'Chaotic', 'Sleepy',
  'Dramatic', 'Suspicious', 'Haunted', 'Feral', 'Unhinged',
  'Cursed', 'Delusional', 'Exhausted', 'Overthinking', 'Spiral',
  'Giggling', 'Panicking', 'Existential', 'Frantic', 'Soggy',
]

const nouns = [
  'Potato', 'Ninja', 'Goblin', 'Raccoon', 'Gremlin',
  'Cryptid', 'Disaster', 'Hamster', 'Ghost', 'Noodle',
  'Mushroom', 'Toaster', 'Cactus', 'Walrus', 'Penguin',
  'Bagel', 'Burrito', 'Sock', 'Turnip', 'Pigeon',
]

export function generateNickname(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  return `${adj} ${noun}`
}
