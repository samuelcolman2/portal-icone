
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppLauncher from './AppLauncher';
import Modal from './Modal';
import { SearchIcon } from './IconComponents';
import type { CustomUser } from '../types';

declare global {
    interface Window {
        google?: any;
        __gcse?: any;
    }
}

const CSE_SCRIPT_ID = 'gcse-script';
const CSE_ID = 'e04673d07373944ab';
const CSE_ELEMENT_GNAME = 'portal-search-results';
const CSE_CUSTOM_STYLE_ID = 'gcse-dark-style';
const CSE_CUSTOM_STYLES = `
.gsc-control-cse,
.gsc-control-cse .gsc-table-result,
.gsc-results .gsc-result,
.gsc-results .gsc-result .gs-bidi-start-align {
  background-color: #0F172A !important;
  color: #E2E8F0 !important;
  border: none !important;
}
.gsc-control-cse .gsc-result, .gs-result .gsc-result {
  border-bottom: 1px solid rgba(226,232,240,0.1) !important;
}
.gsc-webResult.gsc-result .gs-title,
.gs-webResult .gs-snippet b {
  color: #F97316 !important;
}
.gsc-tabsArea,
.gsc-above-wrapper-area,
.gsc-refinementsArea,
.gsc-above-wrapper-area-container {
  background-color: #0F172A !important;
  border-color: rgba(226,232,240,0.2) !important;
}
.gsc-refinementHeader, .gsc-refinementBlock {
  background-color: transparent !important;
}
.gsc-orderby-label,
.gsc-orderby-container,
.gsc-selected-option-container,
.gsc-option-selector {
  color: #E2E8F0 !important;
  background-color: #0F172A !important;
  border-color: rgba(226,232,240,0.2) !important;
}
.gs-webResult.gs-result:hover {
  background-color: rgba(15, 23, 42, 0.6) !important;
}
.gsc-result-info {
  color: #CBD5F5 !important;
}
.gsc-webResult .gsc-result .gs-snippet,
.gsc-webResult .gsc-result .gs-visibleUrl-short,
.gsc-webResult .gsc-result .gs-visibleUrl,
.gs-webResult .gs-snippet {
  color: #CBD5F5 !important;
}
.gsc-thumbnail-inside,
.gs-promotion-image-box,
.gs-promotion-text-cell {
  background-color: transparent !important;
}
.gsc-input-box,
input.gsc-input,
input.gsc-search-button-v2 {
  background-color: #1F2A40 !important;
  color: #E2E8F0 !important;
  border-color: rgba(148,163,184,0.4) !important;
}
.gsc-search-button-v2 {
  background-color: #F97316 !important;
  color: #0F172A !important;
}
.gsc-refinementHeader .gsc-refinementLabel {
  color: #F97316 !important;
}
`;

const SUGGESTIONS_ENDPOINT =
    'https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&q=';
const SUGGESTION_LIST_ID = 'portal-search-suggestions';
const MAX_SUGGESTION_CACHE_SIZE = 25;
const SUGGESTION_CALLBACK_PREFIX = '__portalSuggestCb__';
const URL_REGEX =
    /^(https?:\/\/)?(([\w-]+\.)+[a-z\u00c0-\u017f]{2,}|localhost|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/[^\s]*)?$/i;

