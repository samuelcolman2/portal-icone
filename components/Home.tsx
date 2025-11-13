
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppLauncher from './AppLauncher';
import { SearchIcon } from './IconComponents';

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

const normalizeSuggestionKey = (value: string) => value.trim().toLowerCase();

const Home: React.FC = () => {
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

    const renderSearchElement = useCallback(() => {
        const googleObj = window.google;
        const cseElement = googleObj?.search?.cse?.element;
        if (!cseElement) {
            return false;
        }
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
            renderSearchElement();
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

            openFallbackSearch();
            return false;
        },
        [renderSearchElement],
    );

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const term = query.trim();
        if (!term) return;
        const ran = executeSearch(term);
        if (!ran) {
            console.warn('Google CSE ainda está carregando.');
        }
        cleanupPendingSuggestionRequest();
        setCanShowSuggestions(false);
        setSuggestions([]);
        setIsSuggestionOpen(false);
        setHighlightIndex(-1);
        inputRef.current?.blur();
    };

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
        setSuggestions([]);
        setIsSuggestionOpen(false);
        setHighlightIndex(-1);
        cleanupPendingSuggestionRequest();
        setCanShowSuggestions(false);
        inputRef.current?.blur();
        executeSearch(value);
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
        <div className="flex flex-col h-full flex-1 bg-[#0F172A] text-gray-100">
            <header className="flex items-center justify-end p-4 sm:p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-100">
                    <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Gmail</a>
                    <a href="https://www.google.com/imghp" target="_blank" rel="noopener noreferrer" className="hover:underline">Imagens</a>
                    <AppLauncher />
                </div>
            </header>

            <main
                className={`flex-grow flex flex-col items-center px-4 transition-all duration-300 ${
                    showHero ? 'justify-center pb-20' : 'justify-start'
                }`}
                style={{
                    marginTop: showHero ? 0 : '-3rem',
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
                    className={`w-full ${
                        showHero ? 'sm:max-w-xl md:max-w-2xl' : 'sm:max-w-2xl md:max-w-3xl'
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
                                        className={`cursor-pointer px-4 py-3 text-slate-200 hover:bg-[#1c243a] ${
                                            highlightIndex === index ? 'bg-[#1c243a]' : ''
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
                        <div className="flex justify-center mt-6 space-x-4">
                            <button type="submit" className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                                Pesquisa Google
                            </button>
                            <button type="submit" name="btnI" value="1" className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm">
                                Estou com sorte
                            </button>
                        </div>
                    )}
                </form>

                <div className="w-full sm:max-w-2xl md:max-w-3xl mt-10">
                    <div
                        id="portal-search-results"
                        className={`rounded-3xl bg-[#0F172A] p-4 text-left text-gray-100 shadow-2xl ${
                            hasResults ? 'block max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar' : 'hidden'
                        }`}
                        data-gname={CSE_ELEMENT_GNAME}
                    />
                </div>
            </main>
        </div>
    );
};

export default Home;
