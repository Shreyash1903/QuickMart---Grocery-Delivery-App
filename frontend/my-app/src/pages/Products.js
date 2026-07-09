import React from "react";
import { useSearchParams } from "react-router-dom";
import ProductSection from "../components/ProductSection";

function Products() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  return (
    <div className="products-page-wrapper">
      <ProductSection 
        initialCategory={category} 
        initialSearch={search} 
      />
    </div>
  );
}

export default Products;