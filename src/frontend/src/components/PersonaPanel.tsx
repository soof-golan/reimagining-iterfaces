import type { PersonaInfo } from '../types'
import { getPersonaColor } from '../utils/personaColors'
import './PersonaPanel.css'

interface PersonaPanelProps {
  personas: PersonaInfo
  mysteryMode: boolean
  mutedPersonas: Set<string>
  onToggleMute: (personaId: string) => void
}

function PersonaPanel({ personas, mysteryMode, mutedPersonas, onToggleMute }: PersonaPanelProps) {
  const personaEntries = Object.entries(personas)

  return (
    <div className="persona-panel">
      <h3>
        {mysteryMode ? 'Hidden Participants' : 'Chat Personas'}
      </h3>

      <div className="personas-list">
        {personaEntries.length === 0 ? (
          <div className="no-personas">Loading personas...</div>
        ) : (
          personaEntries.map(([id, persona]) => {
            const isMuted = mutedPersonas.has(id)
            const personaColor = getPersonaColor(id)

            return (
              <div key={id} className={`persona-card ${isMuted ? 'muted' : ''}`}>
                <div className="persona-header">
                  <div className="persona-name-row">
                    <div
                      className="persona-color-indicator"
                      style={{ backgroundColor: personaColor }}
                    />
                    <h4>{persona.name}</h4>
                  </div>
                  <button
                    className="mute-toggle"
                    onClick={() => onToggleMute(id)}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                </div>

              {!mysteryMode && (
                <>
                  <p className="persona-description">
                    {persona.description}
                  </p>

                  {persona.knowledge_areas.length > 0 && (
                    <div className="persona-tags">
                      <label>Knowledge:</label>
                      <div className="tags">
                        {persona.knowledge_areas.slice(0, 3).map((area) => (
                          <span key={area} className="tag">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {persona.behavioral_modes.length > 0 && (
                    <div className="persona-tags">
                      <label>Style:</label>
                      <div className="tags">
                        {persona.behavioral_modes.slice(0, 2).map((mode) => (
                          <span key={mode} className="tag mode">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default PersonaPanel
