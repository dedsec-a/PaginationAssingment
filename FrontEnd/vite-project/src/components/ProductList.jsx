import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

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
      // 🎯 Fix 1: Add the explicit /products path name and a base question mark separator
      let url = `https://paginationassingment.onrender.com/products?limit=20`;
      
      // If cursor metadata is present, safely append them using query dividers
      if (cursorObj.category && cursorObj.createdAt && cursorObj.id) {
        url += `&cursor_category=${encodeURIComponent(cursorObj.category)}&cursor_created_at=${encodeURIComponent(cursorObj.createdAt)}&cursor_id=${cursorObj.id}`;
      }

      const response = await axios.get(url);
      
      // 🎯 Fix 2: Dynamically unpack the data payload array based on how it comes back
      let incomingData = [];
      if (response.data && response.data.data) {
        incomingData = response.data.data; // Handles the dictionary wrapper structure
      } else if (Array.isArray(response.data)) {
        incomingData = response.data;      // Handles a raw list structure fallback
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
// ✅ Update this line to use your live Render domain!
      const url = `https://paginationassingment.render.com/products/search?query=${encodeURIComponent(searchInput)}&page=${targetPage}&limit=20`;
      const response = await axios.get(url);
      setProducts(response.data.data);
      setSearchPage(targetPage);
    } catch (err) {
      setError("Search query failed.");
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
      // If user clears the search input box, revert back to standard cursor browse feed
      setIsSearchMode(false);
      fetchStandardFeed({ category: null, createdAt: null, id: null }, 'initial');
      setFeedPageNumber(1);
      setCursorHistory([]);
    } else {
      setIsSearchMode(true);
      fetchSearchResults(1);
    }
  };

  return (
    <div className="container mt-4">
      {/* Search Input Bar Element Form */}
      <form onSubmit={handleSearchSubmit} className="row justify-content-center mx-2 mb-5">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="input-group shadow-sm">
            <input 
              type="text" 
              className='form-control bg-dark text-white border-secondary border-opacity-50 py-2.5 px-3' 
              placeholder='Search products or leave empty to clear...' 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className='btn btn-primary px-4 fw-semibold'>🔍</button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {loading ? (
        <div className="text-center text-info my-5"><h4>Querying Route Matrix...</h4></div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {products.map((item) => (
            <div className="col" key={item.id}><ProductCard product={item} /></div>
          ))}
        </div>
      )}

      {/* 🧭 Dynamic Navigation Pagination UI Panel */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
        <button 
          className="btn btn-outline-info fw-bold px-4" 
          disabled={loading || (isSearchMode ? searchPage === 1 : cursorHistory.length === 0)}
          onClick={() => isSearchMode ? fetchSearchResults(searchPage - 1) : fetchStandardFeed(cursorHistory.pop(), 'prev')}
        >
          ⏮️ Previous
        </button>

        <span className="text-white font-monospace border border-secondary border-opacity-50 px-3 py-1.5 rounded bg-dark">
          Page {isSearchMode ? searchPage : feedPageNumber} {isSearchMode && "(Search Mode)"}
        </span>

        <button 
          className="btn btn-outline-info fw-bold px-4" 
          disabled={loading || products.length < 20}
          onClick={() => isSearchMode ? fetchSearchResults(searchPage + 1) : fetchStandardFeed(currentCursor, 'next')}
        >
          Next ⏭️
        </button>
      </div>
    </div>
  );
}