const normalizeSuggestionKey = (value: string) => value.trim().toLowerCase();
const isLikelyUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || /\s/.test(trimmed)) return false;
    return URL_REGEX.test(trimmed);
};
const normalizeUrl = (value: string) => {
    if (/^[a-z]+:\/\//i.test(value)) return value;
    return `https://${value}`;
};

const buildFaviconUrl = (value: string) => {
    try {
        const url = new URL(value);
        return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url.origin)}`;
    } catch {
        return 'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.google.com';
    }
};

const ensureUrlProtocol = (value: string) => {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

interface Shortcut {
    id: string;
    name: string;
    url: string;
    faviconUrl: string;
}

interface HomeProps {
    currentUser: CustomUser | null;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
    const [query, setQuery] = useState('');
    const [hasResults, setHasResults] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const suggestionCacheRef = useRef<Map<string, string[]>>(new Map());
    const suggestionJsonpRef = useRef<{ script?: HTMLScriptElement; callbackName?: string } | null>(null);
    const [canShowSuggestions, setCanShowSuggestions] = useState(true);
    const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
    const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
    const [shortcutForm, setShortcutForm] = useState<{ id?: string; name: string; url: string }>({ name: '', url: '' });
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const logoUrl = 'https://iconecolegioecurso.com.br/wp-content/uploads/2022/08/xlogo_icone_site.png.pagespeed.ic_.QgXP3GszLC.webp';
    const showHero = !hasResults;

    const cacheSuggestions = useCallback((term: string, payload: string[]) => {
        const key = normalizeSuggestionKey(term);
        if (!key) return;
        const cache = suggestionCacheRef.current;
        cache.set(key, payload);
        if (cache.size > MAX_SUGGESTION_CACHE_SIZE) {
            const firstKey = cache.keys().next().value;
            if (firstKey) {
                cache.delete(firstKey);
            }
        }
    }, []);

    const readCachedSuggestions = useCallback((term: string) => {
        const key = normalizeSuggestionKey(term);
        if (!key) return undefined;
        return suggestionCacheRef.current.get(key);
    }, []);

    const storageKey = currentUser?.email ? `shortcuts:${currentUser.email}` : null;

    const highlightQueryInSuggestion = (text: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return text;
        const lowerText = text.toLowerCase();
        const lowerQuery = trimmedQuery.toLowerCase();
        const startIndex = lowerText.indexOf(lowerQuery);
        if (startIndex === -1) return text;
        const endIndex = startIndex + trimmedQuery.length;
        return (
            <>
                {text.slice(0, startIndex)}
                <span className="text-orange-400">{text.slice(startIndex, endIndex)}</span>
                {text.slice(endIndex)}
            </>
        );
    };

    const tryNavigateToUrl = useCallback(
        (term: string) => {
            if (!isLikelyUrl(term)) {
                return false;
            }
            const target = normalizeUrl(term);
            window.open(target, '_blank', 'noopener,noreferrer');
            setHasResults(false);
            return true;
        },
        [],
    );

    useEffect(() => {
        if (!storageKey) {
            setShortcuts([]);
            return;
        }
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored) as Shortcut[];
                setShortcuts(parsed);
            } else {
                setShortcuts([]);
            }
        } catch (error) {
            console.error('Failed to parse shortcuts', error);
            setShortcuts([]);
        }
    }, [storageKey]);

    useEffect(() => {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify(shortcuts));
    }, [shortcuts, storageKey]);

    useEffect(() => {
        const handleGlobalClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('[data-shortcut-menu]')) {
                setMenuOpenId(null);
            }
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    const cleanupPendingSuggestionRequest = useCallback(() => {
        const pending = suggestionJsonpRef.current;
        if (!pending) return;
        if (pending.callbackName) {
            const win = window as Record<string, any>;
            if (typeof win[pending.callbackName] === 'function') {
                delete win[pending.callbackName];
            }
        }
        if (pending.script?.parentNode) {
            pending.script.parentNode.removeChild(pending.script);
        }
        suggestionJsonpRef.current = null;
    }, []);

    const finalizeSearchInteraction = useCallback(
        (shouldClearQuery = false) => {
            cleanupPendingSuggestionRequest();
            setCanShowSuggestions(false);
            setSuggestions([]);
            setIsSuggestionOpen(false);
            setHighlightIndex(-1);
            inputRef.current?.blur();
            if (shouldClearQuery) {
                setQuery('');
            }
        },
        [cleanupPendingSuggestionRequest],
    );

    const renderSearchElement = useCallback(() => {
        try {
            const googleObj = window.google;
            const cseElement = googleObj?.search?.cse?.element;
            if (!cseElement) {
                return false;
            }
            // Use a try-catch block specifically for the render call as it might fail if called rapidly
            try {
                if (!cseElement.getElement(CSE_ELEMENT_GNAME)) {
                    cseElement.render(
                        {
                            div: 'portal-search-results',
                            tag: 'searchresults-only',
                            gname: CSE_ELEMENT_GNAME,
                        },
                        undefined,
                    );
                }
                return true;
            } catch (renderError) {
                console.warn("Google CSE render attempted but failed:", renderError);
                return false;
            }
        } catch (e) {
            console.error("Error accessing Google CSE:", e);
            return false;
        }
    }, []);

    useEffect(() => {
        const ensureCustomStyles = () => {
            if (document.getElementById(CSE_CUSTOM_STYLE_ID)) return;
            const style = document.createElement('style');
            style.id = CSE_CUSTOM_STYLE_ID;
            style.textContent = CSE_CUSTOM_STYLES;
            document.head.appendChild(style);
        };

        window.__gcse = window.__gcse || {};
        window.__gcse.parsetags = 'explicit';
        window.__gcse.callback = () => {
            ensureCustomStyles();
            renderSearchElement();
        };

        if (document.getElementById(CSE_SCRIPT_ID)) {
            ensureCustomStyles();
            // Delay render slightly to ensure DOM is ready after re-mount
            setTimeout(renderSearchElement, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = CSE_SCRIPT_ID;
        script.src = `https://cse.google.com/cse.js?cx=${CSE_ID}`;
        script.async = true;
        script.onload = () => {
            ensureCustomStyles();
            renderSearchElement();
        };
        document.body.appendChild(script);
    }, [renderSearchElement]);

    const executeSearch = useCallback(
        (term: string) => {
            const sanitizedTerm = term.trim();
            if (!sanitizedTerm) {
                return false;
            }

            const openFallbackSearch = () => {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(sanitizedTerm)}`;
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
            };

            try {
                const googleObj = window.google;
                let cseElement = googleObj?.search?.cse?.element;
                if (!cseElement) {
                    const rendered = renderSearchElement();
                    if (rendered) {
                        cseElement = window.google?.search?.cse?.element;
                    }
                }
                if (cseElement) {
                    const element = cseElement.getElement(CSE_ELEMENT_GNAME);
                    if (element) {
                        element.execute(sanitizedTerm);
                        setHasResults(true);
                        return true;
                    }
                }
            } catch (e) {
                console.warn("Google CSE execute failed, falling back", e);
            }

            openFallbackSearch();
            return false;
        },
        [renderSearchElement],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const term = query.trim();
        if (!term) return;
        const navigated = tryNavigateToUrl(term);
        if (!navigated) {
            const ran = executeSearch(term);
            if (!ran) {
                console.warn('Google CSE ainda está carregando.');
            }
        }
        finalizeSearchInteraction(navigated);
    };

    const handleGoogleButtonClick = useCallback(() => {
        window.open('https://www.google.com/', '_blank', 'noopener,noreferrer');
        finalizeSearchInteraction(false);
    }, [finalizeSearchInteraction]);

    const handleOpenShortcutModal = useCallback(
        (shortcut?: Shortcut) => {
            if (!currentUser) return;
            if (shortcut) {
                setShortcutForm({ id: shortcut.id, name: shortcut.name, url: shortcut.url });
            } else {
                setShortcutForm({ name: '', url: '' });
            }
            setIsShortcutModalOpen(true);
            setMenuOpenId(null);
        },
        [currentUser],
    );

    const handleShortcutDelete = useCallback((id: string) => {
        setShortcuts((prev) => prev.filter((shortcut) => shortcut.id !== id));
        setMenuOpenId((current) => (current === id ? null : current));
    }, []);

    const closeShortcutModal = useCallback(() => {
        setIsShortcutModalOpen(false);
        setShortcutForm({ name: '', url: '' });
    }, []);

    const handleShortcutSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const trimmedName = shortcutForm.name.trim();
            const trimmedUrl = ensureUrlProtocol(shortcutForm.url.trim());
            if (!trimmedName || !trimmedUrl) {
                return;
            }
            const faviconUrl = buildFaviconUrl(trimmedUrl);
            if (shortcutForm.id) {
                setShortcuts((prev) =>
                    prev.map((shortcut) =>
                        shortcut.id === shortcutForm.id
                            ? { ...shortcut, name: trimmedName, url: trimmedUrl, faviconUrl }
                            : shortcut,
                    ),
                );
            } else {
                const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
                setShortcuts((prev) => [...prev, { id, name: trimmedName, url: trimmedUrl, faviconUrl }]);
            }
            closeShortcutModal();
        },
        [closeShortcutModal, shortcutForm],
    );

    const fetchSuggestions = useCallback(
        (term: string) => {
            const sanitizedTerm = term.trim();
            if (!sanitizedTerm) {
                setSuggestions([]);
                setIsSuggestionOpen(false);
                setHighlightIndex(-1);
                cleanupPendingSuggestionRequest();
                return;
            }

            const cached = readCachedSuggestions(sanitizedTerm);
            if (cached) {
                setSuggestions(cached);
                setIsSuggestionOpen(canShowSuggestions && cached.length > 0);
                setHighlightIndex(cached.length ? 0 : -1);
                cleanupPendingSuggestionRequest();
                return;
            }

            cleanupPendingSuggestionRequest();
            setIsFetchingSuggestions(true);

            const callbackName = `${SUGGESTION_CALLBACK_PREFIX}${Date.now().toString(36)}${Math.random()
                .toString(36)
                .slice(2, 7)}`;
            const win = window as Record<string, any>;

            win[callbackName] = (data: any) => {
                const payload =
                    Array.isArray(data) && Array.isArray(data[1])
                        ? (data[1] as string[]).slice(0, 6).filter(Boolean)
                        : [];
                cacheSuggestions(sanitizedTerm, payload);
                setSuggestions(payload);
                setIsSuggestionOpen(canShowSuggestions && payload.length > 0);
                setHighlightIndex(payload.length ? 0 : -1);
                setIsFetchingSuggestions(false);
                cleanupPendingSuggestionRequest();
            };

            const script = document.createElement('script');
            script.src = `${SUGGESTIONS_ENDPOINT}${encodeURIComponent(sanitizedTerm)}&callback=${callbackName}`;
            script.async = true;
            script.onerror = () => {
                console.error('Não foi possível carregar sugestões de pesquisa.');
                setIsFetchingSuggestions(false);
                setSuggestions([]);
                setIsSuggestionOpen(false);
                setHighlightIndex(-1);
                cleanupPendingSuggestionRequest();
            };
            document.body.appendChild(script);
            suggestionJsonpRef.current = { script, callbackName };
        },
        [cacheSuggestions, canShowSuggestions, cleanupPendingSuggestionRequest, readCachedSuggestions],
    );

    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setSuggestions([]);
            setIsSuggestionOpen(false);
            setHighlightIndex(-1);
            setIsFetchingSuggestions(false);
            cleanupPendingSuggestionRequest();
            return;
        }
        const timeoutId = window.setTimeout(() => {
            fetchSuggestions(trimmed);
        }, 200);

        return () => {
            clearTimeout(timeoutId);
            cleanupPendingSuggestionRequest();
        };
    }, [cleanupPendingSuggestionRequest, fetchSuggestions, query]);

    const handleSuggestionSelect = (value: string) => {
        setQuery(value);
        const navigated = tryNavigateToUrl(value);
        if (!navigated) {
            executeSearch(value);
        }
        finalizeSearchInteraction(navigated);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isSuggestionOpen || !suggestions.length) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightIndex((prev) => (prev + 1) % suggestions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (event.key === 'Enter' && highlightIndex >= 0) {
            event.preventDefault();
            handleSuggestionSelect(suggestions[highlightIndex]);
        } else if (event.key === 'Tab' && highlightIndex >= 0) {
            event.preventDefault();
            handleSuggestionSelect(suggestions[highlightIndex]);
        } else if (event.key === 'Escape') {
            setIsSuggestionOpen(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            setIsSuggestionOpen(false);
        }, 100);
    };

    const activeDescendantId = highlightIndex >= 0 ? `suggestion-option-${highlightIndex}` : undefined;

    return (
        <div className="flex flex-col h-full flex-1 bg-gray-50 text-slate-900 dark:bg-[#0F172A] dark:text-gray-100">
            <header className="flex items-center justify-end p-4 sm:p-6">
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-gray-100">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Gmail</a>
                    <a href="https://www.google.com/imghp" target="_blank" rel="noopener noreferrer" className="hover:underline">Imagens</a>
                    <AppLauncher />
                </div>
            </header>

            <main
                className={`flex-grow flex flex-col items-center px-4 transition-all duration-300 ${showHero ? 'justify-center pb-20' : 'justify-start'
                    }`}
                style={{
                    // Use min-height to ensure it pushes footer down if needed, or use flex-grow properly
                    marginTop: showHero ? 0 : '0', // Reset margin top manipulation to avoid layout breaking
                    paddingTop: showHero ? '0' : '2rem', // Add top padding when results shown instead of negative margin
                }}
            >
                {showHero && (
                    <img
                        className="h-24 w-auto mb-8"
                        src={logoUrl}
                        alt="Ícone Logo"
                    />
                )}

                <form
                    onSubmit={handleSearch}
                    className={`w-full ${showHero ? 'sm:max-w-xl md:max-w-2xl' : 'sm:max-w-2xl md:max-w-3xl'
                        } transition-all duration-300`}
                >
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <input
                            ref={inputRef}
                            type="search"
                            name="q"
                            role="combobox"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setCanShowSuggestions(true);
                                setIsSuggestionOpen(true);
                            }}
                            onKeyDown={handleInputKeyDown}
                            onFocus={() => {
                                if (suggestions.length && canShowSuggestions) {
                                    setIsSuggestionOpen(true);
                                }
                            }}
                            onBlur={handleBlur}
                            aria-autocomplete="list"
                            aria-controls={SUGGESTION_LIST_ID}
                            aria-expanded={isSuggestionOpen}
                            aria-haspopup="listbox"
                            aria-activedescendant={activeDescendantId}
                            placeholder="Pesquisar no Google ou digitar um URL"
                            className="w-full p-4 pl-12 text-gray-100 bg-[#1F2937] border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-inner"
                            required
                        />
                        {isSuggestionOpen && (suggestions.length > 0 || isFetchingSuggestions) && (
                            <ul
                                id={SUGGESTION_LIST_ID}
                                role="listbox"
                                aria-label="Sugestões de pesquisa"
                                className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-slate-700 bg-[#11182b] text-sm shadow-2xl custom-scrollbar"
                            >
                                {suggestions.map((item, index) => (
                                    <li
                                        key={item}
                                        id={`suggestion-option-${index}`}
                                        role="option"
                                        aria-selected={highlightIndex === index}
                                        className={`cursor-pointer px-4 py-3 text-slate-200 hover:bg-[#1c243a] ${highlightIndex === index ? 'bg-[#1c243a]' : ''
                                            }`}
                                        onMouseDown={(event) => {
                                            event.preventDefault();
                                            handleSuggestionSelect(item);
                                        }}
                                        onMouseEnter={() => setHighlightIndex(index)}
                                    >
                                        {highlightQueryInSuggestion(item)}
                                    </li>
                                ))}
                                {isFetchingSuggestions && (
                                    <li className="px-4 py-2 text-xs text-slate-400">
                                        Buscando sugestões...
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                    {showHero && (
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={handleGoogleButtonClick}
                                className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
                            >
                                Pesquisa Google
                            </button>
                        </div>
                    )}
                </form>

                {currentUser && (
                    <section
                        className={`w-full ${showHero ? 'sm:max-w-xl md:max-w-2xl' : 'sm:max-w-2xl md:max-w-3xl'
                            } mt-8`}
                    >
                        <div className={`flex flex-wrap gap-4 ${showHero ? 'justify-center' : ''}`}>
                            {shortcuts.map((shortcut) => (
                                <div
                                    key={shortcut.id}
                                    className="group relative w-36 cursor-pointer rounded-2xl border border-transparent bg-white/90 p-4 text-center text-slate-700 shadow hover:border-blue-500 dark:bg-slate-800 dark:text-slate-100"
                                    onClick={() => window.open(shortcut.url, '_blank', 'noopener,noreferrer')}
                                >
                                    <img
                                        src={shortcut.faviconUrl}
                                        alt=""
                                        className="mx-auto h-12 w-12 rounded-full border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
                                        onError={(event) => {
                                            event.currentTarget.onerror = null;
                                            event.currentTarget.src =
                                                'https://www.google.com/s2/favicons?sz=128&domain_url=https://www.google.com';
                                        }}
                                    />
                                    <p className="mt-2 text-sm font-medium truncate">{shortcut.name}</p>
                                    <button
                                        type="button"
                                        data-shortcut-menu
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setMenuOpenId((current) => (current === shortcut.id ? null : shortcut.id));
                                        }}
                                        aria-label="Mais opcoes"
                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white opacity-0 transition group-hover:opacity-100"
                                    >
                                        ...
                                    </button>
                                    {menuOpenId === shortcut.id && (
                                        <div
                                            data-shortcut-menu
                                            className="absolute right-2 top-12 z-10 w-32 rounded-lg border border-slate-200 bg-white p-1 text-left text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
                                        >
                                            <button
                                                type="button"
                                                className="flex w-full items-center rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleOpenShortcutModal(shortcut);
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="flex w-full items-center rounded-md px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleShortcutDelete(shortcut.id);
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    </section>
                )}

                <div className="w-full sm:max-w-2xl md:max-w-3xl mt-10">
                    <div
                        id="portal-search-results"
                        className={`rounded-3xl bg-[#0F172A] p-4 text-left text-gray-100 shadow-2xl ${hasResults ? 'block max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar' : 'hidden'
                            }`}
                        data-gname={CSE_ELEMENT_GNAME}
                    />
                </div>
            </main>

            {isShortcutModalOpen && (
                <Modal
                    isOpen={isShortcutModalOpen}
                    onClose={closeShortcutModal}
                    title={shortcutForm.id ? 'Editar atalho' : 'Novo atalho'}
                >
                    <form onSubmit={handleShortcutSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Nome
                            </label>
                            <input
                                type="text"
                                value={shortcutForm.name}
                                onChange={(event) => setShortcutForm((prev) => ({ ...prev, name: event.target.value }))}
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                URL
                            </label>
                            <input
                                type="url"
                                value={shortcutForm.url}
                                onChange={(event) => setShortcutForm((prev) => ({ ...prev, url: event.target.value }))}
                                placeholder="https://exemplo.com"
                                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeShortcutModal}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!shortcutForm.name.trim() || !shortcutForm.url.trim()}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Home;
