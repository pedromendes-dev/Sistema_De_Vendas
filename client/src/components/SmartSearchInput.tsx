import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, User, DollarSign, Phone, Mail, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Sale, Attendant } from '@shared/schema';

interface SearchSuggestion {
  id: string;
  type: 'client' | 'attendant' | 'value' | 'recent';
  value: string;
  display: string;
  icon: React.ReactNode;
  sale?: Sale;
}

interface SmartSearchInputProps {
  sales: Sale[];
  attendants: Attendant[];
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  className?: string;
}

export default function SmartSearchInput({ 
  sales, 
  attendants, 
  onSearch, 
  placeholder = "Buscar vendas, clientes, atendentes...",
  className = ""
}: SmartSearchInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sales-search-history');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (!query.trim()) {
      // Show recent searches when empty
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent',
        value: search,
        display: search,
        icon: <Clock size={16} className="text-muted-light" />
      }));
      setSuggestions(recentSuggestions);
      return;
    }

    const newSuggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Client name suggestions
    const clientNames = new Set<string>();
    sales.forEach(sale => {
      if (sale.clientName && sale.clientName.toLowerCase().includes(queryLower)) {
        clientNames.add(sale.clientName);
      }
    });

    clientNames.forEach(name => {
      newSuggestions.push({
        id: `client-${name}`,
        type: 'client',
        value: name,
        display: name,
        icon: <User size={16} className="text-info" />
      });
    });

    // Phone number suggestions
    const phoneNumbers = new Set<string>();
    sales.forEach(sale => {
      if (sale.clientPhone && sale.clientPhone.includes(query)) {
        phoneNumbers.add(sale.clientPhone);
      }
    });

    phoneNumbers.forEach(phone => {
      const sale = sales.find(s => s.clientPhone === phone);
      newSuggestions.push({
        id: `phone-${phone}`,
        type: 'client',
        value: phone,
        display: `${phone} - ${sale?.clientName || 'Cliente'}`,
        icon: <Phone size={16} className="text-success" />,
        sale
      });
    });

    // Email suggestions
    const emails = new Set<string>();
    sales.forEach(sale => {
      if (sale.clientEmail && sale.clientEmail.toLowerCase().includes(queryLower)) {
        emails.add(sale.clientEmail);
      }
    });

    emails.forEach(email => {
      const sale = sales.find(s => s.clientEmail === email);
      newSuggestions.push({
        id: `email-${email}`,
        type: 'client',
        value: email,
        display: `${email} - ${sale?.clientName || 'Cliente'}`,
        icon: <Mail size={16} className="text-warning" />,
        sale
      });
    });

    // Attendant suggestions
    attendants.forEach(attendant => {
      if (attendant.name.toLowerCase().includes(queryLower)) {
        newSuggestions.push({
          id: `attendant-${attendant.id}`,
          type: 'attendant',
          value: attendant.name,
          display: attendant.name,
          icon: <User size={16} className="text-primary" />
        });
      }
    });

    // Value suggestions (if looks like a number)
    if (/^\d/.test(query)) {
      const matchingValues = new Set<string>();
      sales.forEach(sale => {
        if (sale.value.includes(query)) {
          matchingValues.add(sale.value);
        }
      });

      matchingValues.forEach(value => {
        newSuggestions.push({
          id: `value-${value}`,
          type: 'value',
          value: value,
          display: `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`,
          icon: <DollarSign size={16} className="text-success" />
        });
      });
    }

    // Limit suggestions
    setSuggestions(newSuggestions.slice(0, 8));
  }, [query, sales, attendants, recentSearches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchValue = suggestion.value;
    setQuery(searchValue);
    setShowSuggestions(false);
    
    // Save to recent searches
    saveRecentSearch(searchValue);
    
    // Apply specific filters based on suggestion type
    let filters = {};
    switch (suggestion.type) {
      case 'client':
        if (suggestion.value.includes('@')) {
          filters = { clientEmail: suggestion.value };
        } else if (/^\d/.test(suggestion.value)) {
          filters = { clientPhone: suggestion.value };
        } else {
          filters = { clientName: suggestion.value };
        }
        break;
      case 'attendant':
        const attendant = attendants.find(a => a.name === suggestion.value);
        if (attendant) {
          filters = { attendantId: attendant.id };
        }
        break;
      case 'value':
        filters = { value: suggestion.value };
        break;
    }
    
    onSearch(searchValue, filters);
  };

  const saveRecentSearch = (searchValue: string) => {
    const newRecents = [searchValue, ...recentSearches.filter(s => s !== searchValue)].slice(0, 10);
    setRecentSearches(newRecents);
    localStorage.setItem('sales-search-history', JSON.stringify(newRecents));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('sales-search-history');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (query.trim()) {
          saveRecentSearch(query);
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={suggestionsRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-light" size={18} />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={(e) => {
            // Delay to allow clicking on suggestions
            setTimeout(() => {
              if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 200);
          }}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-input border-border text-primary-light placeholder:text-muted-light"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-accent"
          >
            <X size={16} className="text-muted-light" />
          </Button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border-border shadow-lg">
          <CardContent className="p-2">
            {!query && recentSearches.length > 0 && (
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs text-muted-light">Buscas recentes</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="h-6 text-xs text-muted-light hover:text-primary-light"
                >
                  Limpar
                </Button>
              </div>
            )}
            
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-accent text-primary-light' 
                    : 'hover:bg-accent/50'
                }`}
              >
                {suggestion.icon}
                <span className="flex-1 text-sm text-primary-light">
                  {suggestion.display}
                </span>
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white text-gray-700 border border-gray-300"
                >
                  {suggestion.type === 'client' ? 'Cliente' :
                   suggestion.type === 'attendant' ? 'Atendente' :
                   suggestion.type === 'value' ? 'Valor' : 'Recente'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}