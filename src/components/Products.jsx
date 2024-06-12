import { useCallback, useEffect, useRef, useState } from "react";
import "./Products.scss";
import { httpRequest } from "../services/service";
import { AutoSizer, Grid, InfiniteLoader } from "react-virtualized";
import ProductCard from "./ProductCard";
import { productCategories } from "../utils/constants";

const NAME_ASC = "nameAsc";
const NAME_DESC = "nameDesc";
const PRICE_ASC = "priceAsc";
const PRICE_DESC = "PriceDesc";
const RATING_ASC = "ratingAsc";
const RATING_DESC = "ratingDesc";

const Products = () => {
  const [products, setProducts] = useState({
    list: [],
    isLoading: false,
    hasMore: false,
  });
  const [category, setCategory] = useState(null);

  const [queryParamsState, setQueryParamsState] = useState({
    sortBy: undefined,
    order: undefined,
  });

  const onRowsRenderedRef = useRef(null);

  const limit = 3;

  const { list, isLoading, hasMore } = products;

  const columnCount = 6;
  const rowCount = Math.ceil(list.length / columnCount) + 1;

  const getProducts = useCallback(
    async ({
      abortController,
      category,
      queryParams,
      isAppendingData = false,
    } = {}) => {
      setProducts((prevProducts) => ({
        ...prevProducts,
        isLoading: true,
      }));
      try {
        const url = category
          ? `https://dummyjson.com/products/category/${category}`
          : "https://dummyjson.com/products";
        const res = await httpRequest({
          url,
          queryParams: { limit, ...queryParams },
          abortController,
        });
        if (res) {
          const { products, total } = res;
          setProducts((prevProducts) => ({
            list: isAppendingData
              ? [...prevProducts.list, ...products]
              : [...products],
            isLoading: false,
            hasMore: prevProducts.list.length + products.length < total,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const isRowLoaded = ({ index }) => {
    console.log("is row loaded", index, !!list[(index + 1) * columnCount + 1]);
    return !!list[index * columnCount];
  };

  const loadMoreRows = useCallback(
    ({ startIndex, stopIndex }) => {
      const endIndex = stopIndex + columnCount * 2;
      if (hasMore) {
        getProducts({
          category,
          queryParams: {
            ...queryParamsState,
            skip: list.length,
          },
          isAppendingData: true,
        });
      }
    },
    [category, getProducts, hasMore, list.length, queryParamsState]
  );

  const onSectionRendered = useCallback(
    ({ columnStartIndex, columnStopIndex, rowStartIndex, rowStopIndex }) => {
      console.log(
        columnStartIndex,
        columnStopIndex,
        rowStartIndex,
        rowStopIndex
      );
      if (onRowsRenderedRef.current) {
        onRowsRenderedRef.current({
          startIndex: rowStartIndex,
          stopIndex: rowStopIndex,
        });
      }
    },
    []
  );

  const handleFilterButtonClick = useCallback(
    (category) => {
      if (onRowsRenderedRef.current) {
        onRowsRenderedRef.current({
          startIndex: 0,
          stopIndex: 0,
        });
      }
      setCategory(category);
      setProducts((prev) => ({
        ...prev,
        list: [],
      }));
      getProducts({
        category,
        queryParams: queryParamsState,
      });
    },
    [getProducts, queryParamsState]
  );

  const handleSorting = (event) => {
    const val = event.target.value;
    let sortBy, order;
    switch (val) {
      case NAME_ASC:
        sortBy = "title";
        order = "asc";
        break;
      case NAME_DESC:
        sortBy = "title";
        order = "desc";
        break;
      case PRICE_ASC:
        sortBy = "price";
        order = "asc";
        break;
      case PRICE_DESC:
        sortBy = "price";
        order = "desc";
        break;
      case RATING_ASC:
        sortBy = "rating";
        order = "asc";
        break;
      case RATING_DESC:
        sortBy = "rating";
        order = "desc";
        break;
      default:
        sortBy = undefined;
        order = undefined;
        break;
    }

    setQueryParamsState((prevQueryParams) => ({
      ...prevQueryParams,
      sortBy,
      order,
    }));
    setProducts((prev) => ({
      ...prev,
      list: [],
    }));
    getProducts({
      category,
      queryParams: {
        sortBy,
        order,
        limit: list.length,
      },
    });
  };

  const cellRenderer = useCallback(
    ({ key, style, columnIndex, rowIndex }) => {
      const product = list[rowIndex * columnCount + columnIndex];
      if (!product) {
        return null;
      }
      return (
        <div key={key} style={style}>
          <ProductCard product={product} />
        </div>
      );
    },
    [list]
  );

  //   const noContentRenderer = useCallback(() => {
  //     return <>hello</>;
  //   }, []);
  console.log("row ", rowCount);
  useEffect(() => {
    const abortController = new AbortController();
    getProducts({ abortController });
    return () => {
      abortController.abort();
    };
  }, [getProducts]);

  return (
    <>
      <button
        onClick={() => {
          handleFilterButtonClick(null);
        }}
        className="filter-button"
      >
        All
      </button>
      {productCategories.map((category) => (
        <button
          key={category.name}
          onClick={() => {
            handleFilterButtonClick(category.slug);
          }}
          className="filter-button"
        >
          {category.name}
        </button>
      ))}

      <select onChange={handleSorting} defaultValue={undefined}>
        <option value="null">Sort Products</option>
        <option value={NAME_ASC}>Name A-Z</option>
        <option value={NAME_DESC}>Name Z-A</option>
        <option value={PRICE_ASC}>Price Low-High</option>
        <option value={PRICE_DESC}>Price High-Low</option>
        <option value={RATING_ASC}>Rating Low-High</option>
        <option value={RATING_DESC}>Rating High-Low</option>
      </select>

      <div style={{ height: "calc(100vh - 177px)" }}>
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              isRowLoaded={isRowLoaded}
              loadMoreRows={loadMoreRows}
              rowCount={rowCount}
              threshold={3}
            >
              {({ onRowsRendered, registerChild }) => {
                onRowsRenderedRef.current = onRowsRendered;
                return (
                  <Grid
                    cellRenderer={cellRenderer}
                    columnCount={columnCount}
                    columnWidth={200}
                    onSectionRendered={onSectionRendered}
                    ref={(ref) => {
                      registerChild(ref);
                    }}
                    height={height}
                    width={width}
                    rowCount={rowCount}
                    rowHeight={400}
                  />
                );
              }}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
    </>
  );
};

export default Products;
