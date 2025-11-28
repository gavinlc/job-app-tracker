import { Button } from './ui/button';
import SearchBar from './SearchBar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { LayoutList, LayoutGrid, Table, Plus, X, Star, Zap } from 'lucide-react';

type ViewMode = 'list' | 'kanban' | 'table';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearch: (query: string) => void;
  onAddApplication: () => void;
  filterStarred: boolean;
  filterActive: boolean;
  filterStatus: string | null;
  onToggleStarredFilter: () => void;
  onToggleActiveFilter: () => void;
  onClearFilters: () => void;
}

export function Toolbar({
  viewMode,
  onViewModeChange,
  onSearch,
  onAddApplication,
  filterStarred,
  filterActive,
  filterStatus,
  onToggleStarredFilter,
  onToggleActiveFilter,
  onClearFilters,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <SearchBar onSearch={onSearch} />
      <Select value={viewMode} onValueChange={onViewModeChange}>
        <SelectTrigger className="w-[140px] ml-auto">
          <div className="flex items-center gap-2">
            {viewMode === 'list' && <LayoutList className="h-4 w-4" />}
            {viewMode === 'table' && <Table className="h-4 w-4" />}
            {viewMode === 'kanban' && <LayoutGrid className="h-4 w-4" />}
            <SelectValue>
              {viewMode === 'list' && 'List'}
              {viewMode === 'table' && 'Table'}
              {viewMode === 'kanban' && 'Kanban'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="list">
            <div className="flex items-center gap-2">
              <LayoutList className="h-4 w-4" />
              <span>List</span>
            </div>
          </SelectItem>
          <SelectItem value="table">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              <span>Table</span>
            </div>
          </SelectItem>
          <SelectItem value="kanban">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Kanban</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <Button 
        onClick={onAddApplication}
        className="whitespace-nowrap flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Application
      </Button>
      <Button
        onClick={onToggleStarredFilter}
        variant={filterStarred ? "default" : "outline"}
        className="flex items-center gap-2"
      >
        <Star className={`h-4 w-4 ${filterStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        {filterStarred ? 'Starred Only' : 'Show Starred'}
      </Button>
      <Button
        onClick={onToggleActiveFilter}
        variant={filterActive ? "default" : "outline"}
        className="flex items-center gap-2"
      >
        <Zap className="h-4 w-4" />
        {filterActive ? 'Active Only' : 'Show Active'}
      </Button>
      {(filterStatus || filterStarred || filterActive) && (
        <Button 
          onClick={onClearFilters}
          variant="outline"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}

