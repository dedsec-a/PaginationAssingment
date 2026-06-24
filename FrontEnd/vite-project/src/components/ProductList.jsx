import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard"; // Make sure your folder path to ProductCard is correct!

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
      const url = `https://paginationassingment.onrender.com/products/search?query=${encodeURIComponent(searchInput)}&page=${targetPage}&limit=20`;
      
      const response = await axios.get(url);
      
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
      setProducts([]); 
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

  // 3. Pagination click handlers connected to your state machinery
  const handleNextPage = () => {
    if (isSearchMode) {
      fetchSearchResults(searchPage + 1);
    } else {
      fetchStandardFeed(currentCursor, 'next');
    }
  };

  const handlePrevPage = () => {
    if (isSearchMode) {
      if (searchPage > 1) fetchSearchResults(searchPage - 1);
    } else {
      if (cursorHistory.length > 0) {
        const previousHistory = [...cursorHistory];
        const prevCursor = previousHistory.pop(); 
        setCursorHistory(previousHistory);
        fetchStandardFeed(prevCursor, 'prev');
      }
    }
  };

  // 🛡️ DEFINITIVE CRASH-PROOF JSX RENDERING BLOCK
  return (
    <div className="container my-5 text-white">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-primary">Code Vector Assignment</h1>
        <p className="text-muted">High-Performance Full-Stack Pagination Interface</p>
      </div>

      {/* Modern Search Engine Form Input */}
      <form onSubmit={handleSearchSubmit} className="mb-4 d-flex justify-content-center">
        <div className="input-group" style={{ maxWidth: "600px" }}>
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Search for marketplace products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn btn-primary px-4" type="submit">
            Search
          </button>
        </div>
      </form>

      {/* High-Fidelity Product Cards Layout Grid */}
      <div className="row g-4 mt-2">
        {loading ? (
          <div className="text-center col-12 my-5">
            <div className="spinner-border text-primary mb-2" role="status"></div>
            <p className="text-muted small">Streaming database partitions over live network...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center col-12 mx-auto" style={{ maxWidth: "600px" }}>
            {error}
          </div>
        ) : Array.isArray(products) && products.length > 0 ? (
          products.map((product) => (
            <div className="col-lg-3 col-md-4 col-sm-6" key={product.id || Math.random()}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          <div className="text-center col-12 text-muted my-5">
            No marketplace items found matching this view scope definition.
          </div>
        )}
      </div>

      {/* Intuitive Pagination Controls UI */}
      <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
        <button
          className="btn btn-outline-secondary px-4 text-white"
          onClick={handlePrevPage}
          disabled={loading || (!isSearchMode && cursorHistory.length === 0) || (isSearchMode && searchPage === 1)}
        >
          &larr; Previous
        </button>
        <span className="badge bg-dark border border-secondary px-3 py-2 fs-6 fw-normal">
          Page {isSearchMode ? searchPage : feedPageNumber}
        </span>
        <button
          className="btn btn-outline-primary px-4 text-white"
          onClick={handleNextPage}
          disabled={loading || products.length < 20}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}