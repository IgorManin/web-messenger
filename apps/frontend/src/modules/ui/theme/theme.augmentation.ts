import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    interactive: {
      selected: string;
      hover: string;
      focused: string;
      border: string;
      shadow: string;
      shadowFocused: string;
    };
    message: {
      mine: string;
      other: string;
    };
    avatar: {
      background: string;
      color: string;
    };
    status: {
      online: string;
    };
  }

  interface PaletteOptions {
    interactive?: {
      selected?: string;
      hover?: string;
      focused?: string;
      border?: string;
      shadow?: string;
      shadowFocused?: string;
    };
    message?: {
      mine?: string;
      other?: string;
    };
    avatar?: {
      background?: string;
      color?: string;
    };
    status?: {
      online?: string;
    };
  }
}
