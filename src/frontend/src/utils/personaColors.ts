export const PERSONA_COLORS: Record<string, string> = {
  wise_grandmother: '#9B59B6',
  devils_advocate: '#E74C3C',
  medieval_barkeeper: '#D35400',
  angel: '#F39C12',
  sarcastic_tech: '#3498DB',
  renaissance_artist: '#1ABC9C',
  cold_analyst: '#34495E',
  compassionate_listener: '#E91E63',
}

export function getPersonaColor(personaId: string): string {
  return PERSONA_COLORS[personaId] || '#95A5A6'
}

export function getPersonaColorWithOpacity(personaId: string, opacity: number): string {
  const hex = getPersonaColor(personaId)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
