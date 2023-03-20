import { Calendar, CalendarChangeEvent } from "primereact/calendar";

interface OneDayCalendarProps {
  disabled?: boolean;
  date: Date;
  setDate: (date: Date) => void;
}

export default function OneDayCalendar(props: OneDayCalendarProps) {
  return (
    <div className="flex">
      <label
        htmlFor="date"
        className="p-component text-teal-900 p-text-secondary my-auto pr-2"
      >
        Date:
      </label>
      {props.disabled ? (
        <p className="p-component p-text-secondary text-900 text-xl text-center my-auto">
          {props.date.toLocaleDateString()}
        </p>
      ) : (
        <Calendar
          id="date"
          disabled={props.disabled ?? false}
          value={props.date}
          readOnlyInput
          onChange={(event: CalendarChangeEvent): void => {
            props.setDate(event.value as Date);
          }}
        />
      )}
    </div>
  );
}
