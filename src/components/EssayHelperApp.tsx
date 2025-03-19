'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BookOpen, Clock, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Import for Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace this with your actual API key
const API_KEY = "AIzaSyDRGml8dvGQXjM4q_EZL_VcY_6A3noKl2w";

interface TemplateOption {
    id: string;
    name: string;
    prompt: string;
}

const EssayHelperApp = () => {
    const [topic, setTopic] = useState('');
    const [essayType, setEssayType] = useState('сочинение');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const templates = useMemo<TemplateOption[]>(() => [
        {
            id: 'template1',
            name: 'План сочинения',
            prompt: 'Составь подробный план сочинения на тему "{topic}". План должен включать введение, основную часть с 3-4 пунктами и заключение. Для каждого пункта предложи ключевые мысли и аргументы.'
        },
        {
            id: 'template2',
            name: 'Примеры аргументов',
            prompt: 'Предложи 5-7 сильных аргументов, которые можно использовать в {essayType} на тему "{topic}". Для каждого аргумента приведи краткое объяснение и возможный пример.'
        },
        {
            id: 'template3',
            name: 'Вступление и заключение',
            prompt: 'Напиши вступление и заключение для {essayType} на тему "{topic}". Вступление должно привлекать внимание и обозначать проблему, а заключение - подводить итоги и содержать вывод.'
        },
        {
            id: 'template4',
            name: 'Литературные цитаты',
            prompt: 'Подбери 5-7 подходящих цитат из литературных произведений, которые можно использовать в {essayType} на тему "{topic}". Для каждой цитаты укажи автора, произведение и контекст.'
        },
        {
            id: 'template5',
            name: 'Полное сочинение',
            prompt: 'Напиши полное {essayType} на тему "{topic}" для ученика старшей школы. Сочинение должно быть структурированным, содержать введение, основную часть с аргументами и заключение.'
        }
    ], []);

    const handleGenerate = useCallback(async () => {
        if (!topic.trim() || !selectedTemplate) return;

        setIsLoading(true);
        setIsError(false);
        setResult(''); // Clear previous result
        setCopied(false);

        try {
            // Initialize the Generative AI client
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Choose the model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Find the selected template
            const template = templates.find(t => t.id === selectedTemplate);
            
            if (!template) {
                throw new Error("Шаблон не найден");
            }

            // Replace placeholders in the prompt
            const prompt = template.prompt
                .replace('{topic}', topic)
                .replace('{essayType}', essayType);

            // Generate content using Gemini
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response) {
                setResult(response.text());
            } else {
                throw new Error("Invalid response from Gemini.");
            }

        } catch (error: Error | unknown) {
            setIsError(true);
            setResult(`Ошибка при создании текста: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        } finally {
            setIsLoading(false);
        }
    }, [topic, essayType, selectedTemplate, templates]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(result).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-6 pb-12 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Помощник по сочинениям
                </h1>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="block text-gray-300 text-sm font-medium mb-2">Тема сочинения</label>
                            <Textarea
                                placeholder="Введите тему сочинения или эссе (например, 'Роль семьи в жизни человека', 'Проблема выбора в современном обществе')..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 min-h-[80px]"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Тип работы</label>
                            <select
                                value={essayType}
                                onChange={(e) => setEssayType(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md text-white p-2"
                                disabled={isLoading}
                            >
                                <option value="сочинение">Сочинение</option>
                                <option value="эссе">Эссе</option>
                                <option value="изложение">Изложение</option>
                                <option value="доклад">Доклад</option>
                                <option value="рассуждение">Рассуждение</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-medium mb-2">Выберите шаблон</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    className={cn(
                                        "p-3 rounded-md text-left transition-colors",
                                        selectedTemplate === template.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                    )}
                                    disabled={isLoading}
                                >
                                    <div className="font-medium">{template.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic.trim() || !selectedTemplate}
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
                            <>
                                <BookOpen className="w-5 h-5 flex-shrink-0" />
                                <span>Создать</span>
                            </>
                        )}
                    </Button>
                </div>

                {result && (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-200 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 flex-shrink-0" />
                                <span>Результат</span>
                            </h2>
                            <Button
                                onClick={handleCopyToClipboard}
                                variant="ghost"
                                className="text-gray-300 hover:text-white"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-300 break-words overflow-x-auto">
                            <ReactMarkdown>
                                {result}
                            </ReactMarkdown>
                        </div>
                        <div className="flex items-center text-yellow-400 text-sm mt-4">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Всегда проверяйте и редактируйте сгенерированный текст под свой стиль</span>
                        </div>
                    </div>
                )}

                {!result && isError && (
                    <div className="bg-gray-800 border border-red-500 rounded-lg p-4 sm:p-6 shadow-lg">
                        <div className="text-red-400">
                            Произошла ошибка при создании текста. Пожалуйста, попробуйте еще раз.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EssayHelperApp; 