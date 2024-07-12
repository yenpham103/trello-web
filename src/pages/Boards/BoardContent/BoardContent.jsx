import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "~/utils/sorts";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import {
  DndContext,
  PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
} from "@dnd-kit/core";
import { MouseSensor, TouchSensor } from "~/customLib/DndKitSensors";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";
const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
  CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};
function BoardContent({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardDifferentColumn,
  deleteColumnDetails,
}) {
  // const pointerSensor = useSensor(PointerSensor, {
  //   activationConstraint: { distance: 10 },
  // });

  // Require the mouse to move by 10 pixels before activating
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  });

  // Nhấn giữ khoảng 250ms và dung sai của cảm ứng (di chuyển chênh lệch là 500px) thì mới kích hoạt event
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 500 },
  });

  // Ưu tiên 2 loại sensors là mouse và touch để tối ưu trải nghiệm
  const mySensors = useSensors(mouseSensor, touchSensor);

  const [orderedColumns, setOrderedColumns] = useState([]);
  const [activeDragItemId, setActiveDragItemId] = useState(null);
  const [activeDragItemType, setActiveDragItemType] = useState(null);
  const [activeDragItemData, setActiveDragItemData] = useState(null);
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null);

  //Điểm va chạm cuối cùng (xử lý thuật toán phát hiện vat chạm)
  let lastOverId = useRef(null);

  useEffect(() => {
    //Columns đã được sắp xếp ở component cha cao nhất (boardDetail)
    setOrderedColumns(board.columns);
  }, [board]);

  //Tìm 1 cái column theo cardId
  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) =>
      column?.cards?.map((card) => card._id)?.includes(cardId)
    );
  };

  //Function chung xử lý việc
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData,
    triggerFrom
  ) => {
    setOrderedColumns((prevColumns) => {
      //Tìm vị trí index của overCard trong column đích ( nơi  mà active card sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overCardId
      );

      //Logic tính toán cardIndex mới (trên hoặc dưới overCard), code lấy từ thư viện dnd-kit
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.cards?.length + 1;

      //Clone mảng orderedColumnsState cũ ra 1 cái mới để xử lý data rồi return, cập nhật lại  orderedColumnsState mới
      const nextColumns = cloneDeep(prevColumns);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );

      //nextActiveColumn cũ
      if (nextActiveColumn) {
        // Xóa card ở column active (column cũ) cái lúc mà kéo card ra khỏi nó để sang column khác
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        //Thêm place-holder card
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }
      //Column new
      if (nextOverColumn) {
        //Kiểm tra xem card đang kéo đã tồn tại ở overColumn hay chưa, nếu có thì xóa nó trước
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeDraggingCardId
        );
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id,
        };
        //Add card đang kéo vào over column hay vị trí mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeDraggingCardData
        );
        //Xóa placeHolde card
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard
        );

        //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }

      if (triggerFrom === "handleDragEnd") {
        moveCardDifferentColumn(
          activeDraggingCardId,
          oldColumnDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        );
      }
      return nextColumns;
    });
  };
  //Trigger Khi bắt đầu kéo một phần tử
  const handleDragStart = (e) => {
    setActiveDragItemId(e?.active?.id);
    setActiveDragItemType(
      e?.active?.data?.current?.columnId
        ? ACTIVE_DRAG_ITEM_TYPE.CARD
        : ACTIVE_DRAG_ITEM_TYPE.COLUMN
    );
    setActiveDragItemData(e?.active?.data?.current);

    //Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (e?.active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(e?.active?.id));
    }
  };

  //Trigger trong quá trình kéo một phần tử
  const handleDragOver = (e) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

    //handle kéo card qua các column
    const { active, over } = e;

    //Nếu không tồn tại active và không tồn tại over (kéo ra ngoài phạm vi container) thì không làm gì.
    if (!active || !over) return;

    //activeDraggingCard : Là card đang được kéo
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCardData },
    } = active;

    //overCard : Là card đang tương tác trên hoặc dưới so với card kéo ở trên
    const { id: overCardId } = over;

    //Tìm 2 cái columns theo cardId
    const activeColumn = findColumnByCardId(activeDraggingCardId);
    const overColumn = findColumnByCardId(overCardId);
    if (!activeColumn || !overColumn) return;

    if (activeColumn._id !== overColumn._id) {
      //Xử lý logic ở đây khi kéo card qua các column khác nhau
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        "handleDragOver"
      );
    }
  };

  //Trigger Khi thả một phần tử
  const handleDragEnd = (e) => {
    const { active, over } = e;
    //Nếu không tồn tại active và không tồn tại over (kéo ra ngoài phạm vi container) thì không làm gì.
    if (!active || !over) return;

    //handle keo tha card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCardData },
      } = active;

      //overCard : Là card đang tương tác trên hoặc dưới so với card kéo ở trên
      const { id: overCardId } = over;

      //Tìm 2 cái columns theo cardId
      const activeColumn = findColumnByCardId(activeDraggingCardId);
      const overColumn = findColumnByCardId(overCardId);
      if (!activeColumn || !overColumn) return;

      //Keo tha card giua 2 column khac  nhau
      if (oldColumnDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData,
          "handleDragEnd"
        );
      } else {
        // Lấy vị trí cũ từ oldColumnDraggingCard
        const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex(
          (column) => column._id === activeDragItemId
        );
        //Lấy vị trí mới từ over
        const newCardIndex = overColumn?.cards?.findIndex(
          (column) => column._id === overCardId
        );
        const dndOrderedCards = arrayMove(
          oldColumnDraggingCard?.cards,
          oldCardIndex,
          newCardIndex
        );
        const dndOrderedCardIds = dndOrderedCards.map((card) => card._id);
        setOrderedColumns((prevColumns) => {
          //Clone mảng orderedColumnsState cũ ra 1 cái mới để xử lý data rồi return, cập nhật lại  orderedColumnsState mới
          const nextColumns = cloneDeep(prevColumns);

          //Tìm tới column đang thả
          const targetColumn = nextColumns.find(
            (column) => column._id === overColumn._id
          );
          targetColumn.cards = dndOrderedCards;
          targetColumn.cardOrderIds = dndOrderedCardIds;

          return nextColumns;
        });
        moveCardInTheSameColumn(
          dndOrderedCards,
          dndOrderedCardIds,
          oldColumnDraggingCard._id
        );
      }
    }

    //handle keo tha column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      if (active.id !== over.id) {
        //Lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(
          (column) => column._id === active.id
        );
        //Lấy vị trí mới từ over
        const newColumnIndex = orderedColumns.findIndex(
          (column) => column._id === over.id
        );
        const dndOrderedColumns = arrayMove(
          orderedColumns,
          oldColumnIndex,
          newColumnIndex
        );
        setOrderedColumns(dndOrderedColumns);

        //Call Api
        moveColumns(dndOrderedColumns);
      }
    }

    //Clear state
    setActiveDragItemId(null);
    setActiveDragItemType(null);
    setActiveDragItemData(null);
    setOldColumnDraggingCard(null);
  };
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  //Custom thuật toán phát hiện va chạm
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
        return closestCorners({ ...args });
      }
      const pointerIntersection = pointerWithin(args);

      if (!pointerIntersection?.length) return;

      // const intersections =
      //   pointerIntersection?.length > 0
      //     ? pointerIntersection
      //     : rectIntersection(args);

      let overId = getFirstCollision(pointerIntersection, "id");
      if (overId) {
        const checkColumn = orderedColumns.find(
          (column) => column._id === overId
        );
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                checkColumn?.cardOrderIds?.includes(container.id)
            ),
          })[0]?.id;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeDragItemType, orderedColumns]
  );
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={mySensors}
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#34495e" : "#CD519D",
          width: "100%",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "10px 0",
        }}
      >
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          deleteColumnDetails={deleteColumnDetails}
        />
        <DragOverlay dropAnimation={customDropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
            <Column column={activeDragItemData} />
          )}
          {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
            <Card card={activeDragItemData} />
          )}
        </DragOverlay>
      </Box>
    </DndContext>
  );
}

export default BoardContent;
