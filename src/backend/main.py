import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config import settings
from backend.models.database import init_db, get_session, async_session_maker
from backend.services.persona_engine import PersonaEngine
from backend.services.mystery_mode import MysteryModeEngine
from backend.services.room_manager import RoomManager
from backend.personas.definitions import get_persona_ids
import json
from typing import Set
import uuid


app = FastAPI(title="Ambient Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

persona_engine: PersonaEngine | None = None
mystery_mode_engine: MysteryModeEngine | None = None
room_manager = RoomManager()

active_connections: dict[int, Set[WebSocket]] = {}
room_persona_tasks: dict[int, dict] = {}


def get_persona_engine() -> PersonaEngine:
    global persona_engine
    if persona_engine is None:
        persona_engine = PersonaEngine()
    return persona_engine


def get_mystery_mode_engine() -> MysteryModeEngine:
    global mystery_mode_engine
    if mystery_mode_engine is None:
        mystery_mode_engine = MysteryModeEngine()
    return mystery_mode_engine


@app.on_event("startup")
async def startup():
    await init_db()
    get_persona_engine()
    get_mystery_mode_engine()


@app.get("/rooms")
async def list_rooms(session: AsyncSession = Depends(get_session)):
    rooms = await room_manager.get_all_rooms(session)
    return [
        {
            "id": room.id,
            "name": room.name,
            "mystery_mode": room.mystery_mode,
            "created_at": room.created_at.isoformat()
        }
        for room in rooms
    ]


@app.post("/rooms")
async def create_room(name: str, mystery_mode: bool = False, session: AsyncSession = Depends(get_session)):
    room = await room_manager.create_room(session, name, mystery_mode)
    return {
        "id": room.id,
        "name": room.name,
        "mystery_mode": room.mystery_mode,
        "created_at": room.created_at.isoformat()
    }


@app.get("/rooms/{room_id}/messages")
async def get_messages(room_id: int, session: AsyncSession = Depends(get_session)):
    messages = await room_manager.get_room_messages(session, room_id)
    engine = get_persona_engine()
    result = []
    for msg in messages:
        message_dict = {
            "id": msg.id,
            "type": f"{msg.sender_type}_message",
            "content": msg.content,
            "sender_type": msg.sender_type,
            "created_at": msg.created_at.isoformat()
        }

        if msg.sender_type == "user":
            message_dict["user_id"] = msg.sender_id
        elif msg.sender_type == "persona":
            message_dict["persona_id"] = msg.sender_id
            try:
                persona = engine.get_persona_info(msg.sender_id)
                message_dict["persona_name"] = persona.name
            except:
                message_dict["persona_name"] = msg.sender_id

        result.append(message_dict)

    return result


@app.get("/personas")
async def list_personas():
    engine = get_persona_engine()
    personas = engine.get_all_persona_info()
    return {
        persona_id: {
            "name": persona.name,
            "description": persona.description,
            "knowledge_areas": persona.knowledge_areas,
            "behavioral_modes": persona.behavioral_modes,
            "response_style": persona.response_style
        }
        for persona_id, persona in personas.items()
    }


@app.websocket("/ws/rooms/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    await websocket.accept()

    if room_id not in active_connections:
        active_connections[room_id] = set()
    active_connections[room_id].add(websocket)

    session = async_session_maker()
    room = await room_manager.get_room(session, room_id)

    if not room:
        await websocket.close(code=1008, reason="Room not found")
        return

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            user_id = message_data.get("user_id", str(uuid.uuid4()))
            user_message = message_data.get("message", "")

            await room_manager.save_message(
                session, room_id, "user", user_id, user_message
            )

            user_msg_payload = {
                "type": "user_message",
                "user_id": user_id,
                "content": user_message,
                "sender_type": "user"
            }

            for connection in active_connections[room_id]:
                await connection.send_text(json.dumps(user_msg_payload))

            conversation_history = await room_manager.get_conversation_history(session, room_id, limit=20)

            if room.mystery_mode:
                responding_personas = await mystery_mode_engine.select_responding_personas(
                    user_message, num_responses=3
                )
            else:
                from random import sample
                all_personas = get_persona_ids()
                responding_personas = sample(all_personas, min(4, len(all_personas)))

            async def generate_and_send_response(persona_id: str, trigger_followup: bool = True):
                try:
                    updated_history = await room_manager.get_conversation_history(session, room_id, limit=20)
                    response = await persona_engine.generate_response(
                        persona_id, user_message, updated_history
                    )

                    await room_manager.save_message(
                        session, room_id, "persona", persona_id, response
                    )

                    persona_msg_payload = {
                        "type": "persona_message",
                        "persona_id": persona_id,
                        "persona_name": persona_engine.get_persona_info(persona_id).name,
                        "content": response,
                        "sender_type": "persona",
                        "created_at": datetime.utcnow().isoformat()
                    }

                    for connection in active_connections[room_id]:
                        try:
                            await connection.send_text(json.dumps(persona_msg_payload))
                        except Exception:
                            pass

                    if trigger_followup and len(updated_history) >= 2:
                        await asyncio.sleep(2.0)

                        available_personas = [p for p in get_persona_ids() if p != persona_id]
                        if available_personas and len(available_personas) > 0:
                            from random import choice, random
                            if random() < 0.8:
                                followup_persona = choice(available_personas)
                                asyncio.create_task(generate_and_send_response(followup_persona, trigger_followup=False))

                except Exception as e:
                    error_payload = {
                        "type": "error",
                        "message": f"Error generating response from {persona_id}: {str(e)}"
                    }
                    for connection in active_connections[room_id]:
                        try:
                            await connection.send_text(json.dumps(error_payload))
                        except Exception:
                            pass

            tasks = [generate_and_send_response(persona_id) for persona_id in responding_personas]
            asyncio.create_task(asyncio.gather(*tasks))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections[room_id].discard(websocket)
        if not active_connections[room_id]:
            del active_connections[room_id]
        await session.close()
