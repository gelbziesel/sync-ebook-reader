const { useState, useEffect, useRef } = React;

// ============================================
// ICONS
// ============================================
const Icon = ({ d, className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const Play = ({ className }) => <Icon className={className} d="M5 3l14 9-14 9V3z" />;
const Pause = ({ className }) => <Icon className={className} d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />;
const SkipBack = ({ className }) => <Icon className={className} d="M19 20L9 12l10-8v16zM5 19V5" />;
const SkipForward = ({ className }) => <Icon className={className} d="M5 4l10 8-10 8V4zM19 5v14" />;
const BookOpen = ({ className }) => <Icon className={className} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" />;
const Volume2 = ({ className }) => <Icon className={className} d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />;
const Settings = ({ className }) => <Icon className={className} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />;
const Home = ({ className }) => <Icon className={className} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z M9 22V12h6v10" />;
const Target = ({ className }) => <Icon className={className} d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />;
const DragHandle = ({ className }) => <Icon className={className} d="M4 8h16M4 16h16" />;
const Bookmark = ({ className }) => <Icon className={className} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />;
const Folder = ({ className }) => <Icon className={className} d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />;
const Plus = ({ className }) => <Icon className={className} d="M12 5v14m-7-7h14" />;
const Edit = ({ className }) => <Icon className={className} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const Trash = ({ className }) => <Icon className={className} d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6" />;
const ChevronDown = ({ className }) => <Icon className={className} d="M6 9l6 6 6-6" />;
const ChevronRight = ({ className }) => <Icon className={className} d="M9 18l6-6-6-6" />;


// ============================================
// CONSTANTS
// ============================================
const MOBILE_BREAKPOINT = 768;
const HEADER_HEIGHT = 0;
const FOOTER_HEIGHT = 72;
const SCROLL_TRIGGER_PADDING = 30;
const CACHE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 500;

// ============================================
// JSDOC TYPE DEFINITIONS
// ============================================

/**
 * @typedef {Object} Book
 * @property {number} id - Unique book identifier
 * @property {string} folder - Folder name containing book files
 * @property {string} title - Book title
 * @property {string} author - Book author
 * @property {string} epub_path - Path to EPUB file
 * @property {string} srt_path - Path to SRT subtitle file
 * @property {string} audio_path - Path to audio file
 * @property {string|null} cover_data - Base64 encoded cover image
 * @property {number|null} bookmark_segment - Bookmarked segment index
 * @property {number|null} bookmark_time - Bookmarked audio time
 * @property {number} sort_order - Display order
 */

/**
 * @typedef {Object} Segment
 * @property {number} id - Unique segment identifier
 * @property {string} text - Segment text content
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {string|null} elementId - Associated HTML element ID
 */

/**
 * @typedef {Object} ScrollOptions
 * @property {boolean} shouldScroll - Whether to scroll at all
 * @property {boolean} instant - Use instant scroll (auto behavior)
 * @property {string} block - Scroll alignment ('center', 'start', 'end')
 * @property {boolean} isMobile - Is mobile device
 * @property {React.RefObject} contentRef - Reference to scrollable content
 */

// ============================================
// STORAGE MANAGER UTILITY
// ============================================
const StorageManager = {
  /**
   * Safely get item from sessionStorage
   * @param {string} key - Storage key
   * @returns {any|null} Parsed value or null if not found/error
   */
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.warn(`Failed to read ${key} from storage:`, err);
      return null;
    }
  },

  /**
   * Safely set item in sessionStorage with automatic cleanup on quota exceeded
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, clearing old cache');
        this.clear();
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (retryErr) {
          console.error('Still failed after clearing:', retryErr);
          return false;
        }
      }
      console.error(`Failed to save ${key}:`, err);
      return false;
    }
  },

  /**
   * Check if cached data is still valid
   * @param {string} timestampKey - Key for timestamp
   * @param {number} maxAgeMs - Maximum age in milliseconds
   * @returns {boolean} Whether cache is valid
   */
  isValid(timestampKey, maxAgeMs = CACHE_VALIDITY_MS) {
    const timestamp = this.get(timestampKey);
    return timestamp && (Date.now() - timestamp) < maxAgeMs;
  },

  /**
   * Clear all sessionStorage
   */
  clear() {
    try {
      sessionStorage.clear();
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  }
};

// ============================================
// TEXT PROCESSING UTILITIES
// ============================================

/**
 * Extract text content without furigana (ruby annotations)
 * @param {HTMLElement} element - Element to extract text from
 * @returns {string} Clean text without ruby annotations
 */
const getTextWithoutFurigana = (element) => {
  if (!element) return '';
  
  const clone = element.cloneNode(true);
  clone.querySelectorAll('rt, rp').forEach(el => el.remove());
  
  return clone.textContent || '';
};

/**
 * Normalize text for matching by applying NFKC and trimming whitespace
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalizeTextForMatching = (text) => {
  if (!text) return '';
  return text
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();
};

// ============================================
// SCROLL UTILITY
// ============================================

/**
 * Unified scroll handler for all segment highlighting scenarios
 * @param {number} segmentIndex - Index of segment to scroll to
 * @param {ScrollOptions} options - Scroll options
 */
const scrollToSegment = (segmentIndex, options = {}) => {
  const {
    shouldScroll = true,
    instant = false,
    block = 'center',
    isMobile = false,
    contentRef = null
  } = options;

  // Remove highlighting from all segments
document.querySelectorAll('.sync-segment, .sync-segment-container').forEach(el => {
    el.classList.remove('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');
  });
  
  // Try both selectors
  const element = document.querySelector(`[data-segment-id="${segmentIndex}"]`);
  if (!element) return;

  // Apply highlight
  element.classList.add('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');

  if (!shouldScroll) return;

  if (isMobile) {
    const elementRect = element.getBoundingClientRect();
    
    const isVisible = 
      (elementRect.top >= HEADER_HEIGHT + SCROLL_TRIGGER_PADDING) && 
      (elementRect.bottom <= (window.innerHeight - FOOTER_HEIGHT - SCROLL_TRIGGER_PADDING));
    
    if (!isVisible && contentRef?.current) {
      const targetScrollPosition = element.offsetTop - HEADER_HEIGHT - 10;
      contentRef.current.scrollTo({
        top: Math.max(0, targetScrollPosition),
        behavior: 'auto'
      });
    }
  } else {
    element.scrollIntoView({ 
      behavior: instant ? 'auto' : 'smooth', 
      block,
      inline: 'nearest'
    });
  }
};
// ============================================
// DRAG AND DROP BOOKS COMPONENT
// ============================================

/**
 * Drag-sortable book grid component
 * Allows reordering books via drag and drop on desktop
 * @param {Object} props
 * @param {Book[]} props.books - Array of books to display
 * @param {Function} props.onBooksReorder - Callback when books are reordered
 * @param {Function} props.onBookSelect - Callback when book is selected
 * @returns {JSX.Element}
 */

// SeriesCard component
const SeriesCard = ({ series, onOpenBook, onShowBooks, onEdit, onDelete, index }) => {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 hover:border-blue-300 dark:hover:border-blue-400 transition-all duration-300 group relative">
      {/* Main card - clicks open cover book */}
      <div 
        className="cursor-pointer"
        onClick={() => onOpenBook(series.cover_book_id)}
      >
        <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl overflow-hidden">
          {series.cover ? (
            <img 
              src={series.cover} 
              alt={`${series.name} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Folder className="w-16 h-16 text-white opacity-50" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                {series.name}
              </h3>
              <p className="text-stone-200 text-xs">
                {series.book_count} {series.book_count === 1 ? 'book' : 'books'}
              </p>
            </div>
          </div>
          
          {/* Control buttons */}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowBooks(series);
              }}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="View all books in series"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(series);
              }}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Edit series"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(series.id);
              }}
              className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title="Delete series"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
          
          {/* Series badge */}
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm flex items-center gap-1">
            <Folder className="w-3 h-3" />
            <span>Series</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

const DragSortableGrid = ({ items, onItemsReorder, onOpenBook, onShowSeriesBooks, onEditSeries, onDeleteSeries }) => {
  const [localItems, setLocalItems] = useState(items);
  const [draggingId, setDraggingId] = useState(null);
  const [draggingType, setDraggingType] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= MOBILE_BREAKPOINT);
  
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= MOBILE_BREAKPOINT);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (e, item) => {
    if (!isLargeScreen) return;
    const itemId = `${item.type}-${item.data.id}`;
    e.dataTransfer.setData('text/plain', itemId);
    setDraggingId(item.data.id);
    setDraggingType(item.type);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    const itemId = item.data.id;
    if (itemId !== draggingId) {
      setDragOverId(itemId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');
    const [draggedType, draggedId] = draggedItemId.split('-');
    
    const sourceIndex = localItems.findIndex(item => 
      item.type === draggedType && item.data.id === parseInt(draggedId)
    );
    const targetIndex = localItems.findIndex(item => 
      item.type === targetItem.type && item.data.id === targetItem.data.id
    );
    
    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
      const newItems = [...localItems];
      const [movedItem] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, movedItem);
      
      const itemsWithNewOrder = newItems.map((item, index) => ({
        ...item,
        sort_order: index
      }));
      
      setLocalItems(itemsWithNewOrder);
      onItemsReorder(itemsWithNewOrder);
    }
    
    setDraggingId(null);
    setDraggingType(null);
    setDragOverId(null);
  };

  const handleDragEnd = (e) => {
    setDraggingId(null);
    setDraggingType(null);
    setDragOverId(null);
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {localItems.map((item, index) => {
        const isDragging = draggingId === item.data.id && draggingType === item.type;
        const isDragOver = dragOverId === item.data.id;
        
        if (item.type === 'series') {
          return (
            <div
              key={`series-${item.data.id}`}
              draggable={isLargeScreen}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              className={`
                drag-sortable
                ${isDragging ? 'dragging' : ''}
                ${isDragOver ? 'drag-over' : ''}
              `}
            >
              <SeriesCard
                series={item.data}
                index={index}
                onOpenBook={(bookId) => {
                  if (bookId) onOpenBook(bookId);
                }}
                onShowBooks={onShowSeriesBooks}
                onEdit={onEditSeries}
                onDelete={onDeleteSeries}
                isLargeScreen={isLargeScreen}
              />
            </div>
          );
        } else {
          return (
            <div
              key={`book-${item.data.id}`}
              draggable={isLargeScreen}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              className={`
                drag-sortable bg-white dark:bg-stone-800 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-stone-200 dark:border-stone-700 hover:border-red-300 dark:hover:border-red-400 group relative
                ${isDragging ? 'dragging' : ''}
                ${isDragOver ? 'drag-over' : ''}
              `}
              onClick={() => onOpenBook(item.data.id)}
            >
              <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl overflow-hidden">
                {item.data.cover_data ? (
                  <img 
                    src={item.data.cover_data} 
                    alt={`${item.data.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                      {item.data.title}
                    </h3>
                    <p className="text-stone-200 text-xs line-clamp-1">
                      {item.data.author}
                    </p>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>Audio</span>
                  </div>
                </div>
              </div>
              
            
            </div>
          );
        }
      })}
    </div>
  );
};


