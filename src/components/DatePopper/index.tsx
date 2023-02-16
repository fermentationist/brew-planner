import CustomPopper from "../CustomPopper";

const DatePopper = ({ date }: { date: Date }) => {
  const dateString = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  return (
    <CustomPopper
      buttonText={dateString}
      placement="bottom"
      tooltip={date.toString()}
    >
      {date.toString()}
    </CustomPopper>
  );
};

export default DatePopper;
