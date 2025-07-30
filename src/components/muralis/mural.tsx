"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { type Note } from '@/lib/types';
import { StickyNote } from '@/components/muralis/sticky-note';
import { Toolbar } from '@/components/muralis/toolbar';
import { getRandomPastelColor } from '@/lib/colors';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'muralis-notes';

export function Mural() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    try {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const decodedState = atob(hash);
        const loadedNotes = JSON.parse(decodedState);
        if (Array.isArray(loadedNotes)) {
          setNotes(loadedNotes);
          const maxZ = loadedNotes.reduce((max, note) => Math.max(max, note.zIndex || 0), 0);
          setZIndexCounter(maxZ + 1);
        }
        setIsReadOnly(true);
      } else {
        const savedNotes = localStorage.getItem(STORAGE_KEY);
        if (savedNotes) {
          const loadedNotes = JSON.parse(savedNotes);
          setNotes(loadedNotes);
          const maxZ = loadedNotes.reduce((max, note) => Math.max(max, note.zIndex || 0), 0);
          setZIndexCounter(maxZ + 1);
        }
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isClient]);

  useEffect(() => {
    if (isClient && !isReadOnly) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isClient, isReadOnly]);

  const bringToFront = useCallback((id: string) => {
    setNotes(prevNotes => {
      const newZIndex = zIndexCounter + 1;
      setZIndexCounter(newZIndex);
      return prevNotes.map(note => (note.id === id ? { ...note, zIndex: newZIndex } : note));
    });
  }, [zIndexCounter]);

  const addNote = useCallback((content: string = '') => {
    if (isReadOnly) return;
    const newNote: Note = {
      id: nanoid(),
      content,
      tags: [],
      color: getRandomPastelColor(),
      position: { x: Math.random() * (window.innerWidth - 300), y: Math.random() * (window.innerHeight - 250) },
      size: { width: 280, height: 240 },
      zIndex: zIndexCounter + 1,
    };
    setNotes(prev => [...prev, newNote]);
    setZIndexCounter(prev => prev + 1);
  }, [isReadOnly, zIndexCounter]);

  const updateNote = useCallback((updatedNote: Note) => {
    if (isReadOnly) return;
    setNotes(prev => prev.map(note => (note.id === updatedNote.id ? updatedNote : note)));
  }, [isReadOnly]);

  const deleteNote = useCallback((id: string) => {
    if (isReadOnly) return;
    setNotes(prev => prev.filter(note => note.id !== id));
  }, [isReadOnly]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    if (!activeTag) return notes;
    return notes.filter(note => note.tags.includes(activeTag));
  }, [notes, activeTag]);

  if (!isClient) {
    return <div className="w-full h-full bg-background" aria-label="Loading Muralis..."></div>;
  }

  return (
    <div className="w-full h-full bg-background text-foreground font-body relative overflow-hidden">
      <div className="absolute inset-0" id="mural-container">
        {filteredNotes.map(note => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
            onBringToFront={bringToFront}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
      <Toolbar
        onAddNote={addNote}
        notes={notes}
        isReadOnly={isReadOnly}
        allTags={allTags}
        activeTag={activeTag}
        onTagFilterChange={setActiveTag}
      />
    </div>
  );
}
