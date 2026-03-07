"""
Data models for document extraction and question-answering results.
This module defines dataclasses used to represent extracted text blocks from documents
and answers derived from those documents.
"""

from dataclasses import dataclass, asdict
from typing import List, Optional


@dataclass
class Block:
    """
    Represents a single block of text extracted from a document.
    Attributes:
        span_id (int): Unique identifier for this text span.
        file_id (str): Identifier of the source file.
        file_name (str): Name of the source file.
        page_or_slide (int): Page number (for documents) or slide number (for presentations).
        block_index (int): Sequential index of this block within the page/slide.
        text (str): The actual text content of the block.
        char_start (int): Starting character position of this block in the document.
        char_end (int): Ending character position of this block in the document.
        block_type (str): Type or category of the block (e.g., 'paragraph', 'heading', 'table').
    """

    span_id: int
    file_id: str
    file_name: str
    page_or_slide: int
    block_index: int
    text: str
    char_start: int
    char_end: int
    block_type: str


@dataclass
class Answer:
    """
    Represents an answer to a question with supporting evidence.
    Attributes:
        question_id (str): Unique identifier for the question
            (e.g., "AI-Q1", "W-Q3").
        answer_text (str): The generated or extracted answer text.
        span_ids (List[int]): List of span_ids referencing Block objects
            that support this answer.
        confidence (float): Confidence score for the answer, defaults to 0.0.
            Range typically 0.0 to 1.0.
        provenance (List[dict]): List of provenance metadata for each cited
            span containing file name, page/slide, block index, text excerpt,
            and character positions.
    Methods:
        to_dict(): Converts the Answer instance to a dictionary representation.
    """

    question_id: str
    answer_text: str
    span_ids: List[int]
    confidence: Optional[float] = 0.0
    provenance: Optional[List[dict]] = None

    def to_dict(self):
        """Convert dataclass instance to dictionary."""
        return asdict(self)
