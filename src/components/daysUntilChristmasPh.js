function daysUntilChristmasPH() {
  const christmas = new Date(
    `December 24, 
     ${
       new Date().getMonth() === 11 && new Date().getDate() > 25
         ? new Date().getFullYear() + 1
         : new Date().getFullYear()
     } 
     23:59:59`
  );

  const now = new Date();
  const christmasDay = new Date(now.getFullYear(), 11, 25);

  if (now > christmasDay) {
    return 0; // Christmas has already passed
  }

  if (now.toDateString() === christmasDay.toDateString()) {
    return "Merry Christmas! 🎄🎁🥳";
  }

  // Calculate the difference in milliseconds
  const diffInMilliseconds = christmas - now;

  // Calculate days in milliseconds
  const daysInMilliseconds = 1000 * 60 * 60 * 24;

  // Calculate days as an integer
  const days = Math.floor(diffInMilliseconds / daysInMilliseconds);

  // Calculate remaining milliseconds for hours, minutes, and seconds
  const remainingMilliseconds = diffInMilliseconds % daysInMilliseconds;

  // Calculate hours in milliseconds
  const hoursInMilliseconds = 1000 * 60 * 60;

  // Calculate hours as an integer
  const hours = Math.floor(remainingMilliseconds / hoursInMilliseconds);

  // Calculate remaining milliseconds for minutes
  const remainingMillisecondsAfterHours =
    remainingMilliseconds % hoursInMilliseconds;

  // Calculate minutes in milliseconds
  const minutesInMilliseconds = 1000 * 60;

  // Calculate minutes as an integer
  const minutes = Math.floor(
    remainingMillisecondsAfterHours / minutesInMilliseconds
  );

  // Calculate remaining milliseconds for seconds
  const seconds = Math.floor(
    (remainingMillisecondsAfterHours % minutesInMilliseconds) / 1000
  );

  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds 🎅`;
}

export default daysUntilChristmasPH;
