import { memo } from "react";
import "./ProductCard.scss";

const ProductCard = memo(({ product }) => {
  const { title, category, price, rating, thumbnail } = product || {};
  return (
    <div className="grid-card">
      <div className="product-image-wrapper">
        <img className="product-image" src={thumbnail} alt="product image" />
      </div>
      <div className="product-details-Wrapper">
        <div>{title}</div>
        <div>{category}</div>
        <div>$ {price}</div>
        <div>{rating} Rating</div>
      </div>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
