'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Import for Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace this with your actual API key
const API_KEY = "AIzaSyDRGml8dvGQXjM4q_EZL_VcY_6A3noKl2w";

interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}

const NotesCreatorApp = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleCreateNote = useCallback(async () => {
        if (!title.trim() || !content.trim()) return;

        setIsLoading(true);
        setIsError(false);

        try {
            // Initialize the Generative AI client
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Choose the model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Generate content using Gemini
            const result = await model.generateContent(content);
            const response = result.response;

            if (response) {
                const newNote: Note = {
                    id: Date.now().toString(),
                    title: title.trim(),
                    content: response.text(),
                    createdAt: new Date()
                };

                setNotes(prevNotes => [newNote, ...prevNotes]);
                setTitle('');
                setContent('');
            } else {
                throw new Error("Invalid response from Gemini.");
            }

        } catch (error: Error | unknown) {
            setIsError(true);
            console.error('Error creating note:', error instanceof Error ? error.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, [title, content]);

    const handleDeleteNote = (id: string) => {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-6 pb-12 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Создание Заметок
                </h1>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        <span>Новая Заметка</span>
                    </h2>
                    <input
                        type="text"
                        placeholder="Заголовок заметки"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 mb-4 px-4 py-2 rounded-md border"
                        disabled={isLoading}
                    />
                    <Textarea
                        placeholder="Введите содержание заметки..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 min-h-[120px] sm:min-h-[140px]"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleCreateNote}
                        disabled={isLoading || !title.trim() || !content.trim()}
                        className={cn(
                            "w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 sm:py-4 transition-all duration-300",
                            "hover:from-blue-600 hover:to-purple-600 hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 flex-shrink-0" />
                                <span>Создание...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 flex-shrink-0" />
                                <span>Создать Заметку</span>
                            </>
                        )}
                    </Button>
                </div>

                {notes.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4">Ваши Заметки</h2>
                        {notes.map((note) => (
                            <div key={note.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-200">{note.title}</h3>
                                    <Button
                                        onClick={() => handleDeleteNote(note.id)}
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                                <div className="prose prose-invert max-w-none text-gray-300 break-words overflow-x-auto">
                                    <ReactMarkdown>
                                        {note.content}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!notes.length && isError && (
                    <div className="bg-gray-800 border border-red-500 rounded-lg p-4 sm:p-6 shadow-lg">
                        <div className="text-red-400">
                            Произошла ошибка при создании заметки. Пожалуйста, попробуйте еще раз.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesCreatorApp; 