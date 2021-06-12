import {format} from 'date-fns';
import dayjs from "dayjs"

export const getMonthName = (month: number) => {
  switch (month) {
    case 1:
      return 'JAN';
    case 2:
      return 'FEB';
    case 3:
      return 'MAR';
    case 4:
      return 'APR';
    case 5:
      return 'MAY';
    case 6:
      return 'JUN';
    case 7:
      return 'JUL';
    case 8:
      return 'AUG';
    case 9:
      return 'SEP';
    case 10:
      return 'OCT';
    case 11:
      return 'NOV';
    case 12:
      return 'DEC';
    default:
      return '';
  }
};

export const groupByDate = (data: Record<string, any>[], dateField: string) => {
  const groups = data.reduce((_groups, item) => {
    const dateString = format(item[dateField], 'dd/MM/yyyy');
    if (!_groups[dateString]) {
      _groups[dateString] = [];
    }
    _groups[dateString].push(item);
    return _groups;
  }, {});

  return Object.keys(groups).map((date) => {
    return {
      date: groups[date][0][dateField],
      items: groups[date],
    };
  });
};

export const getDeltaTimestamps = (): number[] => {
  const utcCurrentTime = dayjs()
  const t24 = utcCurrentTime.subtract(1, 'day').startOf('minute').unix()
  const t48 = utcCurrentTime.subtract(2, 'day').startOf('minute').unix()
  const tWeek = utcCurrentTime.subtract(1, 'week').startOf('minute').unix()

  const yesterday = utcCurrentTime.subtract(0, 'day').startOf('day').unix()

  return [t24, t48, tWeek, yesterday]
}
