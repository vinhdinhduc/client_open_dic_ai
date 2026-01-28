"use client"

import { useRouter } from "next/navigation"
import { SearchBarProps, SearchSuggestion } from "./types"
import { useLanguage } from "@/hooks"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { getSearchSuggestions } from "@/services/termService"
import { useTranslations } from "next-intl"
import "./SearchBar.scss"

export default function SearchBar ({
    onSearch,
    placeholder,
    autoFocus = false,
    className = ""

}: SearchBarProps){
    const router = useRouter()
    const {currentLanguage, changeLanguage} = useLanguage();
    const [keyword, setKeyword] = useState("")

    const [suggestion, setSuggestion] = useState<SearchSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const [showSuggestions, setShowSuggestions] = useState(false)

    const [selectedIndex, setSelectedIndex] = useState(-1)

    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionRef = useRef<HTMLDivElement>(null)
    const debounceTimer = useRef<NodeJS.Timeout>();
      const t = useTranslations('home');

    //Auto focus 

    useEffect(() => {
        if(autoFocus && inputRef.current){
            inputRef.current.focus()
        }
    },[autoFocus])

    //Get suggestion


    useEffect(() => {
        if(keyword.trim().length < 2) {
            setSuggestion([])
            setShowSuggestions(false)
            return;
        }

        if(debounceTimer.current){
            clearTimeout(debounceTimer.current)
        }

        debounceTimer.current = setTimeout(async() => {
            setIsLoading(true)
            try {
                const result = await getSearchSuggestions(keyword, currentLanguage)
                setSuggestion(result)
                setShowSuggestions(true)
                setSelectedIndex(-1)
            } catch (error) {
                console.error("Error fetching search suggestion:", error)
                setSuggestion([])
            }finally {
                setIsLoading(false)
            }

        }, 300)

        return () => {
            if(debounceTimer.current){
                clearTimeout(debounceTimer.current)
            }
        }
    },[keyword, currentLanguage])

    // Click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if(suggestionRef.current && 
                !suggestionRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)
            ){
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value)
    }

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if(!showSuggestions || suggestion.length === 0) {
          if(e.key === "Enter"){
            handleSearch()
        }
        return;
      }

      switch(e.key){
        case "ArrowDown": 
        e.preventDefault();
        setSelectedIndex((prev) => 
        prev < suggestion.length - 1 ? prev + 1 : 0
        )
        break;
        case "ArrowUp":
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
            break;
        case "Enter":
            e.preventDefault();
            if(selectedIndex >= 0 ){
                handleSelectSuggestion(suggestion[selectedIndex])
            }else{
                handleSearch()
            }
            break;
            case "Escape":
                e.preventDefault();
                setShowSuggestions(false)
                setSelectedIndex(-1)
                break;
        
        }
    }

    const handleSearch = () => {
        if(keyword.trim()){
            setShowSuggestions(false)
            if(onSearch){
                onSearch(keyword.trim())
            }else {
                router.push(`/terms?q=${encodeURIComponent(keyword.trim())}`)
            }
        }
    }

    const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
        setShowSuggestions(false)
        setKeyword("")
        router.push(`/terms/${suggestion._id}`)
    }

    const getTermText = (suggestion: SearchSuggestion): string => {
        return suggestion.term[currentLanguage] || suggestion.term.en || suggestion.term.vi || suggestion.term.lo || ""
    }

    return (
    <div className={`search-bar ${className}`}>
      <div className="search-bar__input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={handleInputChange}
          onKeyDown={handleOnKeyDown}
          onFocus={() => suggestion.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder || t('search.placeholder')}
          className="search-bar__input"
          aria-label={t('search.inputLabel')}
          aria-autocomplete="list"
          aria-controls="search-suggestion"
          aria-expanded={showSuggestions}
        />

        {/* Search Icon Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="search-bar__search-btn"
          aria-label={t('search.button')}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16ZM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="search-bar__loading">
            <div className="search-bar__spinner"></div>
          </div>
        )}

        {/* Clear Button */}
        {keyword && !isLoading && (
          <button
            type="button"
            onClick={() => {
              setKeyword('');
              setSuggestion([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="search-bar__clear-btn"
            aria-label={t('search.clear')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestion.length > 0 && (
        <div
          ref={suggestionRef}
          id="search-suggestion"
          className="search-bar__suggestion"
          role="listbox"
        >
          {suggestion.map((suggestion, index) => (
            <div
              key={suggestion._id}
              className={`search-bar__suggestion-item ${
                index === selectedIndex ? 'search-bar__suggestion-item--selected' : ''
              }`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="search-bar__term-name">
                {getTermText(suggestion)}
              </div>
              {suggestion.categoryName && (
                <div className="search-bar__category-badge">
                  {suggestion.categoryName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && !isLoading && keyword.length >= 2 && suggestion.length === 0 && (
        <div ref={suggestionRef} className="search-bar__suggestion">
          <div className="search-bar__no-results">
            {t('search.noResults')}
          </div>
        </div>
      )}
    </div>
  );
}