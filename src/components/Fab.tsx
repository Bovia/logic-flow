interface FabProps {
  onClick: () => void;
  label?: string;
}

export function Fab({ onClick, label = "新建" }: FabProps) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      +
    </button>
  );
}
