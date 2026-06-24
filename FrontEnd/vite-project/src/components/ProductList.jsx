export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search & Mode States
  const [searchInput, setSearchInput] = useState(""); 
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

  // Standard Cursor Feed States
  const [feedPageNumber, setFeedPageNumber] = useState(1);
  const [currentCursor, setCurrentCursor] = useState({ category: null, createdAt: null, id: null });
  const [cursorHistory, setCursorHistory] = useState([]);

  // 1. Fetching from standard cursor browse API
  const fetchStandardFeed = async (cursorObj, direction) => {
    setLoading(true);
    setError(null);
    try {
      let url = `https://paginationassingment.onrender.com/products?limit=20`;
      
      if (cursorObj.category && cursorObj.createdAt && cursorObj.id) {
        url += `&cursor_category=${encodeURIComponent(cursorObj.category)}&cursor_created_at=${encodeURIComponent(cursorObj.createdAt)}&cursor_id=${cursorObj.id}`;
      }

      const response = await axios.get(url);
      
      let incomingData = [];
      if (response.data && response.data.data) {
        incomingData = response.data.data; 
      } else if (Array.isArray(response.data)) {
        incomingData = response.data;      
      } else {
        incomingData = response.data?.products || [];
      }
      
      setProducts(incomingData);

      if (direction === 'next') {
        setCursorHistory((prev) => [...prev, currentCursor]);
        setFeedPageNumber((prev) => prev + 1);
      } else if (direction === 'prev') {
        setFeedPageNumber((prev) => prev - 1);
      }

      if (incomingData.length > 0) {
        const lastItem = incomingData[incomingData.length - 1];
        setCurrentCursor({ 
          category: lastItem.category, 
          createdAt: lastItem.created_at, 
          id: lastItem.id 
        });
      }
    } catch (err) {
      console.error("Feed error:", err);
      setError("Failed to load standard feed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetching from our dedicated search API route
  const fetchSearchResults = async (targetPage) => {
    setLoading(true);
    setError(null);
    try {
      // 🎯 FIX: Added the missing ".on" to ensure it hits your actual onrender domain!
      const url = `https://paginationassingment.onrender.com/products/search?query=${encodeURIComponent(searchInput)}&page=${targetPage}&limit=20`;
      
      const response = await axios.get(url);
      
      // Safe unpacking fallback for the search response layout
      let searchItems = [];
      if (response.data && response.data.data) {
        searchItems = response.data.data;
      } else if (Array.isArray(response.data)) {
        searchItems = response.data;
      } else {
        searchItems = [];
      }

      setProducts(searchItems);
      setSearchPage(targetPage);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search query failed.");
      setProducts([]); // Clear old list defensively on failure so it doesn't break map
    } finally {
      setLoading(false);
    }
  };

  // Run core feed automatically on startup
  useEffect(() => {
    fetchStandardFeed({ category: null, createdAt: null, id: null }, 'initial');
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") {
      setIsSearchMode(false);
      fetchStandardFeed({ category: null, createdAt: null, id: null }, 'initial');
      setFeedPageNumber(1);
      setCursorHistory([]);
    } else {
      setIsSearchMode(true);
      fetchSearchResults(1);
    }
  };

  // ... (rest of your component JSX return block stays down here)
}