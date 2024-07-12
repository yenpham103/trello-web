import axios from "axios";
const API_ROOT = import.meta.env.VITE_API_ROOT;
//Không đưa vào try...catch vì sau đó sẽ catch lỗi tập trung tại một nơi bằng cách tận dụng một thứ cực kỳ mạnh mẽ trong axios đó là Interceptors.
//Hiểu đơn giản Interceptors là cách mà chúng ta sẽ đánh chặn vào giữa request hoặc response để xử lý logic mà chúng ta muốn.

//Board
export const fetchBoardDetailsApi = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);

  //axios trả về kết quả về qua property là data
  return response.data;
};
export const updateBoardDetailsApi = async (boardId, updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/boards/${boardId}`,
    updateData
  );
  //axios trả về kết quả về qua property là data
  return response.data;
};

export const moveCardDifferentColumnAPI = async (updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/boards/supports/moving_card`,
    updateData
  );
  //axios trả về kết quả về qua property là data
  return response.data;
};

//Column
export const createNewColumnAPI = async (newColumnData) => {
  const response = await axios.post(`${API_ROOT}/v1/columns`, newColumnData);
  return response.data;
};
export const updateColumnDetailsAPI = async (columnId, updateData) => {
  const response = await axios.put(
    `${API_ROOT}/v1/columns/${columnId}`,
    updateData
  );
  return response.data;
};
export const deleteColumnDetailsAPI = async (columnId) => {
  const response = await axios.delete(`${API_ROOT}/v1/columns/${columnId}`);
  return response.data;
};
//Card
export const createNewCardAPI = async (newCardData) => {
  const response = await axios.post(`${API_ROOT}/v1/cards`, newCardData);
  return response.data;
};
