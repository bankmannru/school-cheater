'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FileText, 
    BookOpen, 
    Menu, 
    X, 
    Calculator, 
    Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    icon: React.ReactNode;
    label: string;
}

const Navbar = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navItems: NavItem[] = [
        {
            href: '/',
            icon: <FileText className="w-5 h-5" />,
            label: 'Шпаргалки'
        },
        {
            href: '/notes',
            icon: <BookOpen className="w-5 h-5" />,
            label: 'Заметки'
        },
        {
            href: '/math',
            icon: <Calculator className="w-5 h-5" />,
            label: 'Математика'
        },
        {
            href: '/essays',
            icon: <FileText className="w-5 h-5" />,
            label: 'Сочинения'
        },
        {
            href: '/languages',
            icon: <Languages className="w-5 h-5" />,
            label: 'Языки'
        }
    ];

    return (
        <nav className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="text-white font-bold text-xl">ИИ-Помощник</span>
                        </Link>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link 
                                key={item.href}
                                href={item.href} 
                                className={cn(
                                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === item.href 
                                        ? 'bg-gray-700 text-white' 
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                )}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-2 rounded-md"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-gray-800 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.href}
                            href={item.href} 
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-md text-base font-medium transition-colors w-full",
                                pathname === item.href 
                                    ? 'bg-gray-700 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            )}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar; 