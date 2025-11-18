import { useState } from 'react';

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
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search applications by company, position, or notes..."
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:border-purple-500 transition-colors"
      />
      <button 
        type="submit" 
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  );
}

export default SearchBar;
