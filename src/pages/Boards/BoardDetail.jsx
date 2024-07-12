// Board detail
import { Box, Container } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { mockData } from "~/apis/mock-data";
import { useEffect, useState } from "react";
import { mapOrder } from "~/utils/sorts";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";

import {
  fetchBoardDetailsApi,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardDetailsApi,
  updateColumnDetailsAPI,
  moveCardDifferentColumnAPI,
  deleteColumnDetailsAPI,
} from "~/apis";
import { generatePlaceholderCard } from "~/utils/formatters";
import { create, isEmpty } from "lodash";
import Loading from "~/components/Loading";
function BoardDetail() {
  const [board, setBoard] = useState(null);

  useEffect(() => {
    //Tạm thời fix cứng id
    const boardId = "668c0269a568a875bf14fb82";
    fetchBoardDetailsApi(boardId).then((board) => {
      //Sắp xếp thứ tự các column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
      board.columns = mapOrder(board.columns, board.columnOrderIds, "_id");

      //Cần xử lý kéo thả vào một column rỗng
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)];
          column.cardOrderIds = [generatePlaceholderCard(column)._id];
        } else {
          //Sắp xếp thứ tự các cards luôn ở đây trước khi đưa dữ liệu xuống các component con
          column.cards = mapOrder(column.cards, column.cardOrderIds, "_id");
        }
      });

      setBoard(board);
    });
    //call api
  }, []);

  //Column
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });

    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];

    //Cập nhật lại state
    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
  };
  //Card
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });
    //Cập nhật lại state
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    );
    if (columnToUpdate) {
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    setBoard(newBoard);
  };

  const moveColumns = (dndOrderedColumns) => {
    //Cập nhật dữ kiệu cho chuẩn state board
    const dndOrderedColumnIds = dndOrderedColumns.map((column) => column._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumnIds;
    newBoard.columnOrderIds = dndOrderedColumnIds;
    setBoard(newBoard);
    // call api
    updateBoardDetailsApi(newBoard._id, {
      columnOrderIds: dndOrderedColumnIds,
    });
  };

  const moveCardInTheSameColumn = (
    dndOrderedCards,
    dndOrderedCardIds,
    columnId
  ) => {
    //Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderedCards;
      columnToUpdate.cardOrderIds = dndOrderedCardIds;
    }
    setBoard(newBoard);

    //Gọi API update Column
    updateColumnDetailsAPI(columnId, {
      cardOrderIds: dndOrderedCardIds,
    });
  };

  /**
   * Khi di chuyển card sang column khác:
   * B1: Cập nhật mảng cardOrderIds của column ban đầu chứa nó (đơn giản là xoá cái _id của card ra khỏi mảng)
   * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (đơn giản là thêm _id của Card vào mảng)
   * B3: Cập nhật lại trường columnId mới của Card đã kéo
   * => API riêng
   */
  const moveCardDifferentColumn = (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderedColumns
  ) => {
    //Update cho chuẩn dữ liệu state Board
    const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderedColumns;
    newBoard.columnOrderIds = dndOrderedColumnsIds;
    setBoard(newBoard);

    //Call API
    let prevCardOrderIds = dndOrderedColumns.find(
      (c) => c._id === prevColumnId
    )?.cardOrderIds;

    //Xử lý vấn đề khi kéo card cuối cùng ra khỏi column, column rỗng sẽ có placeholder-card, cần xoá nó đi trước khi gửi dữ liệu lên cho phía BE
    if (prevCardOrderIds[0].includes("placeholder-card")) prevCardOrderIds = [];

    moveCardDifferentColumnAPI({
      currentCardId,
      prevColumnId,
      prevCardOrderIds,
      nextColumnId,
      nextCardOrderIds: dndOrderedColumns.find((c) => c._id === nextColumnId)
        ?.cardOrderIds,
    });
  };

  //Xử lý xoá một Column và Cards bên trong nó
  const deleteColumnDetails = (columnId) => {
    //Update cho chuẩn dữ liệu state Board
    const newBoard = { ...board };
    newBoard.columns = newBoard.columns.filter((c) => c._id !== columnId);
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
      (_id) => _id !== columnId
    );
    setBoard(newBoard);

    // Gọi API xử lý phía BE
    deleteColumnDetailsAPI(columnId).then((res) => {
      toast.success(res?.deleteResult);
    });
  };
  if (!board) {
    return <Loading />;
  }
  return (
    <>
      <Container disableGutters maxWidth="false" sx={{ height: "100vh" }}>
        <AppBar />
        <BoardBar board={board} />
        <BoardContent
          board={board}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          moveColumns={moveColumns}
          moveCardInTheSameColumn={moveCardInTheSameColumn}
          moveCardDifferentColumn={moveCardDifferentColumn}
          deleteColumnDetails={deleteColumnDetails}
        />
      </Container>
    </>
  );
}

export default BoardDetail;
