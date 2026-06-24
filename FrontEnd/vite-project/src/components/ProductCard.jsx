import React from "react";
import axios from 'axios';

const API_BASE_URL = 'https://paginationassingment.onrender.com';

function ProductCard({product}){
    return (
        <>
        <div className="card h-100 bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-white p-3 rounded-3 shadow-sm">
            <div className="card-body p-0 d-flex flex-column ">
                <div className="d-flex  flex-column justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary text-uppercase px-2 py-1" style={{fontSize : '0.75rem'}}>{product.category}</span>
                    <small className=" text-muted fw-mono">{product.id}</small>
                </div>

                <h5 className="card-tittle fw-bold text-white mb-1 mt-1">{product.name}</h5>

                <div className="d-flex flex-column justify-content-between align-item-center mt-auto pt-4">
                    <span className="text-success fw-bold fs-4 ms-auto">Rs {product.price}</span>
                    <small className="text-muted-small"> {product.created_at}</small>
                    </div>




            </div>
        </div>

        </>
    )

}

export default ProductCard;