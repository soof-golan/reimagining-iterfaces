import asyncio
from random import uniform
from pydantic_ai import Agent
from src.backend.personas.definitions import get_persona, get_all_personas, PersonaTrait


class PersonaEngine:
    def __init__(self, model: str = "openai:gpt-4o-mini"):
        self.model = model
        self.agents: dict[str, Agent] = {}
        self._initialize_agents()

    def _initialize_agents(self):
        personas = get_all_personas()
        for persona_id, persona_trait in personas.items():
            agent = Agent(
                self.model,
                instructions=persona_trait.system_prompt
            )
            self.agents[persona_id] = agent

    async def generate_response(
        self,
        persona_id: str,
        user_message: str,
        conversation_history: list[dict[str, str]] = None
    ) -> str:
        if persona_id not in self.agents:
            raise ValueError(f"Unknown persona: {persona_id}")

        agent = self.agents[persona_id]
        persona_trait = get_persona(persona_id)

        delay = uniform(persona_trait.response_delay_min, persona_trait.response_delay_max)
        await asyncio.sleep(delay)

        context = ""
        if conversation_history:
            recent_messages = conversation_history[-5:]
            context = "Recent conversation:\n"
            for msg in recent_messages:
                sender = msg.get("sender_id", "Unknown")
                content = msg.get("content", "")
                context += f"{sender}: {content}\n"
            context += f"\nNow respond to: {user_message}"
            prompt = context
        else:
            prompt = user_message

        result = await agent.run(prompt)
        return result.output

    def get_persona_info(self, persona_id: str) -> PersonaTrait:
        return get_persona(persona_id)

    def get_all_persona_info(self) -> dict[str, PersonaTrait]:
        return get_all_personas()
