export interface Revision {
  id: string;
  code: string;
  label: string;
  createdAt: number;
}

export interface RevisionState {
  items: Revision[];
  index: number;
}

export type RevisionAction =
  | { type: "commit"; code: string; label: string }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; revision?: Revision };

export const MAX_REVISIONS = 40;

export const EMPTY_REVISIONS: RevisionState = {
  items: [],
  index: -1,
};

export function currentRevision(state: RevisionState): Revision | null {
  if (state.index < 0) return null;
  return state.items[state.index] || null;
}

export function revisionReducer(state: RevisionState, action: RevisionAction): RevisionState {
  switch (action.type) {
    case "commit": {
      const present = currentRevision(state);
      if (present && present.code === action.code) return state;
      const base = state.items.slice(0, state.index + 1);
      const next: Revision = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        code: action.code,
        label: action.label,
        createdAt: Date.now(),
      };
      const items = [...base, next].slice(-MAX_REVISIONS);
      return { items, index: items.length - 1 };
    }
    case "undo":
      if (state.index <= 0) return state;
      return { ...state, index: state.index - 1 };
    case "redo":
      if (state.index >= state.items.length - 1) return state;
      return { ...state, index: state.index + 1 };
    case "reset":
      if (!action.revision) return EMPTY_REVISIONS;
      return { items: [action.revision], index: 0 };
    default:
      return state;
  }
}
