export const getFormattedDate = (timestamp, format) => {
  const date = new Date(timestamp);
  const dateYear = date.getFullYear();
  const dateMonth = `${("0" + (date.getMonth() + 1)).slice(-2)}`;
  const dateDay = `${("0" + date.getDate()).slice(-2)}`;

  return format
    .replace("YYYY", dateYear)
    .replace("MM", dateMonth)
    .replace("DD", dateDay);
};

export const getTimestampDate = (dateString, dateFormat) => {
  const separator = dateFormat.match(/[\W_]/);
  if (separator) {
    const splitter = separator[0];

    let year, month, day;
    const dateParts = dateString.split(splitter);
    dateFormat.split(splitter).forEach((item, idx) => {
      if (item === "YYYY") {
        year = dateParts[idx];
      } else if (item === "MM") {
        month = dateParts[idx];
      } else {
        day = dateParts[idx];
      }
    });

    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
    ).getTime();
  }
  return new Date().getTime();
};
