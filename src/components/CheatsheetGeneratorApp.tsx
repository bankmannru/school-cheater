'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Import for Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace this with your actual API key
const API_KEY = "AIzaSyDRGml8dvGQXjM4q_EZL_VcY_6A3noKl2w";

const CheatsheetGeneratorApp = () => {
    const [prompt, setPrompt] = useState('');
    const [cheatsheet, setCheatsheet] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setIsError(false);
        setCheatsheet(''); // Clear previous cheatsheet

        try {
            // Initialize the Generative AI client
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Choose the model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Generate content using Gemini
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response) {
                setCheatsheet(response.text());
            } else {
                throw new Error("Invalid response from Gemini.");
            }

        } catch (error: any) {
            setIsError(true);
            setCheatsheet(`Ошибка при генерации шпаргалки: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-6 pb-12 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Генератор Шпаргалок
                </h1>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 flex-shrink-0" />
                        <span>Ваш запрос</span>
                    </h2>
                    <Textarea
                        placeholder="Введите запрос для генерации шпаргалки (например, 'React Hooks', 'JavaScript Promises', 'Python Data Structures')..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 min-h-[120px] sm:min-h-[140px]"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !prompt.trim()}
                        className={cn(
                            "w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 sm:py-4 transition-all duration-300",
                            "hover:from-blue-600 hover:to-purple-600 hover:scale-105",
                            "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 flex-shrink-0" />
                                <span>Генерация...</span>
                            </>
                        ) : (
                            "Создать Шпаргалку"
                        )}
                    </Button>
                </div>

                {cheatsheet && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 flex-shrink-0" />
                            <span>Сгенерированная Шпаргалка</span>
                        </h2>
                        <div className="prose prose-invert max-w-none text-gray-300 break-words overflow-x-auto">
                            <ReactMarkdown>
                                {cheatsheet}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {!cheatsheet && isError && (
                    <div className="bg-gray-800 border border-red-500 rounded-lg p-4 sm:p-6 shadow-lg">
                        <div className="text-red-400">
                            Произошла ошибка при генерации шпаргалки. Пожалуйста, попробуйте еще раз.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheatsheetGeneratorApp; 