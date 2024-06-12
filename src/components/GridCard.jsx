import "./GridCard.scss";

const GridCard = ({ product }) => {
  const { title, category, price, rating, thumbnail } = product || {};
  return (
    <div className="grid-card">
      <div className="product-image-wrapper">
        <img src={thumbnail} alt="product image" className="product-image" />
      </div>
      <div className="productDetailsWrapper">
        <div className="product-title">{title}</div>
        <div className="product-category">{category}</div>
        <div className="product-price">$ {price}</div>
        <div className="product-rating">{rating} Rating</div>
      </div>
    </div>
  );
};

export default GridCard;
