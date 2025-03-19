'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calculator, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Import for Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace this with your actual API key
const API_KEY = "AIzaSyDRGml8dvGQXjM4q_EZL_VcY_6A3noKl2w";

interface MathProblem {
    id: string;
    problem: string;
    solution: string;
    timestamp: Date;
}

const MathSolverApp = () => {
    const [mathProblem, setMathProblem] = useState('');
    const [solution, setSolution] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [history, setHistory] = useState<MathProblem[]>([]);

    const handleSolve = useCallback(async () => {
        if (!mathProblem.trim()) return;

        setIsLoading(true);
        setIsError(false);
        setSolution(''); // Clear previous solution

        try {
            // Initialize the Generative AI client
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Choose the model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Craft a specific prompt for math problem solving
            const prompt = `Реши следующую математическую задачу, показывая все шаги решения подробно и понятно для школьника. Если возможно, объясни принципы и формулы, которые используются. В конце напиши ответ.

Задача: ${mathProblem}`;

            // Generate content using Gemini
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response) {
                const solutionText = response.text();
                setSolution(solutionText);
                
                // Add to history
                const newProblem: MathProblem = {
                    id: Date.now().toString(),
                    problem: mathProblem,
                    solution: solutionText,
                    timestamp: new Date()
                };
                setHistory(prev => [newProblem, ...prev]);
            } else {
                throw new Error("Invalid response from Gemini.");
            }

        } catch (error: Error | unknown) {
            setIsError(true);
            setSolution(`Ошибка при решении задачи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        } finally {
            setIsLoading(false);
        }
    }, [mathProblem]);

    const loadFromHistory = (problem: MathProblem) => {
        setMathProblem(problem.problem);
        setSolution(problem.solution);
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-6 pb-12 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Математический помощник
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                                <Calculator className="w-5 h-5 flex-shrink-0" />
                                <span>Ваша задача</span>
                            </h2>
                            <Textarea
                                placeholder="Введите математическую задачу (например, 'Решите уравнение 2x+5=15', 'Найдите производную функции y=x²+3x', 'Вычислите площадь круга с радиусом 5см')..."
                                value={mathProblem}
                                onChange={(e) => setMathProblem(e.target.value)}
                                className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 min-h-[120px] sm:min-h-[140px]"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSolve}
                                disabled={isLoading || !mathProblem.trim()}
                                className={cn(
                                    "w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 sm:py-4 transition-all duration-300",
                                    "hover:from-blue-600 hover:to-purple-600 hover:scale-105",
                                    "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5 flex-shrink-0" />
                                        <span>Решаю задачу...</span>
                                    </>
                                ) : (
                                    <>
                                        <Calculator className="w-5 h-5 flex-shrink-0" />
                                        <span>Решить задачу</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {solution && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-200 mb-4">
                                    Решение:
                                </h2>
                                <div className="prose prose-invert max-w-none text-gray-300 break-words overflow-x-auto">
                                    <ReactMarkdown>
                                        {solution}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {!solution && isError && (
                            <div className="bg-gray-800 border border-red-500 rounded-lg p-4 sm:p-6 shadow-lg">
                                <div className="text-red-400">
                                    Произошла ошибка при получении решения. Пожалуйста, попробуйте еще раз.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                                    <History className="w-5 h-5 flex-shrink-0" />
                                    <span>История</span>
                                </h2>
                                {history.length > 0 && (
                                    <Button 
                                        onClick={clearHistory}
                                        variant="ghost" 
                                        size="sm"
                                        className="text-gray-400 hover:text-gray-200"
                                    >
                                        Очистить
                                    </Button>
                                )}
                            </div>
                            
                            {history.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">
                                    История пуста
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                    {history.map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => loadFromHistory(item)}
                                            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-md cursor-pointer transition-colors"
                                        >
                                            <p className="text-gray-200 font-medium truncate">
                                                {item.problem.length > 50 
                                                    ? `${item.problem.substring(0, 50)}...` 
                                                    : item.problem
                                                }
                                            </p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {item.timestamp.toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MathSolverApp; 