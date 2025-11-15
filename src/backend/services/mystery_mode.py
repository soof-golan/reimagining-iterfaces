import re
from random import choice, choices
from pydantic_ai import Agent
from src.backend.personas.definitions import get_persona_ids


class MysteryModeEngine:
    def __init__(self, model: str = "openai:gpt-4o-mini"):
        self.model = model
        self.tone_analyzer = Agent(
            self.model,
            instructions="""Analyze the tone of the user's message. Respond with ONLY ONE of these words:
- polite: respectful, kind, uses please/thank you
- rude: disrespectful, aggressive, impolite
- curious: asking questions, seeking knowledge
- emotional: expressing feelings, personal matters
- analytical: logical, data-focused, technical
- creative: artistic, imaginative, expressive
- sarcastic: ironic, snarky, humorous
- neutral: none of the above

Respond with just the single word, nothing else."""
        )

    async def analyze_tone(self, message: str) -> str:
        result = await self.tone_analyzer.run(message)
        tone = result.output.strip().lower()
        return tone

    def select_persona_by_tone(self, tone: str) -> str:
        tone_to_personas = {
            "polite": ["wise_grandmother", "angel", "compassionate_listener", "renaissance_artist"],
            "rude": ["devils_advocate", "sarcastic_tech", "cold_analyst"],
            "curious": ["wise_grandmother", "devils_advocate", "medieval_barkeeper"],
            "emotional": ["compassionate_listener", "angel", "wise_grandmother"],
            "analytical": ["cold_analyst", "devils_advocate", "sarcastic_tech"],
            "creative": ["renaissance_artist", "medieval_barkeeper", "angel"],
            "sarcastic": ["sarcastic_tech", "devils_advocate", "medieval_barkeeper"],
            "neutral": get_persona_ids()
        }

        available_personas = tone_to_personas.get(tone, get_persona_ids())
        return choice(available_personas)

    async def select_responding_personas(
        self,
        message: str,
        num_responses: int = 2
    ) -> list[str]:
        tone = await self.analyze_tone(message)

        available_personas = []
        if tone in ["polite", "rude", "curious", "emotional", "analytical", "creative", "sarcastic"]:
            tone_to_personas = {
                "polite": ["wise_grandmother", "angel", "compassionate_listener", "renaissance_artist"],
                "rude": ["devils_advocate", "sarcastic_tech", "cold_analyst"],
                "curious": ["wise_grandmother", "devils_advocate", "medieval_barkeeper"],
                "emotional": ["compassionate_listener", "angel", "wise_grandmother"],
                "analytical": ["cold_analyst", "devils_advocate", "sarcastic_tech"],
                "creative": ["renaissance_artist", "medieval_barkeeper", "angel"],
                "sarcastic": ["sarcastic_tech", "devils_advocate", "medieval_barkeeper"]
            }
            available_personas = tone_to_personas.get(tone, get_persona_ids())
        else:
            available_personas = get_persona_ids()

        selected = choices(available_personas, k=min(num_responses, len(available_personas)))
        return selected
