import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Grid,
  InfiniteLoader,
  CellMeasurer,
  CellMeasurerCache,
  WindowScroller,
} from "react-virtualized";
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
  const gridRef = useRef(null);

  const [stopIndex, setStopIndex] = useState(0);

  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 340,
        fixedWidth: true,
      }),
    []
  );

  const calculateColumnCount = (width) => {
    return Math.max(Math.floor(width / 250), 1);
  };

  const isRowLoaded = useCallback(
    ({ index }) => {
      if (isLoading) {
        return;
      }
      console.log("is row loaded", "index", index);
      const columnCount = calculateColumnCount(
        document.documentElement.clientWidth
      );
      const start = index * columnCount;
      const end = start + columnCount;
      for (let i = start; i < end; i++) {
        if (i >= list.length) {
          console.log(false);
          return false;
        }
        if (!list[i]) {
          console.log(false);
          return false;
        }
      }
      console.log(true);
      return true;
    },
    [isLoading, list]
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
            const columnCount = calculateColumnCount(
              document.documentElement.clientWidth
            );
            const oldRowCount = Math.ceil(
              prevProducts.list.length / columnCount
            );

            const newRowCount = Math.ceil(newList.length / columnCount);

            if (oldRowCount === newRowCount && hasMore) {
              setStopIndex(newRowCount);
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
      console.log("load more ", "start", startIndex, "stop", stopIndex);
      console.log("has more", hasMore);
      if (hasMore) {
        const columnCount = calculateColumnCount(
          document.documentElement.clientWidth
        );
        const start = startIndex * columnCount;
        const end = start + columnCount;
        let skip;
        for (let index = start; index < end; index++) {
          if (!list[index]) {
            skip = index;
            console.log("skip idx", index);
            break;
          }
        }
        console.log("skip index", skip);
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
    console.log(
      "on section renders",
      "rowStartIndex",
      rowStartIndex,
      "rowStopIndex",
      rowStopIndex
    );
    if (isLoading) {
      return;
    }
    onRowsRenderedRef.current({
      startIndex: rowStartIndex,
      stopIndex: rowStopIndex,
    });
  };

  const cellRenderer = ({ key, parent, rowIndex, columnIndex, style }) => {
    const columnCount = calculateColumnCount(parent.props.width);
    const product = list[rowIndex * columnCount + columnIndex];
    if (!product) {
      return null;
    }

    return (
      <CellMeasurer
        key={key}
        cache={cache}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
      >
        {() => (
          <div style={style}>
            <ProductCard product={product} />
          </div>
        )}
      </CellMeasurer>
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
      if (onRowsRenderedRef.current) {
        onRowsRenderedRef.current({
          startIndex: 0,
          stopIndex,
        });
      }
    },
    [getProducts, queryParamsState, stopIndex]
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
    if (infiniteLoaderRef.current) {
      infiniteLoaderRef.current.resetLoadMoreRowsCache();
    }
    if (onRowsRenderedRef.current) {
      onRowsRenderedRef.current({
        startIndex: 0,
        stopIndex,
      });
    }
  }, [stopIndex]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      cache.clearAll();
    });
    return () => {
      window.removeEventListener("resize", () => {
        cache.clearAll();
      });
    };
  }, [cache]);

  return (
    <>
      <div className="filters-wrapper">
        <button
          onClick={() => {
            handleFilterButtonClick(null);
          }}
          className={`filter-button ${!category ? "active-category" : ""}`}
        >
          All
        </button>

        {productCategories.map((productCategory) => (
          <button
            key={productCategory.name}
            onClick={() => {
              handleFilterButtonClick(productCategory.slug);
            }}
            className={`filter-button ${
              productCategory.slug === category ? "active-category" : ""
            }`}
          >
            {productCategory.name}
          </button>
        ))}

        <select
          className="sort-select"
          onChange={handleSorting}
          defaultValue={undefined}
        >
          <option value="null">Sort Products</option>
          <option value={NAME_ASC}>Name A-Z</option>
          <option value={NAME_DESC}>Name Z-A</option>
          <option value={PRICE_ASC}>Price Low-High</option>
          <option value={PRICE_DESC}>Price High-Low</option>
          <option value={RATING_ASC}>Rating Low-High</option>
          <option value={RATING_DESC}>Rating High-Low</option>
        </select>
      </div>

      <div>
        <WindowScroller>
          {({ height, scrollTop }) => {
            const width = document.documentElement.clientWidth;
            return (
              <InfiniteLoader
                isRowLoaded={isRowLoaded}
                loadMoreRows={loadMoreRows}
                rowCount={
                  Math.ceil(list.length / calculateColumnCount(width)) + 1
                }
                threshold={1}
                ref={infiniteLoaderRef}
              >
                {({ onRowsRendered, registerChild }) => {
                  console.log("width ", width);
                  onRowsRenderedRef.current = onRowsRendered;
                  const columnCount = calculateColumnCount(width);
                  const rowCount = Math.ceil(list.length / columnCount) + 1;

                  return (
                    <Grid
                      autoHeight
                      scrollTop={scrollTop}
                      width={width}
                      height={height}
                      ref={(grid) => {
                        gridRef.current = grid;
                        registerChild(grid);
                      }}
                      columnWidth={width / columnCount}
                      columnCount={columnCount}
                      rowCount={rowCount}
                      rowHeight={cache.rowHeight}
                      cellRenderer={cellRenderer}
                      onSectionRendered={onSectionRendered}
                    />
                  );
                }}
              </InfiniteLoader>
            );
          }}
        </WindowScroller>
      </div>
    </>
  );
};

export default ProductsGrid;