// ============================================
// MAIN READER COMPONENT
// ============================================

/**
 * Main synchronized ebook reader component
 * Handles audio playback, text highlighting, and synchronization
 * @returns {JSX.Element}
 */
const SyncEbookReader = () => {
  // State
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [segments, setSegments] = useState([]);
  const [htmlSections, setHtmlSections] = useState([]);
  const [isMatched, setIsMatched] = useState(false);
  const [matchMode, setMatchMode] = useState(false);
  const [startElement, setStartElement] = useState(null);
  const [startSegment, setStartSegment] = useState(null);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [autoScroll, setAutoScroll] = useState(true);
  const [bookmarkSegment, setBookmarkSegment] = useState(null);
  const [showBookmarkToast, setShowBookmarkToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [segmentSearch, setSegmentSearch] = useState('');
  const [booksLoaded, setBooksLoaded] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [libraryPath, setLibraryPath] = useState('');
const [showPathEditor, setShowPathEditor] = useState(false);
const [editingPath, setEditingPath] = useState('');
const [series, setSeries] = useState([]);
const [expandedSeries, setExpandedSeries] = useState(new Set());
const [showSeriesModal, setShowSeriesModal] = useState(false);
const [editingSeries, setEditingSeries] = useState(null);
const [selectedBooksForSeries, setSelectedBooksForSeries] = useState([]);
const [showSeriesBooksModal, setShowSeriesBooksModal] = useState(false);
const [viewingSeriesBooks, setViewingSeriesBooks] = useState(null);

  // Refs
  const audioRef = useRef(null);
  const contentRef = useRef(null);
  const suppressTimeUpdateRef = useRef(false);
  const pendingBookmarkSegmentRef = useRef(null);
  const togglePlayPauseRef = useRef();
  const skipSegmentRef = useRef();
  const saveBookmarkRef = useRef();
  const jumpToSegmentRef = useRef();
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= MOBILE_BREAKPOINT || 
                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
  const loadConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      setLibraryPath(config.libraryPath);
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };
  
  loadConfig();
}, []);

