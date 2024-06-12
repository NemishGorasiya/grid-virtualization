import { useEffect, useRef, useState } from "react";
import {
	AutoSizer,
	ColumnSizer,
	Grid,
	InfiniteLoader,
} from "react-virtualized";
import { httpRequest } from "../services/service";
import "react-virtualized/styles.css";
import ProductCard from "./ProductCard";

const ProductsGrid = () => {
	const [products, setProducts] = useState({
		list: [],
		isLoading: false,
	});
	const { list, isLoading } = products;
	const onRowsRenderedRef = useRef(null);
	const columnCount = 6;
	const rowCount = list.length ? Math.ceil(list.length / columnCount) + 1 : 1;
	// const rowCount = list.length ? Math.ceil(list.length / columnCount) : 1;

	const isRowLoaded = ({ index }) => {
		const start = index * columnCount;
		const end = start + columnCount;
		for (let i = start; i < end; i++) {
			if (!list[i]) {
				console.log("isRowLoaded", index, false);
				return false;
			}
		}
		console.log("isRowLoaded", index, true);
		return true;
	};

	const getProducts = async ({ abortController, queryParams = {} } = {}) => {
		try {
			setProducts((prevProducts) => ({
				...prevProducts,
				isLoading: true,
			}));
			const res = await httpRequest({
				url: "https://dummyjson.com/products",
				queryParams: { limit: 5, ...queryParams },
				abortController,
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
		console.log("load more rows", startIndex, stopIndex);
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
			queryParams: {
				skip,
			},
		});
	};

	const onSectionRendered = ({ rowStartIndex, rowStopIndex }) => {
		console.log("in section", rowStartIndex, rowStopIndex);
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
			<div key={key} style={style}>
				Hello {rowIndex * columnCount + columnIndex}
				<ProductCard product={product} />
			</div>
		);
	};

	console.log("list", list);

	useEffect(() => {
		const abortController = new AbortController();
		getProducts({ abortController });
		return () => {
			abortController.abort();
		};
	}, []);

	if (list.length === 0) {
		return <div>Loading...</div>;
	}

	return (
		<div style={{ height: "100vh" }}>
			<InfiniteLoader
				isRowLoaded={isRowLoaded}
				loadMoreRows={loadMoreRows}
				rowCount={rowCount}
				threshold={1}
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
	);
};

export default ProductsGrid;
