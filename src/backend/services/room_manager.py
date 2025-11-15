from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.database import Room, Message
from datetime import datetime


class RoomManager:
    async def create_room(self, session: AsyncSession, name: str, mystery_mode: bool = False) -> Room:
        room = Room(name=name, mystery_mode=mystery_mode)
        session.add(room)
        await session.commit()
        await session.refresh(room)
        return room

    async def get_room(self, session: AsyncSession, room_id: int) -> Room | None:
        result = await session.execute(select(Room).where(Room.id == room_id))
        return result.scalar_one_or_none()

    async def get_all_rooms(self, session: AsyncSession) -> list[Room]:
        result = await session.execute(select(Room).order_by(Room.created_at.desc()))
        return list(result.scalars().all())

    async def delete_room(self, session: AsyncSession, room_id: int) -> bool:
        room = await self.get_room(session, room_id)
        if room:
            await session.delete(room)
            await session.commit()
            return True
        return False

    async def save_message(
        self,
        session: AsyncSession,
        room_id: int,
        sender_type: str,
        sender_id: str,
        content: str
    ) -> Message:
        message = Message(
            room_id=room_id,
            sender_type=sender_type,
            sender_id=sender_id,
            content=content,
            created_at=datetime.utcnow()
        )
        session.add(message)
        await session.commit()
        await session.refresh(message)
        return message

    async def get_room_messages(
        self,
        session: AsyncSession,
        room_id: int,
        limit: int = 100
    ) -> list[Message]:
        result = await session.execute(
            select(Message)
            .where(Message.room_id == room_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_conversation_history(
        self,
        session: AsyncSession,
        room_id: int,
        limit: int = 10
    ) -> list[dict[str, str]]:
        messages = await self.get_room_messages(session, room_id, limit)
        return [
            {
                "sender_type": msg.sender_type,
                "sender_id": msg.sender_id,
                "content": msg.content
            }
            for msg in messages
        ]
