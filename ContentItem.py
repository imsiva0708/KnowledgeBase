from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ImageCreate(BaseModel):
    public_id: str
    image_name: str
    position: int = 0

class ContentCreate(BaseModel):
    name: str
    lookup_id: str
    group_name: str
    tags: List[str] = Field(default_factory=list)
    md_notes: str = ""
    article_links: List[str] = Field(default_factory=list)
    video_links: List[str] = Field(default_factory=list)

    images: List[ImageCreate] = Field(default_factory=list)
    
class ContentResponse(BaseModel):
    id: int
    name: str
    lookup_id: str
    group_name: str
    tags: List[str]
    md_notes: str
    article_links: List[str]
    video_links: List[str]
    date_created: datetime
    last_updated: datetime
    last_used: Optional[datetime]


class ImageResponse(BaseModel):
    id: int
    knowledge_base_id: int
    public_id: str
    image_name: str
    position: int
    created_at: datetime
    
'''
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,

    lookup_id VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    group_name VARCHAR(50) NOT NULL,

    tags TEXT[] DEFAULT '{}',

    md_notes TEXT NOT NULL DEFAULT '',

    article_links TEXT[] DEFAULT '{}',
    video_links TEXT[] DEFAULT '{}',

    date_created TIMESTAMP NOT NULL DEFAULT NOW(),
    last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
    last_used TIMESTAMP
);
'''