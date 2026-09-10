import React from "react";
import { Link } from "react-router-dom";

const ProductCard = React.memo(function ProductCard({ product }) {
  return (
    <Link className="product-card" to={`/products/${product.id}`}>
      <img
        src={product.image}
        alt={product.title}
        width="150"
      />
      <h2>{product.title}</h2>
      <p>${product.price}</p>
    </Link>
  );
});

export default ProductCard;