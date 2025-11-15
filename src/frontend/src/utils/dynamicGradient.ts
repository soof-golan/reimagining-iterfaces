export const PERSONA_HUES: Record<string, number> = {
  grandmother: 280,
  devils_adv: 0,
  barkeeper: 25,
  angel: 45,
  jacquemus: 330,
  critical_voice: 210,
}

export function getPersonaHue(personaId: string): number {
  return PERSONA_HUES[personaId] || 200
}

export function generateDynamicGradient(
  activePersonas: string[],
  recentActivity: Record<string, number> = {}
): string {
  if (activePersonas.length === 0) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }

  const gradientStops = activePersonas.map((personaId, index) => {
    const hue = getPersonaHue(personaId)
    const activityLevel = recentActivity[personaId] || 0
    const saturation = 50 + Math.min(activityLevel * 10, 40)
    const lightness = 45 + Math.min(activityLevel * 5, 15)

    const position = (index / Math.max(activePersonas.length - 1, 1)) * 100

    return `hsl(${hue}, ${saturation}%, ${lightness}%) ${position}%`
  })

  return `linear-gradient(135deg, ${gradientStops.join(', ')})`
}

export function updatePersonaActivity(
  current: Record<string, number>,
  personaId: string
): Record<string, number> {
  const decayed = Object.fromEntries(
    Object.entries(current).map(([id, level]) => [id, Math.max(0, level * 0.8)])
  )

  return {
    ...decayed,
    [personaId]: Math.min((decayed[personaId] || 0) + 1, 5)
  }
}
