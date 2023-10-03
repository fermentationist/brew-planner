import type { ReducerAction } from "../../types/index.d.ts";

const globalReducer = (state: any, action: ReducerAction) => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "dark" ? "light" : "dark",
      }
    case "OPEN_MENU":
      return {
        ...state,
        menu: {
          ...state.menu,
          isOpen: true,
        }
      }
    case "CLOSE_MENU":
      return {
        ...state,
        menu: {
          ...state.menu,
          isOpen: false,
        }
      }
    case "SET_MENU_COLLAPSED_STATE":
      return {
        ...state,
        menu: {
          ...state.menu,
          collapsedState: action.payload,
        }
      }
    case "TOGGLE_SAFE_MODE":
      return {
        ...state,
        safeMode: !state.safeMode,
      }

    case "SET_PREFERRED_UNIT":
      {
        let newState;
        const { field, unit, preferredUnitKey } = action.payload;
        if (preferredUnitKey) {
          newState = {
            ...state,
            preferredUnits: {
              ...(state.preferredUnits || {}),
              [preferredUnitKey]: {
                ...(state.preferredUnits?.[preferredUnitKey] || {}),
                [field]: unit,
              },
            },
          };
        } else {
          newState = {
            ...state,
            preferredUnits: {
              ...(state.preferredUnits || {}),
              [field]: unit,
            },
          };
        }
        return newState;
      }
    case "RENAME_TEMP_PREFERRED_UNITS":
      {
        const newState = {
          ...state,
          preferredUnits: {
            ...(state.preferredUnits || {}),
          }
        };
        console.log("RENAME_TEMP_PREFERRED_UNITS called");
        if (action.payload) {
          newState.preferredUnits[action.payload] = state.preferredUnits?.temp;
        }
        newState.preferredUnits.temp && delete newState.preferredUnits.temp;
        return newState;
      }
    default:
      return state;

    }

}

export default globalReducer;