import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search applications by company, position, or notes..."
        className="flex-1"
      />
      <Button type="submit" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>
      {query && (
        <Button
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </form>
  );
}

export default SearchBar;
