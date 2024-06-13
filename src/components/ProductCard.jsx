import "./ProductCard.scss";

const ProductCard = ({ product }) => {
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
};

export default ProductCard;
