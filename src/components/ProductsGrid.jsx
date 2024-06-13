import { useCallback, useEffect, useRef, useState } from "react";
import { AutoSizer, Grid, InfiniteLoader } from "react-virtualized";
import { httpRequest } from "../services/service";
import "react-virtualized/styles.css";
import ProductCard from "./ProductCard";
import { productCategories } from "../utils/constants";
import "./ProductGrid.scss";

const NAME_ASC = "nameAsc";
const NAME_DESC = "nameDesc";
const PRICE_ASC = "priceAsc";
const PRICE_DESC = "PriceDesc";
const RATING_ASC = "ratingAsc";
const RATING_DESC = "ratingDesc";

const ProductsGrid = () => {
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
  const { list, isLoading, hasMore } = products;
  const onRowsRenderedRef = useRef(null);
  const infiniteLoaderRef = useRef(null);

  const columnCount = 6;
  const [stopIndex, setStopIndex] = useState(0);
  const rowCount = list.length ? Math.ceil(list.length / columnCount) + 1 : 1;

  const isRowLoaded = useCallback(
    ({ index }) => {
      console.log("is row loaded", index);
      const start = index * columnCount;
      const end = start + columnCount;
      for (let i = start; i < end; i++) {
        if (!list[i]) {
          console.log(false);
          return false;
        }
      }
      console.log(true);
      return true;
    },
    [list]
  );

  const getProducts = useCallback(
    async ({
      abortController,
      category,
      queryParams = {},
      isAppending = true,
    } = {}) => {
      try {
        setProducts((prevProducts) => ({
          ...prevProducts,
          isLoading: true,
        }));
        const url = category
          ? `https://dummyjson.com/products/category/${category}`
          : "https://dummyjson.com/products";
        const res = await httpRequest({
          url,
          queryParams: { limit: 5, ...queryParams },
          abortController,
        });
        if (res) {
          const { products, total } = res;
          setProducts((prevProducts) => {
            const newList = isAppending
              ? [...prevProducts.list, ...products]
              : [...products];
            const hasMore = newList.length < total;
            if (newList.length % columnCount === 0 && hasMore) {
              setStopIndex(Math.ceil(newList.length / columnCount) + 1);
            }
            return {
              list: newList,
              isLoading: false,
              hasMore,
            };
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    []
  );

  const loadMoreRows = useCallback(
    ({ startIndex, stopIndex }) => {
      console.log("load more rows", startIndex, stopIndex);
      if (hasMore) {
        const start = startIndex * columnCount;
        const end = start + columnCount;
        let skip;
        for (let index = start; index < end; index++) {
          if (!list[index]) {
            skip = index;
            break;
          }
        }
        getProducts({
          category,
          queryParams: {
            ...queryParamsState,
            skip,
          },
        });
      }
    },
    [category, getProducts, hasMore, list, queryParamsState]
  );

  const onSectionRendered = ({ rowStartIndex, rowStopIndex }) => {
    console.log("in section", rowStartIndex, rowStopIndex);
    if (isLoading) {
      return;
    }
    onRowsRenderedRef.current({
      startIndex: rowStartIndex,
      stopIndex: rowStopIndex,
    });
  };

  const cellRenderer = ({ key, rowIndex, columnIndex, style }) => {
    const product = list[rowIndex * columnCount + columnIndex];
    if (!product) {
      return null;
    }
    return (
      <div key={product.id} style={style}>
        <ProductCard product={product} />
      </div>
    );
  };

  const handleFilterButtonClick = useCallback(
    (category) => {
      setProducts((prev) => ({
        ...prev,
        list: [],
      }));
      setCategory(category);
      getProducts({
        category,
        queryParams: { ...queryParamsState },
        isAppending: false,
      });
      if (infiniteLoaderRef.current) {
        infiniteLoaderRef.current.resetLoadMoreRowsCache();
      }
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
        ...queryParamsState,
        sortBy,
        order,
        limit: list.length,
      },
    });
  };

  useEffect(() => {
    const abortController = new AbortController();
    getProducts({ abortController });
    return () => {
      abortController.abort();
    };
  }, [getProducts]);

  useEffect(() => {
    console.log("my useEffect");
    if (onRowsRenderedRef.current) {
      onRowsRenderedRef.current({
        startIndex: 0,
        stopIndex: stopIndex,
      });
    }
  }, [stopIndex]);

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

      <div style={{ height: "100vh" }}>
        <InfiniteLoader
          isRowLoaded={isRowLoaded}
          loadMoreRows={loadMoreRows}
          rowCount={rowCount}
          threshold={1}
          ref={infiniteLoaderRef}
        >
          {({ onRowsRendered, registerChild }) => {
            onRowsRenderedRef.current = onRowsRendered;
            return (
              <AutoSizer>
                {({ height, width }) => {
                  return (
                    <Grid
                      width={width}
                      height={height}
                      ref={(grid) => {
                        registerChild(grid);
                      }}
                      columnWidth={width / columnCount}
                      columnCount={columnCount}
                      rowCount={rowCount}
                      rowHeight={300}
                      cellRenderer={cellRenderer}
                      onSectionRendered={onSectionRendered}
                    />
                  );
                }}
              </AutoSizer>
            );
          }}
        </InfiniteLoader>
      </div>
    </>
  );
};

export default ProductsGrid;
