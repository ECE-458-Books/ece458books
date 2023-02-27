import { Calendar, CalendarChangeEvent } from "primereact/calendar";

interface OneDayCalendarProps {
  isModifiable: boolean;
  date: Date;
  setDate: (date: Date) => void;
}

export default function OneDayCalendar(props: OneDayCalendarProps) {
  return (
    <div>
      <label
        htmlFor="date"
        className="p-component text-teal-900 p-text-secondary my-auto pr-2"
      >
        Date
      </label>
      <Calendar
        id="date"
        disabled={!props.isModifiable}
        value={props.date}
        readOnlyInput
        onChange={(event: CalendarChangeEvent): void => {
          props.setDate(event.value as Date);
        }}
      />
    </div>
  );
}