useEffect(() => {
  const loadSeries = async () => {
    try {
      const response = await fetch('/api/series');
      const data = await response.json();
      setSeries(data);
    } catch (err) {
      console.error('Error loading series:', err);
    }
  };
  
  if (booksLoaded) {
    loadSeries();
  }
}, [booksLoaded]);
  
  // Apply reader-open class when book is loaded
  useEffect(() => {
    if (currentBook) {
      document.body.classList.add('reader-open');
      document.documentElement.classList.add('reader-open');
      document.getElementById('root').classList.add('reader-open');
    } else {
      document.body.classList.remove('reader-open');
      document.documentElement.classList.remove('reader-open');
      document.getElementById('root').classList.remove('reader-open');
    }
  }, [currentBook]);

  // Load books with caching
  useEffect(() => {
    const loadBooks = async () => {
      const cachedBooks = StorageManager.get('cachedBooks');
      const isCacheValid = StorageManager.isValid('cachedBooksTimestamp');
      
      if (cachedBooks && isCacheValid) {
        console.log('📚 Loading books from cache');
        setBooks(cachedBooks);
        setBooksLoaded(true);
      }
      
      try {
        console.log('🔄 Fetching fresh books data from server');
        const response = await fetch('/api/books');
        const freshBooks = await response.json();
        setBooks(freshBooks);
        setBooksLoaded(true);
        
        const booksMetadata = freshBooks.map(({ cover_data, ...book }) => book);
        StorageManager.set('cachedBooks', booksMetadata);
        StorageManager.set('cachedBooksTimestamp', Date.now());
      } catch (err) {
        console.error('Error loading books:', err);
        if (!cachedBooks) {
          setBooksLoaded(true);
        }
      }
    };
    
    loadBooks();
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (currentBook) {
        setCurrentBook(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentBook]);

  // Update URL when book changes
  useEffect(() => {
    if (currentBook) {
      window.history.pushState({ bookId: currentBook.id }, '', `/?book=${currentBook.id}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [currentBook]);

  // Update document title
  useEffect(() => {
    if (currentBook) {
      document.title = `${currentBook.title}`;
    } else {
      document.title = 'SyncEbook Reader';
    }
  }, [currentBook]);

  // Keep refs updated
  useEffect(() => { togglePlayPauseRef.current = togglePlayPause; });
  useEffect(() => { skipSegmentRef.current = skipSegment; });
  useEffect(() => { saveBookmarkRef.current = saveBookmark; });
  useEffect(() => { jumpToSegmentRef.current = jumpToSegment; });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

      if (e.key === ' ' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        togglePlayPauseRef.current();
      }

      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        saveBookmarkRef.current();
      }

      if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (window.bookmarkSegmentIndex != null) {
          jumpToSegmentRef.current(window.bookmarkSegmentIndex, true);
        }
      }

      if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        skipSegmentRef.current(-1);
      }

      if (e.key.toLowerCase() === 's' || e.key === 'ArrowRight') {
        e.preventDefault();
        skipSegmentRef.current(1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  const createSeries = async (name, coverBookId) => {
  try {
    const response = await fetch('/api/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, coverBookId })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Reload series
      const seriesResponse = await fetch('/api/series');
      const seriesData = await seriesResponse.json();
      setSeries(seriesData);
      
      return result.id;
    }
  } catch (err) {
    console.error('Error creating series:', err);
  }
};

const updateSeries = async (seriesId, name, coverBookId) => {
  try {
    await fetch(`/api/series/${seriesId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, coverBookId })
    });
    
    // Reload series
    const response = await fetch('/api/series');
    const data = await response.json();
    setSeries(data);
  } catch (err) {
    console.error('Error updating series:', err);
  }
};

const deleteSeries = async (seriesId) => {
  if (!confirm('Remove this series? (Books will not be deleted)')) return;
  
  try {
    await fetch(`/api/series/${seriesId}`, { method: 'DELETE' });
    
    // Reload data
    const [seriesResponse, booksResponse] = await Promise.all([
      fetch('/api/series'),
      fetch('/api/books')
    ]);
    
    setSeries(await seriesResponse.json());
    setBooks(await booksResponse.json());
  } catch (err) {
    console.error('Error deleting series:', err);
  }
};

const addBooksToSeries = async (seriesId, bookIds) => {
  try {
    await fetch(`/api/series/${seriesId}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookIds })
    });
    
    // Reload data
    const [seriesResponse, booksResponse] = await Promise.all([
      fetch('/api/series'),
      fetch('/api/books')
    ]);
    
    setSeries(await seriesResponse.json());
    setBooks(await booksResponse.json());
  } catch (err) {
    console.error('Error adding books to series:', err);
  }
};

const removeBookFromSeries = async (seriesId, bookId) => {
  try {
    await fetch(`/api/series/${seriesId}/books/${bookId}`, { method: 'DELETE' });
    
    // Reload data
    const [seriesResponse, booksResponse] = await Promise.all([
      fetch('/api/series'),
      fetch('/api/books')
    ]);
    
    setSeries(await seriesResponse.json());
    setBooks(await booksResponse.json());
  } catch (err) {
    console.error('Error removing book from series:', err);
  }
};



// SeriesBooksModal - shows all books in a series
const SeriesBooksModal = ({ series, books, onClose, onSelectBook }) => {
  if (!series) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-stone-200 dark:border-stone-700">
        <div className="p-6 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Folder className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {series.name}
              </h2>
              <span className="text-stone-500 dark:text-stone-400">
                ({books.length} {books.length === 1 ? 'book' : 'books'})
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book, index) => (
              <div
                key={book.id}
                onClick={() => {
                  onSelectBook(book.id);
                  onClose();
                }}
                className="bg-white dark:bg-stone-800 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 border border-stone-200 dark:border-stone-700 hover:border-red-300 dark:hover:border-red-400 group relative"
              >
                <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-xl overflow-hidden">
                  {book.cover_data ? (
                    <img 
                      src={book.cover_data} 
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white opacity-50" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-stone-200 text-xs line-clamp-1">
                        {book.author}
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                    <div className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Audio</span>
                    </div>
                  </div>
                </div>
                

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// SeriesModal component
const SeriesModal = ({ onClose, onSave, series, books }) => {
  const [name, setName] = useState(series?.name || '');
  const [coverBookId, setCoverBookId] = useState(series?.cover_book_id || null);
  const [selectedBooks, setSelectedBooks] = useState([]);
  
  useEffect(() => {
    if (series?.id) {
      fetch(`/api/series/${series.id}/books`)
        .then(res => res.json())
        .then(data => setSelectedBooks(data.map(b => b.id)))
        .catch(console.error);
    }
  }, [series]);
  
  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a series name');
      return;
    }
    
    onSave(name, coverBookId, selectedBooks);
  };
  
  const availableBooks = books.filter(b => !b.series_id || b.series_id === series?.id);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-stone-200 dark:border-stone-700">
        <div className="p-6 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {series ? 'Edit Series' : 'Create New Series'}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Series Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-stone-900 dark:text-stone-100"
                placeholder="Enter series name..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Cover Image (select a book)
              </label>
              <select
                value={coverBookId || ''}
                onChange={(e) => setCoverBookId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-stone-900 dark:text-stone-100"
              >
                <option value="">No cover</option>
                {availableBooks.map(book => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Books in Series
              </label>
              <div className="border border-stone-300 dark:border-stone-600 rounded-lg p-4 max-h-64 overflow-y-auto">
                {availableBooks.map(book => (
                  <label key={book.id} className="flex items-center gap-3 p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBooks.includes(book.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBooks([...selectedBooks, book.id]);
                        } else {
                          setSelectedBooks(selectedBooks.filter(id => id !== book.id));
                        }
                      }}
                      className="w-4 h-4 text-red-500 focus:ring-red-500 rounded"
                    />
                    <span className="text-stone-900 dark:text-stone-100">{book.title}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-stone-200 dark:border-stone-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-stone-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
          >
            {series ? 'Save Changes' : 'Create Series'}
          </button>
        </div>
      </div>
    </div>
  );
};

  // ============================================
  // BOOK LOADING HELPERS
  // ============================================
const saveLibraryPath = async () => {
  try {
    const response = await fetch('/api/config/library-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: editingPath })
    });
    
    const result = await response.json();
    
    if (result.success) {
      setLibraryPath(result.path);
      setShowPathEditor(false);
      
      // Reload books
      const booksResponse = await fetch('/api/books');
      const freshBooks = await booksResponse.json();
      setBooks(freshBooks);
      
      alert('✅ Library path updated and rescanned!');
    } else {
      alert('❌ Failed to update library path');
    }
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
};
  /**
   * Initialize UI state for new book load
   */
  const resetBookState = () => {
    setSegments([]);
    setHtmlSections([]);
    setIsMatched(false);
    setMatchMode(false);
    setStartElement(null);
    setStartSegment(null);
    setCurrentSegmentIndex(-1);
    setBookmarkSegment(null);
    window.bookmarkSegmentIndex = null;
  };

  /**
   * Set up bookmark data for later restoration
   * @param {Book} book - Book object with bookmark data
   */
  const prepareBookmark = (book) => {
    if (book.bookmark_segment !== null && book.bookmark_segment !== undefined) {
      window.bookmarkSegmentIndex = book.bookmark_segment;
      window.pendingBookmark = {
        segment: book.bookmark_segment,
        time: book.bookmark_time || 0
      };
    }
  };

  /**
   * Restore bookmark after content is loaded
   * @param {boolean} attachHandlers - Whether to attach click handlers (for cached HTML)
   */
const restoreBookmark = (attachHandlers = false) => {
  if (!window.pendingBookmark) return;
  
  const bookmark = window.pendingBookmark;
  
  if (attachHandlers) {
    const bookmarkElement = document.querySelector(
      `[data-segment-id="${bookmark.segment}"]`
    );
    if (bookmarkElement) {
      bookmarkElement.classList.add('bookmarked');
    }
  }
  
  setBookmarkSegment(bookmark.segment);
  setCurrentSegmentIndex(bookmark.segment);
  window.bookmarkSegmentIndex = bookmark.segment;
  
  // ✅ Add small offset to be INSIDE the segment, not at boundary
  const segmentStartTime = segments[bookmark.segment] 
    ? segments[bookmark.segment].start + 0.05  // +50ms offset
    : 0;
  
  pendingBookmarkSegmentRef.current = bookmark.segment;
  console.log(`📌 Bookmark segment ${bookmark.segment} queued, will start at ${segmentStartTime}s`);
  
  if (audioRef.current && audioRef.current.readyState >= 3 && segments[bookmark.segment]) {
    audioRef.current.currentTime = segmentStartTime;  // Use offset time
    pendingBookmarkSegmentRef.current = null;
    console.log(`✅ Audio already ready! Starting at segment ${bookmark.segment}: ${segmentStartTime}s`);
  }
  
  scrollToSegment(bookmark.segment, {
    shouldScroll: true,
    instant: true,
    block: 'center',
    isMobile,
    contentRef
  });
  
  window.pendingBookmark = null;
};


  /**
   * Load book with processed HTML (instant load path)
   * @param {Object} data - Book data from API
   */
  const loadBookWithCache = async (data) => {
    console.log('✨ Using cached processed HTML - instant load!');
    setIsMatched(true);
    
    setTimeout(() => {
      attachClickHandlers(data.segments);
      restoreBookmark(true);
      
      setTimeout(() => setIsLoading(false), 100);
    }, 100);
  };

  /**
   * Load book without cache (manual matching required)
   * @param {Object} data - Book data from API
   */
const loadBookWithoutCache = async (data) => {
  setIsLoading(false);
  
  // ✅ Queue the segment index for when audio loads
  if (window.pendingBookmark) {
    pendingBookmarkSegmentRef.current = window.pendingBookmark.segment;
    console.log(`📌 Bookmark segment ${window.pendingBookmark.segment} queued for non-cached load`);
  }
};

  /**
   * Main book loading function
   * @param {number} bookId - ID of book to load
   */
  const loadBook = async (bookId) => {
    try {
      setIsLoading(true);
      resetBookState();
      
      const response = await fetch(`/api/books/${bookId}/content`);
      const data = await response.json();
      
      setSegments(data.segments);
      setHtmlSections(data.htmlSections);
      setCurrentBook(data.book);
      
      prepareBookmark(data.book);
      
      console.log('Loaded:', data.segments.length, 'segments,', 
                  data.htmlSections.length, 'sections');
      
      if (data.hasProcessedHtml) {
        await loadBookWithCache(data);
      } else {
        await loadBookWithoutCache(data);
      }
      
    } catch (err) {
      console.error('Error loading book:', err);
      setIsLoading(false);
    }
  };

  /**
   * Reorder books in the library
   * @param {Book[]} reorderedBooks - Books in new order
   */
  const handleBooksReorder = async (reorderedBooks) => {
    try {
      setBooks(reorderedBooks);
      
      const booksMetadata = reorderedBooks.map(({ cover_data, ...book }) => book);
      StorageManager.set('cachedBooks', booksMetadata);
      StorageManager.set('cachedBooksTimestamp', Date.now());
      
      const sortedBooks = reorderedBooks.map((book, index) => ({
        id: book.id,
        sort_order: index
      }));
      
      const response = await fetch('/api/books/sort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortedBooks })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save sort order');
      }
      
      console.log('Book order saved successfully');
    } catch (err) {
      console.error('Error saving book order:', err);
      fetch('/api/books')
        .then(res => res.json())
        .then(data => {
          setBooks(data);
          const booksMetadata = data.map(({ cover_data, ...book }) => book);
          StorageManager.set('cachedBooks', booksMetadata);
        })
        .catch(console.error);
    }
  };

  /**
   * Save current playback position as bookmark
   */
const saveBookmark = async () => {
  if (currentSegmentIndex === -1 || !currentBook) return;
  
  try {
    await fetch(`/api/books/${currentBook.id}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segmentIndex: currentSegmentIndex,
        time: currentTime
      })
    });
    
    // Update both state AND cache
    const updatedBooks = books.map(b => 
      b.id === currentBook.id 
        ? { ...b, bookmark_segment: currentSegmentIndex, bookmark_time: currentTime }
        : b
    );
    setBooks(updatedBooks);
    
    // Update sessionStorage cache
    const booksMetadata = updatedBooks.map(({ cover_data, ...book }) => book);
    StorageManager.set('cachedBooks', booksMetadata);
    
    // Update current book object
    setCurrentBook({ ...currentBook, bookmark_segment: currentSegmentIndex, bookmark_time: currentTime });
    
    document.querySelectorAll('.sync-segment.bookmarked').forEach(el => {
      el.classList.remove('bookmarked');
    });
    
    const currentElement = document.querySelector(`[data-segment-id="${currentSegmentIndex}"]`);
    if (currentElement) {
      currentElement.classList.add('bookmarked');
    }
    
    window.bookmarkSegmentIndex = currentSegmentIndex;
    
    setBookmarkSegment(currentSegmentIndex);
    setShowBookmarkToast(true);
    setTimeout(() => setShowBookmarkToast(false), 2000);
    
    console.log('Bookmark saved at segment', currentSegmentIndex);
  } catch (err) {
    console.error('Error saving bookmark:', err);
  }
};

  /**
   * Cache processed HTML to server for instant future loads
   * @param {number} bookId - ID of book to cache
   */
  const cacheProcessedHtml = async (bookId) => {
    if (!contentRef.current) return;
    
    try {
      const sections = contentRef.current.querySelectorAll('[data-section-index]');
      const processedHtml = Array.from(sections).map(section => section.innerHTML);
      
      console.log('💾 Caching processed HTML...');
      await fetch(`/api/books/${bookId}/cache-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedHtml })
      });
      console.log('✅ Processed HTML cached for next time!');
    } catch (err) {
      console.error('Error caching processed HTML:', err);
    }
  };

  /**
   * Attach click handlers to pre-rendered segment spans
   * @param {Segment[]} segmentsData - Array of segment data
   */
const attachClickHandlers = (segmentsData) => {
  const contentDiv = contentRef.current;
  if (!contentDiv) return;
  
  // ✅ FIXED: Handle both regular segments AND container segments
  const segmentElements = contentDiv.querySelectorAll('[data-segment-id]');
  console.log(`Attaching handlers to ${segmentElements.length} pre-rendered segments...`);
  
  segmentElements.forEach(element => {
    element.onclick = (e) => {
      e.stopPropagation();
      if (isMobile) {
        console.log(`Mobile tap on segment - ignoring (no audio/scroll)`);
        return;
      }
      const idx = parseInt(element.getAttribute('data-segment-id'));
      const startTime = parseFloat(element.getAttribute('data-segment-start')) || 0;
      
      console.log(`Clicked segment ${idx}, jumping to time ${startTime}`);
      
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        setCurrentSegmentIndex(idx);
        
        scrollToSegment(idx, {
          shouldScroll: true,
          instant: false,
          block: 'center',
          isMobile,
          contentRef
        });
        
        audioRef.current.play().catch(err => {
          console.error('Playback failed:', err);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
    };
  });
};

  /**
   * Wrap segment text in a clickable span element for audio synchronization
   * @param {HTMLElement} element - Parent element containing the text to wrap
   * @param {string} segmentText - Text content to find and wrap
   * @param {number} segmentIndex - Index of the segment in the audio timeline
   * @param {number|null} segmentStart - Start time in audio (seconds), optional
   * @returns {HTMLSpanElement|null} The created span element, or null if wrapping failed
   */


const wrapSegmentInElement = (element, segmentText, segmentIndex, segmentStart = null) => {
  const elementText = getTextWithoutFurigana(element);
  
  const normalizedElement = normalizeTextForMatching(elementText);
  const normalizedSegment = normalizeTextForMatching(segmentText);
  
  if (!normalizedElement.includes(normalizedSegment)) return null;
  
  // ✅ NEW: Check if this element contains styled children (em-sesame, ruby, emphasis)
  const hasStyledChildren = element.querySelector('ruby, .em-sesame, [class*="em-"], [class*="emphasis"]');
  
  if (hasStyledChildren) {
    // ✅ Strategy 1: Wrap the entire parent element, preserving all children
    console.log(`✨ Segment ${segmentIndex} contains styled elements - wrapping parent`);
    
    // Don't wrap if already wrapped
    if (element.hasAttribute('data-segment-id')) {
      console.log(`⚠️ Element already has segment ID`);
      return null;
    }
    
    // Add segment data directly to the parent element
    element.setAttribute('data-segment-id', segmentIndex);
    element.classList.add('sync-segment-container', 'cursor-pointer', 'rounded', 'transition-colors');
    
    const startTime = segmentStart !== null ? segmentStart : (segments[segmentIndex]?.start || 0);
    element.setAttribute('data-segment-start', startTime);
    
    if (window.bookmarkSegmentIndex === segmentIndex) {
      element.classList.add('bookmarked');
    }
    
element.onclick = (e) => {
  // ✅ FIXED: Allow clicks on any child element to trigger
  e.stopPropagation();
  if (isMobile) return;
      
      const idx = parseInt(element.getAttribute('data-segment-id'));
      const startTime = parseFloat(element.getAttribute('data-segment-start')) || 0;
      
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        setCurrentSegmentIndex(idx);
        
        scrollToSegment(idx, {
          shouldScroll: true,
          instant: false,
          block: 'center',
          isMobile,
          contentRef
        });
        
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(error => {
              console.error('iOS segment click playback error:', error);
              setIsPlaying(false);
              alert('Tap the play button first to enable audio controls.');
            });
        }
      }
    };
    
    return element;
  }
  
  // ✅ Strategy 2: No styled children - use original text node wrapping
  const allOccurrences = [];
  let searchPos = 0;
  while (true) {
    const foundPos = elementText.indexOf(segmentText, searchPos);
    if (foundPos === -1) break;
    allOccurrences.push(foundPos);
    searchPos = foundPos + 1;
  }
  
  if (allOccurrences.length === 0) return null;
  
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let node;
  
  while (node = walker.nextNode()) {
    let parent = node.parentNode;
    let isInFurigana = false;
    
    while (parent && parent !== element) {
      if (parent.tagName === 'RT' || parent.tagName === 'RP') {
        isInFurigana = true;
        break;
      }
      parent = parent.parentNode;
    }
    
    if (!isInFurigana) {
      textNodes.push(node);
    }
  }
  
  let pos = null;
  for (const testPos of allOccurrences) {
    let charCount = 0;
    let foundNode = null;
    let foundOffset = -1;
    
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      const nodeStart = charCount;
      const nodeEnd = charCount + node.textContent.length;
      
      if (testPos >= nodeStart && testPos < nodeEnd) {
        foundNode = node;
        foundOffset = testPos - nodeStart;
        break;
      }
      
      charCount = nodeEnd;
    }
    
    if (!foundNode) continue;
    
    let isAlreadyWrapped = false;
    let checkParent = foundNode.parentNode;
    while (checkParent && checkParent !== element) {
      if (checkParent.classList && (
          checkParent.classList.contains('sync-segment') ||
          checkParent.hasAttribute('data-segment-id')
        )) {
        isAlreadyWrapped = true;
        break;
      }
      checkParent = checkParent.parentNode;
    }
    
    if (!isAlreadyWrapped) {
      pos = testPos;
      break;
    }
  }
  
  if (pos === null) return null;
  
  let charCount = 0;
  let startNodeIdx = -1;
  let startOffset = 0;
  let endNodeIdx = -1;
  let endOffset = 0;
  
  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i];
    const nodeStart = charCount;
    const nodeEnd = charCount + node.textContent.length;
    
    if (pos >= nodeStart && pos < nodeEnd && startNodeIdx === -1) {
      startNodeIdx = i;
      startOffset = pos - nodeStart;
    }
    
    if (pos + segmentText.length > nodeStart && pos + segmentText.length <= nodeEnd && startNodeIdx !== -1) {
      endNodeIdx = i;
      endOffset = pos + segmentText.length - nodeStart;
      break;
    }
    
    charCount = nodeEnd;
  }
  
  if (startNodeIdx === -1 || endNodeIdx === -1) return null;
  
  const span = document.createElement('span');
  span.className = 'sync-segment cursor-pointer rounded transition-colors';
  span.setAttribute('data-segment-id', segmentIndex);
  span.textContent = segmentText;
  
  const startTime = segmentStart !== null ? segmentStart : (segments[segmentIndex]?.start || 0);
  span.setAttribute('data-segment-start', startTime);
  
  if (window.bookmarkSegmentIndex === segmentIndex) {
    span.classList.add('bookmarked');
  }
  
  span.onclick = (e) => {
    e.stopPropagation();
    if (isMobile) return;

    const idx = parseInt(span.getAttribute('data-segment-id'));
    const startTime = parseFloat(span.getAttribute('data-segment-start')) || 0;
    
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      setCurrentSegmentIndex(idx);
      
      scrollToSegment(idx, {
        shouldScroll: true,
        instant: false,
        block: 'center',
        isMobile,
        contentRef
      });
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error('iOS segment click playback error:', error);
            setIsPlaying(false);
            alert('Tap the play button first to enable audio controls.');
          });
      }
    }
  };
  
  if (startNodeIdx === endNodeIdx) {
    const node = textNodes[startNodeIdx];
    const nodeText = node.textContent;
    const before = nodeText.substring(0, startOffset);
    const after = nodeText.substring(endOffset);
    
    const parent = node.parentNode;
    if (!parent) return null;
    
    if (before) parent.insertBefore(document.createTextNode(before), node);
    parent.insertBefore(span, node);
    if (after) parent.insertBefore(document.createTextNode(after), node);
    parent.removeChild(node);
    return span;
  }
  
  const startNode = textNodes[startNodeIdx];
  const endNode = textNodes[endNodeIdx];
  
  const beforeText = startNode.textContent.substring(0, startOffset);
  const startParent = startNode.parentNode;
  if (!startParent) return null;
  
  if (beforeText) startParent.insertBefore(document.createTextNode(beforeText), startNode);
  startParent.insertBefore(span, startNode);
  startParent.removeChild(startNode);
  
  for (let i = startNodeIdx + 1; i < endNodeIdx; i++) {
    const node = textNodes[i];
    if (node.parentNode) node.parentNode.removeChild(node);
  }
  
  if (endNode.parentNode) {
    const afterText = endNode.textContent.substring(endOffset);
    if (afterText) endNode.parentNode.insertBefore(document.createTextNode(afterText), endNode);
    endNode.parentNode.removeChild(endNode);
  }
  
  return span;
};

  /**
   * Start the matching process between text and audio segments
   */
const startMatching = async () => {
  // ✅ Clear processed HTML cache on re-match
  if (isMatched && currentBook) {
    console.log('🔄 Re-matching: Clearing processed HTML cache...');
    
    try {
      await fetch(`/api/books/${currentBook.id}/clear-cache`, {
        method: 'POST'
      });
      
      // Reload the book content to get fresh HTML
      const response = await fetch(`/api/books/${currentBook.id}/content`);
      const data = await response.json();
      
      setSegments(data.segments);
      setHtmlSections(data.htmlSections);
      console.log('✅ Fresh HTML loaded for re-matching');
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }
  
  setMatchMode(true);
  setStartElement(null);
  setStartSegment(null);
  setIsMatched(false);
};

  const selectStartElement = (elementId) => {
    setStartElement(elementId);
    
    const contentDiv = contentRef.current;
    if (contentDiv) {
      contentDiv.querySelectorAll('[data-element-id]').forEach(el => {
        el.classList.remove('bg-green-600/30', 'border-l-4', 'border-green-500');
      });
      
      const elem = contentDiv.querySelector(`[data-element-id="${elementId}"]`);
      if (elem) {
        elem.classList.add('bg-green-600/30', 'border-l-4', 'border-green-500');
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const selectStartSegment = (segIndex) => {
    setStartSegment(segIndex);
  };

  /**
   * Perform the segment-to-text matching algorithm
   */
  const performMatching = async () => {
    if (startElement === null || startSegment === null) {
      alert('Please select both a starting element and starting segment');
      return;
    }

    console.log('Starting match from element', startElement, 'and segment', startSegment);
    setMatchMode(false);
    setMatchingProgress({ current: 0, total: segments.length - startSegment, matched: 0, message: 'Starting...' });

    await new Promise(resolve => setTimeout(resolve, 100));
    
    const contentDiv = contentRef.current;
    if (!contentDiv) return;

    const allElements = Array.from(contentDiv.querySelectorAll('[data-element-id]'))
      .filter(el => el && el.parentNode);
    
    if (allElements.length === 0) {
      console.error('No valid elements found');
      setMatchingProgress(null);
      return;
    }
    
    console.log('Starting matching with', allElements.length, 'elements...');

    let matchedCount = 0;
    let batchMappings = {};
    const startElem = contentDiv.querySelector(`[data-element-id="${startElement}"]`);
    if (!startElem) {
      setMatchingProgress(null);
      return;
    }
    
    const startElemIndex = allElements.indexOf(startElem);
    let currentElementIndex = startElemIndex;
    
    const saveBatch = async (mappings) => {
      if (Object.keys(mappings).length === 0) return;
      
      console.log(`💾 Saving batch of ${Object.keys(mappings).length} mappings...`);
      setMatchingProgress(prev => ({ ...prev, message: `Saving batch of ${Object.keys(mappings).length} mappings...` }));
      
      try {
        const response = await fetch(`/api/books/${currentBook.id}/matching`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            startElement, 
            startSegment,
            mappings
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        console.log(`✅ Batch saved successfully`);
      } catch (err) {
        console.error('❌ Error saving batch:', err);
      }
    };
    
    for (let segIdx = startSegment; segIdx < segments.length; segIdx++) {
      const seg = segments[segIdx];
      let found = false;
      
      const progress = segIdx - startSegment;
      const total = segments.length - startSegment;
      const percentage = Math.round((progress / total) * 100);
      setMatchingProgress({
        current: progress,
        total: total,
        matched: matchedCount,
        percentage: percentage,
        message: `Processing segment ${segIdx}/${segments.length}`
      });
      
      for (let elemIdx = currentElementIndex; elemIdx < allElements.length; elemIdx++) {
        const element = allElements[elemIdx];
        
        if (!element || !element.parentNode) continue;
        
        const cleanText = getTextWithoutFurigana(element);
        const normalizedElement = normalizeTextForMatching(cleanText);
        const normalizedSegment = normalizeTextForMatching(seg.text);
        
        if (normalizedElement.length < 3) continue;
        if (!normalizedElement.includes(normalizedSegment)) continue;
        
        const wrappedSpan = wrapSegmentInElement(element, seg.text, segIdx);
        
        if (wrappedSpan) {
          matchedCount++;
          currentElementIndex = elemIdx;
          found = true;
          
          const elementId = element.getAttribute('data-element-id');
          batchMappings[segIdx] = elementId;
          
          if (segIdx % 100 === 0) {
            console.log(`✓ Matched segment ${segIdx}`);
          }
          break;
        }
      }
      
      if (!found && segIdx % 100 === 0) {
        console.log(`✗ No match for segment ${segIdx}: "${seg.text.substring(0, 30)}"`);
      }
      
      if (Object.keys(batchMappings).length >= BATCH_SIZE) {
        await saveBatch(batchMappings);
        batchMappings = {};
      }
    }
    
    await saveBatch(batchMappings);
    
    console.log(`Matched ${matchedCount}/${segments.length - startSegment} segments`);
    setMatchingProgress({ 
      current: segments.length - startSegment, 
      total: segments.length - startSegment, 
      matched: matchedCount, 
      percentage: 100, 
      message: 'Caching processed HTML...' 
    });
    setIsMatched(true);

    setTimeout(() => {
      cacheProcessedHtml(currentBook.id);
      setMatchingProgress(null);
    }, 500);

    if (window.pendingBookmark) {
      setTimeout(() => {
        const bookmark = window.pendingBookmark;
        setBookmarkSegment(bookmark.segment);
        setCurrentSegmentIndex(bookmark.segment);
        window.bookmarkSegmentIndex = bookmark.segment;
        
        if (audioRef.current && bookmark.time) {
          audioRef.current.currentTime = bookmark.time;
        }
        
        scrollToSegment(bookmark.segment, {
          shouldScroll: true,
          instant: true,
          block: 'center',
          isMobile,
          contentRef
        });
        console.log('Bookmark loaded!');
        window.pendingBookmark = null;
      }, 700);
    }
  };

  /**
   * Jump playback to a specific segment
   * @param {number} segmentIndex - Index of segment to jump to
   * @param {boolean} instantScroll - Use instant scroll instead of smooth
   */
  const jumpToSegment = (segmentIndex, instantScroll = false) => {
    if (!audioRef.current || !segments[segmentIndex]) return;

    suppressTimeUpdateRef.current = true;

    const segmentStart = segments[segmentIndex].start;
    audioRef.current.currentTime = segmentStart;

    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          console.log(`iOS: Playing from segment ${segmentIndex}, time ${segmentStart}`);
        })
        .catch(error => {
          console.error('iOS playback error:', error);
          setIsPlaying(false);
        });
    }

    setCurrentSegmentIndex(segmentIndex);
    
    scrollToSegment(segmentIndex, {
      shouldScroll: true,
      instant: isMobile || instantScroll,
      block: 'center',
      isMobile,
      contentRef
    });

    setTimeout(() => {
      suppressTimeUpdateRef.current = false;
    }, 250);
  };

  /**
   * Handle audio timeupdate event
   */
const handleTimeUpdate = () => {
  if (!audioRef.current || suppressTimeUpdateRef.current) return;
  
  const time = audioRef.current.currentTime;
  setCurrentTime(time);
  
  if (segments.length === 0) return;
  
  const segmentIndex = segments.findIndex(seg => 
    time >= seg.start && time <= seg.end
  );
  
  if (segmentIndex !== -1 && segmentIndex !== currentSegmentIndex) {
    const prevSegmentIndex = currentSegmentIndex;
    setCurrentSegmentIndex(segmentIndex);
    
    document.querySelectorAll('.sync-segment, .sync-segment-wrapper').forEach(el => {
      el.classList.remove('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');
    });
    
    const element = document.querySelector(`[data-segment-id="${segmentIndex}"]`);
    if (element) {
      element.classList.add('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');
    }
    
    if (autoScroll) {
      if (isMobile) {
        scrollToSegment(segmentIndex, {
          shouldScroll: true,
          instant: true,
          isMobile: true,
          contentRef
        });
      } else {
        const shouldScroll = prevSegmentIndex === -1 || segmentIndex > prevSegmentIndex;
        scrollToSegment(segmentIndex, {
          shouldScroll,
          instant: false,
          block: 'center',
          isMobile: false,
          contentRef
        });
      }
    }
  }
};

  /**
   * Toggle audio playback state
   */
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (isMobile && window.pendingBookmark) {
        audioRef.current.currentTime = window.pendingBookmark.time;
        console.log(`📱 Mobile: Playing from bookmark time ${window.pendingBookmark.time}`);
        window.pendingBookmark = null;
      }
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Playback failed:', err);
            setIsPlaying(false);
            if (err.name === 'NotAllowedError') {
              alert('Please tap the screen first, then try playing.');
            }
          });
      }
    }
    setIsPlaying(!isPlaying);
  };

  /**
   * Skip to next or previous segment
   * @param {number} direction - Skip direction (-1 for previous, 1 for next)
   */
  const skipSegment = (direction) => {
    const newIndex = currentSegmentIndex + direction;
    if (newIndex >= 0 && newIndex < segments.length) {
      if (isMobile) {
        document.querySelectorAll('.sync-segment').forEach(el => {
          el.classList.remove('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');
        });
        
        const newElement = document.querySelector(`[data-segment-id="${newIndex}"]`);
        if (newElement) {
          newElement.classList.add('dark:bg-blue-600', 'bg-yellow-200', 'text-black', 'dark:text-white');
          
          scrollToSegment(newIndex, {
            shouldScroll: true,
            instant: true,
            isMobile: true,
            contentRef
          });
        }
        
        if (audioRef.current && segments[newIndex]) {
          suppressTimeUpdateRef.current = true;
          audioRef.current.currentTime = segments[newIndex].start;
          setTimeout(() => {
            suppressTimeUpdateRef.current = false;
          }, 250);
          
          setCurrentSegmentIndex(newIndex);
          
          if (!isPlaying) {
            audioRef.current.play().catch(err => {
              console.error('Playback failed:', err);
            });
            setIsPlaying(true);
          }
        }
      } else {
        jumpToSegment(newIndex);
      }
    }
  };

  /**
   * Format seconds into human-readable time string
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time (HH:MM:SS or MM:SS)
   */
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Process HTML section for display
   * @param {string} htmlContent - Raw HTML content
   * @param {number} sectionIndex - Section index for identification
   * @returns {string} Processed HTML string
   */
  const processHtmlSection = (htmlContent, sectionIndex) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const clickableElements = tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li');
    clickableElements.forEach((elem, elemIndex) => {
      if (elem.textContent.trim().length > 0) {
        const uniqueId = `s${sectionIndex}-e${elemIndex}`;
        elem.setAttribute('data-element-id', uniqueId);
        
        if (matchMode) {
          elem.classList.add('cursor-pointer', 'transition-colors', 'rounded', 'p-1', 'm-1');
        }
      }
    });
    
    return tempDiv.innerHTML;
  };

  // ============================================
  // RENDER
  // ============================================

if (!currentBook) {
  // Create unified grid items (series + standalone books)
  const gridItems = [
    ...series.map(s => ({ type: 'series', data: s, sort_order: s.sort_order })),
    ...books.filter(b => !b.series_id).map(b => ({ type: 'book', data: b, sort_order: b.sort_order }))
  ].sort((a, b) => a.sort_order - b.sort_order);
  
  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Synchronized Ebook Reader</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSeriesModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span>New Series</span>
            </button>
            
            {libraryPath && (
              <button
                onClick={() => {
                  setEditingPath(libraryPath);
                  setShowPathEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors text-sm text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600"
              >
                <Settings className="w-4 h-4" />
                <span className="font-mono truncate max-w-md">{libraryPath}</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Series Books Modal */}
        {showSeriesBooksModal && viewingSeriesBooks && (
          <SeriesBooksModal
            series={viewingSeriesBooks}
            books={books.filter(b => b.series_id === viewingSeriesBooks.id).sort((a, b) => a.series_order - b.series_order)}
            onClose={() => {
              setShowSeriesBooksModal(false);
              setViewingSeriesBooks(null);
            }}
            onSelectBook={loadBook}
          />
        )}
        
        {/* Series Editor Modal */}
        {showSeriesModal && (
          <SeriesModal
            series={editingSeries}
            books={books}
            onClose={() => {
              setShowSeriesModal(false);
              setEditingSeries(null);
            }}
            onSave={async (name, coverBookId, selectedBooks) => {
              if (editingSeries) {
                await updateSeries(editingSeries.id, name, coverBookId);
                await addBooksToSeries(editingSeries.id, selectedBooks);
              } else {
                const seriesId = await createSeries(name, coverBookId);
                if (seriesId && selectedBooks.length > 0) {
                  await addBooksToSeries(seriesId, selectedBooks);
                }
              }
              
              setShowSeriesModal(false);
              setEditingSeries(null);
              
              // Reload data
              const [seriesResponse, booksResponse] = await Promise.all([
                fetch('/api/series'),
                fetch('/api/books')
              ]);
              setSeries(await seriesResponse.json());
              setBooks(await booksResponse.json());
            }}
          />
        )}
        
        {/* Path Editor Modal */}
        {showPathEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-stone-200 dark:border-stone-700">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-red-600 dark:text-red-400" />
                <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Edit Library Path</h2>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Library Path
                </label>
                <input
                  type="text"
                  value={editingPath}
                  onChange={(e) => setEditingPath(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-stone-900 dark:text-stone-100 font-mono"
                  placeholder="/path/to/library"
                />
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                  Enter the full path to your library folder containing book folders
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPathEditor(false)}
                  className="px-6 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-900 dark:text-stone-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveLibraryPath}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  Save & Rescan
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!booksLoaded ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            </div>
            <p className="text-stone-600 dark:text-stone-400">Loading library...</p>
          </div>
        ) : gridItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-600 dark:text-stone-400 text-lg mb-4">No books found in library</p>
            <p className="text-stone-500 dark:text-stone-500 text-sm">
              Current path: <span className="font-mono">{libraryPath}</span>
            </p>
          </div>
        ) : (
  <DragSortableGrid 
    items={gridItems}
    onItemsReorder={async (reorderedItems) => {
      // Update local state immediately
      const updatedBooks = [...books];
      const updatedSeries = [...series];
      
      reorderedItems.forEach((item, index) => {
        item.sort_order = index;
        
        if (item.type === 'series') {
          const seriesIndex = updatedSeries.findIndex(s => s.id === item.data.id);
          if (seriesIndex !== -1) {
            updatedSeries[seriesIndex] = { ...updatedSeries[seriesIndex], sort_order: index };
          }
        } else {
          const bookIndex = updatedBooks.findIndex(b => b.id === item.data.id);
          if (bookIndex !== -1) {
            updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], sort_order: index };
          }
        }
      });
      
      setBooks(updatedBooks);
      setSeries(updatedSeries);
      
      // Save to server
      const bookUpdates = reorderedItems
        .filter(item => item.type === 'book')
        .map(item => ({ id: item.data.id, sort_order: item.sort_order }));
        
      const seriesUpdates = reorderedItems
        .filter(item => item.type === 'series')
        .map(item => ({ id: item.data.id, sort_order: item.sort_order }));
      
      try {
        if (bookUpdates.length > 0) {
          await fetch('/api/books/sort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortedBooks: bookUpdates })
          });
        }
        
        if (seriesUpdates.length > 0) {
          await fetch('/api/series/sort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortedSeries: seriesUpdates })
          });
        }
      } catch (err) {
        console.error('Error saving sort order:', err);
      }
    }}
    onOpenBook={loadBook}
    onShowSeriesBooks={(series) => {
      setViewingSeriesBooks(series);
      setShowSeriesBooksModal(true);
    }}
    onEditSeries={(series) => {
      setEditingSeries(series);
      setShowSeriesModal(true);
    }}
    onDeleteSeries={deleteSeries}
  />
)}
      </div>
    </div>
  );
}


  return (
    <div className="h-screen bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col overflow-hidden">
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-stone-50 to-red-50 dark:from-stone-900 dark:to-stone-800 z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{currentBook.title}</h2>
            <p className="text-stone-600 dark:text-stone-400">Loading content...</p>
          </div>
        </div>
      )}

      <div className="invisible md:visible bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-sm p-4 fixed top-0 left-0 right-0 z-10 h-20">
        <div className="container mx-auto flex items-center justify-between h-full">
          <button 
            onClick={() => {
              setCurrentBook(null);
              window.history.replaceState(null, '', window.location.pathname);
            }}
            className="flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Library</span>
          </button>
          <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100 truncate px-4">{currentBook.title}</h1>
          <div className="flex gap-2">
            {!isMatched && !matchMode && segments.length > 0 && (
              <button
                onClick={startMatching}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <Target className="w-5 h-5" />
                Match
              </button>
            )}
            {matchMode && (
              <button
                onClick={performMatching}
                disabled={startElement === null || startSegment === null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                Apply Match ({startElement !== null ? '✓' : '?'} para, {startSegment !== null ? '✓' : '?'} seg)
              </button>
            )}
            {isMatched && (
              <div className="flex gap-2">
                <span className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm border border-red-200 dark:border-red-800">✓ Matched</span>
                <button
                  onClick={() => {
                    setIsMatched(false);
                    startMatching();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm shadow-sm"
                >
                  Re-match
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookmarkToast && (
        <div className="fixed top-20 right-4 bg-amber-400 text-stone-900 dark:bg-amber-600 dark:text-stone-100 px-6 py-3 rounded-lg shadow-lg z-20 border border-amber-500 dark:border-amber-400">
          📚 Bookmark saved!
        </div>
      )}

      {matchingProgress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-stone-200 dark:border-stone-700">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <Target className="w-8 h-8 text-red-600 dark:text-red-400 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">Matching Segments</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">{matchingProgress.message}</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 ease-out"
                    style={{ width: `${matchingProgress.percentage || 0}%` }}
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300 drop-shadow">
                    {matchingProgress.percentage || 0}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {matchingProgress.current}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {matchingProgress.matched}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-600 dark:text-stone-300">
                    {matchingProgress.total}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Total</div>
                </div>
              </div>
              
              <div className="flex justify-center items-center gap-2 pt-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex fixed ${isMobile ? 'top-0' : 'top-20'} ${isMobile ? 'bottom-[72px]' : 'bottom-[153px]'} left-0 right-0 overflow-hidden`}>
        {matchMode && (
          <div className="w-80 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 shadow-sm flex flex-col h-full">
            <div className="bg-white dark:bg-stone-800 p-4 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">Select Start Segment</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Jump to segment #"
                  className="w-full text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 px-3 py-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const segNum = parseInt(e.target.value);
                      if (segNum >= 0 && segNum < segments.length) {
                        document.getElementById(`seg-${segNum}`)?.scrollIntoView({ block: 'center' });
                      }
                    }
                  }}
                />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search segment text..."
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                    className="w-full text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 px-3 py-2 pr-8 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {segmentSearch && (
              <div className="border-b border-stone-200 dark:border-stone-700">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">
                    Search Results ({segments.filter(seg => 
                      seg.text.toLowerCase().includes(segmentSearch.toLowerCase())
                    ).length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto minimal-scrollbar">
                    {segments
                      .filter(seg => seg.text.toLowerCase().includes(segmentSearch.toLowerCase()))
                      .slice(0, 10)
                      .map((seg, resultIndex) => {
                        const originalIndex = segments.findIndex(s => s === seg);
                        return (
                          <div
                            key={originalIndex}
                            onClick={() => {
                              setSegmentSearch('');
                              selectStartSegment(originalIndex);
                              setTimeout(() => {
                                document.getElementById(`seg-${originalIndex}`)?.scrollIntoView({ 
                                  behavior: 'smooth', 
                                  block: 'center' 
                                });
                              }, 100);
                            }}
                            className="p-2 rounded cursor-pointer text-xs bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-600 transition-colors"
                          >
                            <div className="font-mono text-stone-500 dark:text-stone-400">#{originalIndex}</div>
                            <div className="line-clamp-2">{seg.text}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 dark:bg-stone-900 minimal-scrollbar">
              <div className="space-y-2">
                {segments.map((seg, idx) => (
                  <div
                    key={idx}
                    id={`seg-${idx}`}
                    onClick={() => selectStartSegment(idx)}
                    className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                      startSegment === idx
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                    }`}
                  >
                    <div className="font-mono text-xs text-stone-500 dark:text-stone-400 mb-1">#{idx}</div>
                    <div className="line-clamp-2">{seg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6 minimal-scrollbar" ref={contentRef}>
          <div className="container mx-auto max-w-3xl break-words overflow-wrap-anywhere">
            {matchMode && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shadow-sm">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  <strong>Step 1:</strong> Scroll and click a segment in the sidebar (left) →<br/>
                  <strong>Step 2:</strong> Click a paragraph/heading below where that segment should start →<br/>
                  <strong>Step 3:</strong> Click "Apply Match" above
                </p>
              </div>
            )}
            
            {segments.length === 0 ? (
              <div className="text-center text-stone-600 dark:text-stone-400 py-12">
                <p>Loading...</p>
              </div>
            ) : htmlSections.length === 0 ? (
              <div className="text-center text-stone-600 dark:text-stone-400 py-12">
                <p>Error: Could not extract EPUB content</p>
                <p className="text-sm mt-2">This EPUB format may not be supported</p>
              </div>
            ) : (
              <div>
                {htmlSections.map((htmlContent, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    data-section-index={sectionIndex}
                    className="mb-6 break-words"
                    onClick={(e) => {
                      if (matchMode) {
                        const target = e.target.closest('[data-element-id]');
                        if (target) {
                          const elementId = target.getAttribute('data-element-id');
                          selectStartElement(elementId);
                        }
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: processHtmlSection(htmlContent, sectionIndex) }}
                    
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 shadow-lg fixed bottom-0 left-0 right-0 z-10">
        {!isMobile ? (
          <div className="p-4">
            <div className="container mx-auto max-w-3xl">
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = e.target.value;
                    }
                  }}
                  className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
                />
                <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
                    {[0.9, 0.95, 1].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => {
                          setPlaybackRate(rate);
                          if (audioRef.current) {
                            audioRef.current.playbackRate = rate;
                          }
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                          playbackRate === rate
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white dark:hover:bg-stone-600'
                        }`}
                      >
                        {rate === 1 ? '1x' : rate.toFixed(2)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => skipSegment(-1)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300"
                  >
                    <SkipBack />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </button>
                  
                  <button
                    onClick={() => skipSegment(1)}
                    className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300"
                  >
                    <SkipForward />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoScroll(!autoScroll)}
                    className="flex items-center gap-2 group"
                  >
                    <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      autoScroll 
                        ? 'bg-red-500' 
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                        autoScroll ? 'left-7' : 'left-1'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium transition-colors ${
                      autoScroll
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}>
                      Auto-scroll
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className="flex items-center gap-1 p-1"
                aria-label={`Auto-scroll ${autoScroll ? 'on' : 'off'}`}
              >
                <div className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  autoScroll 
                    ? 'bg-red-500' 
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    autoScroll ? 'left-7' : 'left-1'
                  }`} />
                </div>
              </button>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => skipSegment(-1)}
                  className="p-4 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300"
                >
                  <SkipBack />
                </button>
                
                <button
                  onClick={togglePlayPause}
                  className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {isPlaying ? <Pause /> : <Play />}
                </button>
                
                <button
                  onClick={() => skipSegment(1)}
                  className="p-4 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors text-stone-700 dark:text-stone-300"
                >
                  <SkipForward />
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={saveBookmark}
                  className="p-4 text-stone-600 dark:text-stone-400"
                  aria-label="Save bookmark"
                >
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

<audio
  ref={audioRef}
  playsInline
  onTimeUpdate={handleTimeUpdate}
  onLoadedMetadata={(e) => {
    setDuration(e.target.duration);
    console.log('📻 Audio metadata loaded');
  }}
  onCanPlay={(e) => {
    if (pendingBookmarkSegmentRef.current !== null && segments[pendingBookmarkSegmentRef.current]) {
      const segmentIndex = pendingBookmarkSegmentRef.current;
      
      // ✅ Add small offset to avoid boundary issues
      const segmentStartTime = segments[segmentIndex].start + 0.05;  // +50ms
      
      console.log(`✅ Audio ready! Starting at segment ${segmentIndex}: ${segmentStartTime}s`);
      e.target.currentTime = segmentStartTime;
      pendingBookmarkSegmentRef.current = null;
    }
  }}
  onEnded={() => setIsPlaying(false)}
>
  {currentBook && <source src={`/api/books/${currentBook.id}/audio`} />}
</audio>
      </div>
    </div>
  );
};

ReactDOM.render(<SyncEbookReader />, document.getElementById('root'));