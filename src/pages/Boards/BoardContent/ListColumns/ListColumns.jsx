import Box from "@mui/material/Box";
import Column from "./Column/Column";
import Button from "@mui/material/Button";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
export default function ListColumns({
  columns,
  createNewColumn,
  createNewCard,
  deleteColumnDetails,
}) {
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
  const toggleOpenNewColumnForm = () =>
    setOpenNewColumnForm(!openNewColumnForm);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const addNewColumn = () => {
    if (!newColumnTitle) {
      toast.error("Please enter Column Title!");
      return;
    }
    //Tạo dữ liệu Column để gọi API
    const newColumnData = {
      title: newColumnTitle,
    };
    /**
     * Gọi lên props function createNewColumn nằm ở component cha cao nhất (BoardDetail).
     * Có thể sử dụng redux để không phải gọi nhiều cấp.
     */
    //Gọi API create column ở đây
    createNewColumn(newColumnData);

    //Đóng trạng thái thêm Column mới và Clear Input
    toggleOpenNewColumnForm();
    setNewColumnTitle("");
  };

  /*
  - SortTableContext yêu cầu items là 1 mảng dạng ["id-1", "id-2", "id-3"], chứ không phải  [{id: "id-1"}, {id: "id-2"}, {id: "id-3"}]
  - Nếu không đúng thì vẫn kéo thả được những không có animation
  */
  return (
    <SortableContext
      items={columns?.map((column) => column?._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          bgcolor: "inherit",
          width: "100%",
          height: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar-track": { m: 2 },
        }}
      >
        {columns?.map((column) => (
          <Column
            createNewCard={createNewCard}
            deleteColumnDetails={deleteColumnDetails}
            key={column?._id}
            column={column}
          />
        ))}
        {!openNewColumnForm ? (
          <Box
            onClick={toggleOpenNewColumnForm}
            sx={{
              minWidth: "250px",
              maxWidth: "250px",
              mx: 2,
              borderRadius: "6px",
              height: "fit-content",
              bgcolor: "#ffffff3d",
            }}
          >
            <Button
              sx={{
                color: "white",
                width: "100%",
                justifyContent: "flex-start",
                pl: 2.5,
                py: 1,
              }}
              startIcon={<NoteAddIcon />}
            >
              Add new column
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              minWidth: "250px",
              maxWidth: "250px",
              mx: 2,
              p: 1,
              borderRadius: "6px",
              height: "fit-content",
              bgcolor: "#ffffff3d",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <TextField
              label="Enter column title..."
              type="text"
              size="small"
              variant="outlined"
              autoFocus
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                "& label": { color: "white" },
                "& input": { color: "white" },
                "& label.Mui-focused": { color: "white" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "white" },
                  "&:hover fieldset": { borderColor: "white" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
              }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                onClick={addNewColumn}
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  boxShadow: "none",
                  border: "0.5px solid",
                  borderColor: (theme) => theme.palette.primary.main,
                  "&:hover": { bgcolor: (theme) => theme.palette.primary.main },
                }}
              >
                Add Column
              </Button>
              <CloseIcon
                fontSize="small"
                sx={{
                  color: "white",
                  cursor: "pointer",
                  "&:hover": { color: (theme) => theme.palette.warning.light },
                }}
                onClick={toggleOpenNewColumnForm}
              />
            </Box>
          </Box>
        )}
      </Box>
    </SortableContext>
  );
}
