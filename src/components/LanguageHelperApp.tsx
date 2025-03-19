'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Languages, MessageSquare, Book, Copy, Check, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

// Import for Google Generative AI
import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace this with your actual API key
const API_KEY = "AIzaSyDRGml8dvGQXjM4q_EZL_VcY_6A3noKl2w";

interface LanguageOption {
    code: string;
    name: string;
}

interface ModeOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    prompt: string;
}

const languageOptions: LanguageOption[] = [
    { code: 'en', name: 'Английский' },
    { code: 'fr', name: 'Французский' },
    { code: 'de', name: 'Немецкий' },
    { code: 'es', name: 'Испанский' },
    { code: 'it', name: 'Итальянский' },
    { code: 'zh', name: 'Китайский' },
    { code: 'ja', name: 'Японский' },
];

const LanguageHelperApp = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
    const [selectedMode, setSelectedMode] = useState<string>('translate');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [copied, setCopied] = useState(false);

    const modes: ModeOption[] = [
        {
            id: 'translate',
            name: 'Перевод',
            icon: <Languages className="w-5 h-5" />,
            prompt: `Переведи следующий текст с русского языка на ${
                languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английский'
            } язык:

"{text}"

Пожалуйста, включи в ответ:
1. Основной перевод
2. Транскрипцию (произношение)
3. Альтернативные варианты перевода, если они есть
4. 2-3 примера использования в контексте
5. Полезные фразы или идиомы, связанные с этим выражением (если применимо)

Форматируй ответ в виде Markdown.`
        },
        {
            id: 'grammar',
            name: 'Грамматика',
            icon: <Book className="w-5 h-5" />,
            prompt: `Исправь грамматические ошибки в следующем тексте на ${
                languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английском'
            } языке:

"{text}"

Пожалуйста, включи в ответ:
1. Исправленный текст
2. Список ошибок и объяснение правил грамматики, которые были нарушены
3. Краткое описание ключевых грамматических правил, которые применяются в этом тексте
4. Примеры правильного использования проблемных конструкций

Форматируй ответ в виде Markdown, используя заголовки, списки и выделение.`
        },
        {
            id: 'vocabulary',
            name: 'Словарь',
            icon: <BookOpen className="w-5 h-5" />,
            prompt: `Создай учебную карточку для слова или фразы на ${
                languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английском'
            } языке: "{text}".

Пожалуйста, включи в ответ:
1. Слово или фразу на ${languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английском'} языке
2. Транскрипцию и произношение
3. Все возможные переводы на русский с указанием части речи
4. Этимологию слова (происхождение)
5. Синонимы и антонимы
6. Примеры использования в предложениях (минимум 5 примеров)
7. Устойчивые выражения и идиомы с этим словом
8. Грамматические особенности использования
9. Культурные примечания (если есть)

Форматируй ответ в виде хорошо структурированной учебной карточки с использованием Markdown.`
        },
        {
            id: 'conversation',
            name: 'Разговорник',
            icon: <MessageSquare className="w-5 h-5" />,
            prompt: `Создай полезный разговорник с фразами на ${
                languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английском'
            } языке по теме: "{text}".

Пожалуйста, включи в ответ:
1. Минимум 15 полезных фраз и выражений
2. Для каждой фразы укажи:
   - Оригинальную фразу на ${languageOptions.find(lang => lang.code === selectedLanguage)?.name || 'английском'} языке
   - Транскрипцию/произношение
   - Перевод на русский язык
   - Примечания по использованию (когда и как лучше использовать фразу)
3. Раздели фразы по категориям (например, приветствие, заказ, просьбы и т.д.)
4. В конце добавь список полезных слов по этой теме

Форматируй ответ в виде хорошо структурированного Markdown.`
        }
    ];

    const handleProcess = useCallback(async () => {
        if (!inputText.trim() || !selectedLanguage || !selectedMode) return;

        setIsLoading(true);
        setIsError(false);
        setOutputText(''); // Clear previous result
        setCopied(false);

        try {
            // Initialize the Generative AI client
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Choose the model
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Find the selected mode
            const mode = modes.find(m => m.id === selectedMode);
            
            if (!mode) {
                throw new Error("Режим не найден");
            }

            // Replace placeholders in the prompt
            const prompt = mode.prompt.replace('{text}', inputText);

            // Generate content using Gemini
            const result = await model.generateContent(prompt);
            const response = result.response;

            if (response) {
                setOutputText(response.text());
            } else {
                throw new Error("Invalid response from Gemini.");
            }

        } catch (error: any) {
            setIsError(true);
            setOutputText(`Ошибка при обработке текста: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, selectedLanguage, selectedMode, modes]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(outputText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-6 pb-12 px-4 sm:px-6 md:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Языковой помощник
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg">
                            <div className="mb-4">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {modes.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => setSelectedMode(mode.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-md transition-colors",
                                                selectedMode === mode.id
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                            )}
                                            disabled={isLoading}
                                        >
                                            {mode.icon}
                                            <span>{mode.name}</span>
                                        </button>
                                    ))}
                                </div>

                                <label className="block text-gray-300 text-sm font-medium mb-2">Выберите язык</label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-md text-white p-2 mb-4"
                                    disabled={isLoading}
                                >
                                    {languageOptions.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>

                                <Textarea
                                    placeholder={selectedMode === 'translate' ? 
                                        "Введите текст для перевода..." : 
                                        selectedMode === 'grammar' ? 
                                            "Введите текст для проверки грамматики..." :
                                            selectedMode === 'vocabulary' ?
                                                "Введите слово или фразу для изучения (например, 'water', 'to give', 'thank you')..." :
                                                "Введите тему для разговорника (например, 'В ресторане', 'Покупки', 'В отеле'...)"
                                    }
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    className="w-full text-white bg-gray-800 border-gray-700 placeholder:text-gray-400 min-h-[150px]"
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                onClick={handleProcess}
                                disabled={isLoading || !inputText.trim()}
                                className={cn(
                                    "w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 sm:py-4 transition-all duration-300",
                                    "hover:from-blue-600 hover:to-purple-600 hover:scale-105",
                                    "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                )}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin w-5 h-5 flex-shrink-0" />
                                        <span>Обработка...</span>
                                    </>
                                ) : (
                                    <>
                                        {modes.find(m => m.id === selectedMode)?.icon}
                                        <span>
                                            {selectedMode === 'translate' ? 'Перевести' : 
                                             selectedMode === 'grammar' ? 'Проверить' : 
                                             selectedMode === 'vocabulary' ? 'Изучить' : 'Создать'}
                                        </span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {outputText ? (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg sm:text-xl font-semibold text-gray-200 flex items-center gap-2">
                                        <Languages className="w-5 h-5 flex-shrink-0" />
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
                                <div className="prose prose-invert max-w-none text-gray-300 break-words overflow-auto max-h-[500px]">
                                    <ReactMarkdown>
                                        {outputText}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 shadow-lg flex flex-col items-center justify-center h-full">
                                <Languages className="w-16 h-16 text-gray-600 mb-4" />
                                <p className="text-gray-400 text-center">
                                    {isError ? 
                                        "Произошла ошибка при обработке. Пожалуйста, попробуйте еще раз." : 
                                        "Результат появится здесь после обработки текста."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageHelperApp; 