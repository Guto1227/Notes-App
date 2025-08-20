"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { type Note } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyNoteProps {
  note: Note;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
  isReadOnly: boolean;
}

export function StickyNote({ note, onUpdate, onDelete, onBringToFront, isReadOnly }: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isEditingTags, setIsEditingTags] = useState(false);
  
  const noteRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (isReadOnly || (dragHandleRef.current && !dragHandleRef.current.contains(e.target as Node))) return;
    e.preventDefault();
    onBringToFront(note.id);
    setIsDragging(true);

    const startPos = { ...note.position };
    const startMousePos = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startMousePos.x;
      const dy = moveEvent.clientY - startMousePos.y;
      onUpdate({ ...note, position: { x: startPos.x + dx, y: startPos.y + dy } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isReadOnly, note, onUpdate, onBringToFront]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    e.stopPropagation();
    onBringToFront(note.id);
    setIsResizing(true);
    
    const startSize = { ...note.size };
    const startMousePos = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dw = moveEvent.clientX - startMousePos.x;
      const dh = moveEvent.clientY - startMousePos.y;
      onUpdate({ ...note, size: { width: Math.max(200, startSize.width + dw), height: Math.max(150, startSize.height + dh) } });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isReadOnly, note, onUpdate, onBringToFront]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...note, content: e.target.value });
  };
  
  const handleTagSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const newTags = [...new Set([...note.tags, ...tagInput.split(',').map(t => t.trim()).filter(Boolean)])];
      onUpdate({ ...note, tags: newTags });
      setTagInput('');
      setIsEditingTags(false);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    onUpdate({ ...note, tags: note.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div
      ref={noteRef}
      className={cn(
        "absolute transition-all duration-200 ease-in-out",
        isDragging && "shadow-2xl scale-105",
      )}
      style={{
        left: note.position.x,
        top: note.position.y,
        width: note.size.width,
        height: note.size.height,
        zIndex: note.zIndex,
      }}
      onMouseDown={() => !isReadOnly && onBringToFront(note.id)}
    >
      <Card
        className="w-full h-full flex flex-col transition-shadow duration-200"
        style={{ backgroundColor: note.color, borderColor: note.color }}
      >
        <div
          ref={dragHandleRef}
          onMouseDown={handleDragStart}
          className={cn(
            "flex items-center justify-between p-2 text-black/60",
            !isReadOnly && "cursor-grab",
            isDragging && "cursor-grabbing"
          )}
        >
          <GripVertical size={20} />
          {!isReadOnly && (
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onDelete(note.id)}>
              <Trash2 size={16} />
              <span className="sr-only">Delete note</span>
            </Button>
          )}
        </div>
        <CardContent className="flex-grow p-2 pt-0 flex flex-col gap-2">
          <Textarea
            value={note.content}
            onChange={handleContentChange}
            readOnly={isReadOnly}
            placeholder="Your note..."
            className="flex-grow w-full h-full resize-none border-0 bg-transparent focus-visible:ring-0 text-base"
          />
          <div className="flex flex-wrap items-center gap-1">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-black/10 text-black/80">
                {tag}
                {!isReadOnly && (
                  <button onClick={() => removeTag(tag)} className="ml-1 font-bold">x</button>
                )}
              </Badge>
            ))}
             {!isReadOnly && !isEditingTags && (
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsEditingTags(true)}>
                    <Tag size={14} />
                </Button>
            )}
            {isEditingTags && (
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagSubmit}
                onBlur={() => { setIsEditingTags(false); setTagInput('') }}
                placeholder="Add tags..."
                className="h-7 bg-white/50"
                autoFocus
              />
            )}
          </div>
        </CardContent>
        {!isReadOnly && (
          <div 
            onMouseDown={handleResizeStart} 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            title="Resize note"
          >
            <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0V16H0L16 0Z" fill="rgba(0,0,0,0.2)"/>
            </svg>
          </div>
        )}
      </Card>
    </div>
  );
}
