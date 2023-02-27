interface TitleTextProps {
  addTitle: string;
  modifyTitle: string;
  detailTitle: string;
  isAddPage: boolean;
  isModifyPage: boolean;
}

export default function AddDetailModifyTitle(props: TitleTextProps) {
  return (
    <div>
      {props.isAddPage ? (
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          {props.addTitle}
        </h1>
      ) : props.isModifyPage ? (
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          {props.modifyTitle}
        </h1>
      ) : (
        <h1 className="p-component p-text-secondary text-5xl text-center text-900 color: var(--surface-800);">
          {props.detailTitle}
        </h1>
      )}
    </div>
  );
}
