export const calculateScrollBarWidth = () => {
  // Create a div element
  const virtualDiv = document.createElement("div");

  // Set the style to simulate a scrollbar
  //   virtualDiv.style.width = "100px";
  //   virtualDiv.style.height = "100px";
  virtualDiv.style.overflow = "scroll";
  //   virtualDiv.style.position = "absolute";
  //   virtualDiv.style.visibility = "hidden";
  //   virtualDiv.style.top = "-9999px"; // Hide the div off-screen

  // Append the div to the body
  document.body.appendChild(virtualDiv);
  console.log("offsetWidth", virtualDiv.offsetWidth);
  console.log("clientWidth", virtualDiv.clientWidth);
  console.log("scrollWidth", virtualDiv.scrollWidth);

  // Calculate the scrollbar width
  const scrollBarWidth = virtualDiv.offsetWidth - virtualDiv.clientWidth;

  // Remove the div from the DOM
  //   document.body.removeChild(virtualDiv);

  // Log and return the scrollbar width
  console.log(scrollBarWidth);
  return scrollBarWidth;
};

// export const sortArrayOfObject = ({ arrOfObjects, sortBy, order }) => {
//   return arrOfObjects.sort((a, b) =>
//     a[sortBy] > b[sortBy]
//       ? order === "asc"
//         ? 1
//         : -1
//       : b[sortBy] > a[sortBy]
//       ? order === "asc"
//         ? -1
//         : 1
//       : 0
//   );
// };

export const sortArrayOfObject = ({ arrOfObjects, sortBy, order }) => {
  return arrOfObjects.sort((a, b) => {
    const comparison =
      a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0;
    return order === "asc" ? comparison : -comparison;
  });
};
