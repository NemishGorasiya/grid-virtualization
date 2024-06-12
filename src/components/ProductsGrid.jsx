import { useRef, useState } from "react";
import {
  AutoSizer,
  ColumnSizer,
  Grid,
  InfiniteLoader,
} from "react-virtualized";
import { httpRequest } from "../services/service";

const ProductsGrid = () => {
  const [products, setProducts] = useState({
    list: [],
    isLoading: false,
  });
  const { list, isLoading } = products;
  const onRowsRenderedRef = useRef(null);
  const columnCount = 6;
  const rowCount = list.length ? Math.ceil(list.length / columnCount) + 1 : 1;

  const isRowLoaded = ({ index }) => {
    return !!list[index * columnCount];
  };

  const getProducts = async ({ queryParams = {} } = {}) => {
    try {
      setProducts((prevProducts) => ({
        ...prevProducts,
        isLoading: true,
      }));
      const res = await httpRequest({
        url: "https://dummyjson.com/products",
        queryParams: { limit: 5, ...queryParams },
      });
      if (res) {
        const { products } = res;
        setProducts((prevProducts) => ({
          list: [...prevProducts.list, ...products],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadMoreRows = ({ startIndex, stopIndex }) => {
    getProducts();
    console.log("first");
  };

  const onSectionRendered = ({ rowStartIndex, rowStopIndex }) => {
    onRowsRenderedRef.current({
      startIndex: rowStartIndex,
      stopIndex: rowStopIndex,
    });
  };

  const cellRenderer = ({ key, index, style }) => {
    // parent is remained
    return (
      <div key={key} style={style}>
        Hello {index}
      </div>
    );
  };

  return (
    <div style={{ height: "100vh" }}>
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={loadMoreRows}
        rowCount={rowCount}
        threshold={1}
      >
        {({ onRowsRendered }) => {
          onRowsRenderedRef.current = onRowsRendered;
          return (
            <AutoSizer>
              {({ height, width }) => {
                return (
                  <ColumnSizer>
                    {({ registerChild }) => (
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
                    )}
                  </ColumnSizer>
                );
              }}
            </AutoSizer>
          );
        }}
      </InfiniteLoader>
    </div>
  );
};

export default ProductsGrid;
