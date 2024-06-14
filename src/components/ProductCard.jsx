import "./ProductCard.scss";

const ProductCard = ({ product }) => {
  const { title, category, price, rating, thumbnail } = product || {};
  return (
    <div className="grid-card">
      <div className="product-image-wrapper">
        <img className="product-image" src={thumbnail} alt="product image" />
      </div>
      <div className="product-details-Wrapper">
        <div className="products-detail">{title}</div>
        <div className="products-detail">{category}</div>
        <div className="products-detail">$ {price}</div>
        <div className="products-detail">{rating} Rating</div>
      </div>
    </div>
  );
};

export default ProductCard;
