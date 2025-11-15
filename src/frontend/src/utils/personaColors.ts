export const PERSONA_COLORS: Record<string, string> = {
  grandmother: '#9B59B6',
  devils_adv: '#E74C3C',
  barkeeper: '#D35400',
  angel: '#F39C12',
  jacquemus: '#E91E63',
  critical_voice: '#34495E',
}

export const PERSONA_IMAGES: Record<string, string> = {
  grandmother: '/grandmother.png',
  devils_adv: '/devils_adv.png',
  barkeeper: '/barkeeper.png',
  angel: '/angel.png',
  jacquemus: '/jacquemus.png',
  critical_voice: '/critical_voice.png',
}

export function getPersonaColor(personaId: string): string {
  return PERSONA_COLORS[personaId] || '#95A5A6'
}

export function getPersonaImage(personaId: string): string | null {
  return PERSONA_IMAGES[personaId] || null
}

export function getPersonaColorWithOpacity(personaId: string, opacity: number): string {
  const hex = getPersonaColor(personaId)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
