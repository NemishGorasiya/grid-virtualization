import axios from "axios";

export const httpRequest = async ({
  url,
  method = "GET",
  queryParams = {},
  headers = {},
  data = {},
  abortController = null,
  returnEntireResponseWithStatusCode = false,
}) => {
  try {
    const config = {
      method,
      url,
      params: queryParams,
      headers,
      data,
      ...(abortController && { signal: abortController.signal }),
    };
    const res = await axios(config);
    if (returnEntireResponseWithStatusCode) {
      return res;
    } else {
      return res.data;
    }
  } catch (error) {
    if (axios.isCancel(error)) {
      console.error("Request canceled", error.message);
    } else {
      console.error("Error fetching data", error);
    }
    throw error;
  }
};
