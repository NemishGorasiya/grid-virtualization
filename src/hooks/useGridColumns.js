import { useState, useEffect } from "react";

const getColumns = () => {
  if (window.matchMedia("(min-width: 1200px)").matches) {
    return 10;
  } else if (window.matchMedia("(min-width: 1100px)").matches) {
    return 9;
  } else if (window.matchMedia("(min-width: 1000px)").matches) {
    return 8;
  } else if (window.matchMedia("(min-width: 900px)").matches) {
    return 7;
  } else if (window.matchMedia("(min-width: 800px)").matches) {
    return 6;
  } else if (window.matchMedia("(min-width: 700px)").matches) {
    return 5;
  } else if (window.matchMedia("(min-width: 600px)").matches) {
    return 4;
  } else if (window.matchMedia("(min-width: 500px)").matches) {
    return 3;
  } else if (window.matchMedia("(min-width: 400px)").matches) {
    return 2;
  } else {
    return 1;
  }
};

const useGridColumns = () => {
  const [columns, setColumns] = useState(getColumns);

  useEffect(() => {
    const updateColumns = () => setColumns(getColumns());

    const mediaQueryLists = [
      window.matchMedia("(min-width: 1200px)"),
      window.matchMedia("(min-width: 1100px)"),
      window.matchMedia("(min-width: 1000px)"),
      window.matchMedia("(min-width: 900px)"),
      window.matchMedia("(min-width: 800px)"),
      window.matchMedia("(min-width: 700px)"),
      window.matchMedia("(min-width: 600px)"),
      window.matchMedia("(min-width: 500px)"),
      window.matchMedia("(min-width: 400px)"),
    ];

    mediaQueryLists.forEach((mql) =>
      mql.addEventListener("change", updateColumns)
    );

    return () => {
      mediaQueryLists.forEach((mql) =>
        mql.removeEventListener("change", updateColumns)
      );
    };
  }, []);

  return columns;
};

export default useGridColumns;
