import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import ProductList from './components/ProductList' // 🚀 Import the Parent Pagination Component

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-dark min-vh-100 text-white pb-5">
      {/* Header Heading */}
      <h1 className='bg-primary text-white p-4 text-center rounded-bottom-3 shadow-sm fw-bold'>
        Code Vector Assignment
      </h1>

      {/* Hero Search Section Banner */}
      <div className='p-4 bg-secondary bg-opacity-10 m-4 rounded-3 text-center border border-secondary border-opacity-25'>
        <h4 className="mb-0 text-info">Search for what you want</h4>
      </div>

      {/* Interactive Search Bar Input */}
      <div className="row justify-content-center mx-2 mb-5">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="input-group shadow-sm">
            <input 
              type="text" 
              className='form-control bg-dark text-white border-secondary border-opacity-50 py-2.5 px-3' 
              placeholder='What are you looking for...' 
            />
            <button className='btn btn-primary px-4 fw-semibold d-flex align-items-center justify-content-center' style={{ width: '60px' }}>
              <img src='/search.svg' alt="search" style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 Render the Live Paginated Marketplace Grid here! */}
      <div className="container">
        <ProductList />
      </div>
    </div>
  )
}

export default App