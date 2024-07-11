import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import AddToDriveIcon from "@mui/icons-material/AddToDrive";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import { Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { capitalizeFirstLetter } from "~/utils/formatters";
const MENU_STYLES = {
  color: "white",
  bgcolor: "transparent",
  border: "none",
  paddingX: "5px",
  borderRadius: "4px",
  ".MuiSvgIcon-root": {
    color: "white",
  },
  "&:hover": {
    bgcolor: "primary.50",
  },
};
function BoardBar({ board }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        overflowX: "auto",
        paddingX: 2,
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "#34495e" : "#9C446E",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label={board?.title}
          onClick={() => {}}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          onClick={() => {}}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label="Add to Google Drive"
          onClick={() => {}}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<ElectricBoltIcon />}
          label="Automation"
          onClick={() => {}}
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label="Filters"
          onClick={() => {}}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          sx={{
            color: "white",
            borderColor: "white",
            "&:hover": { borderColor: "white" },
            borderRadius: "4px",
          }}
          variant="outlined"
          startIcon={<PersonAddIcon />}
        >
          Invite
        </Button>
        <AvatarGroup
          max={4}
          sx={{
            gap: "10px",
            "& .MuiAvatar-root": {
              width: "34px",
              height: "34px",
              fontSize: "16px",
              border: "none",
              color: "white",
              cursor: "pointer",
              "&:first-of-type": {
                bgcolor: "#a4b0be",
              },
            },
          }}
        >
          <Tooltip title="Fullstack">
            <Avatar
              alt="Fullstack"
              src="https://ttol.vietnamnetjsc.vn/images/2023/10/12/19/37/img7293-1107.jpg"
            />
          </Tooltip>
          <Tooltip title="Fullstack">
            <Avatar
              alt="Fullstack"
              src="https://kenh14cdn.com/thumb_w/660/203336854389633024/2023/9/17/img0694-16949356877272124480943.jpg"
            />
          </Tooltip>
          <Tooltip title="Fullstack">
            <Avatar
              alt="Fullstack"
              src="https://image.tienphong.vn/w1000/Uploaded/2024/lce-ljvqj/2024_01_23/han-so-hee3-7389.jpg"
            />
          </Tooltip>
          <Tooltip title="Fullstack">
            <Avatar
              alt="Fullstack"
              src="https://ttol.vietnamnetjsc.vn/images/2023/10/12/19/37/img7293-1107.jpg"
            />
          </Tooltip>
          <Tooltip title="Fullstack">
            <Avatar
              alt="Fullstack"
              src="https://image.tienphong.vn/w1000/Uploaded/2024/lce-ljvqj/2024_01_23/han-so-hee3-7389.jpg"
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  );
}

export default BoardBar;
