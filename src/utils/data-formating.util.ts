import validator from "validator";
import { v4 as uuidv4 } from 'uuid';

/**
 * Formats a number with a specific number of digits.
 *
 * @param {number | string } n - The number to format.
 * @param {number} digits - The number of digits to display after the decimal point. Default is 2.
 * @return {string} The formatted number.
 */
const num_format = (n: number | string, digits: number = 2): string => {
    const number_formatter = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });

    const number = typeof n === "string" ? parseFloat(n) : n;

    return number_formatter.format(number);
};

/**
 * Formats a phone number by removing non-numeric characters and adding a country code if necessary.
 *
 * @param {string} number - The phone number to format.
 * @param {string} [countryCode="+233"] - The country code to prepend to the formatted number.
 * @return {string} The formatted phone number.
 */
const format_phone_number = (number: string, countryCode: string = "+233"): string => {
    if (!number || validator.isEmpty(number)) {
        return '';
    }

    let formatted = '';
    let numeric = number.replace(/\D/g, '');

    if (numeric.length === 9) {
        numeric = `0${numeric}`;
    }

    if (numeric.startsWith('0')) {
        const formattedNumber = numeric.substring(1);
        formatted = `${countryCode}${formattedNumber}`; // '0541234567' => +233541234567
    } else {
        formatted = numeric;
    }

    if (formatted.length === 12 && !formatted.startsWith('+')) {
        formatted = `+${formatted}`;
    }

    if (formatted.length === 13) {
        formatted = `${formatted.substring(0, 4)} ${formatted.substring(4, 6)} ${formatted.substring(6, 9)} ${formatted.substring(9)}`;
    }

    return formatted;
}

/**
 * Format a UTC date string to a formatted date string.
 *
 * @param {string} iso_date_string - The ISO date string to be formatted.
 * @return {string} The formatted date string.
 */
const format_date = (iso_date_string: string): string => {
    const date = new Date(iso_date_string);
    const day = `${date.getDate()}`.length === 1 ? `0${date.getDate()}` : date.getDate();
    const month = `${date.getMonth() + 1}`.length === 1 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
}

/**
 * Calculates the time elapsed between the given date string and the current date.
 *
 * @param {string} dateString - The ISO date string to calculate the time elapsed from.
 * @return {string} The time elapsed in the format "X days/hours/minutes/seconds ago".
 */
const get_time_elapsed = (dateString: string): string => {
    const firstDate = new Date(dateString);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - firstDate.getTime();

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
}

/**
 * Parses the given value and returns a floating-point number representation.
 *
 * @param {string} value - The value to be parsed.
 * @return {any} - The parsed floating-point number.
 */
const parse_amount = (value: string): number | null => {
    let cleanedValue = value.trim().replace(/,/g, '');

    if (cleanedValue.includes('(') || cleanedValue.includes(')')) {
        cleanedValue = `-${cleanedValue.replace(/\(/g, '').replace(/\)/g, '')}`;
    }

    const val = parseFloat(cleanedValue);

    return isNaN(val) ? null : val;
};

/**
 * Parses a date string into a JavaScript Date object.
 *
 * @param {string} value - The date string to be parsed.
 * @param {string} dateFormat - The format of the date string (e.g. 'dd/mm/yyyy').
 * @return {Date | null} - The parsed date as a Date object, or null if the input is invalid.
 */
const parse_date = (value: string, dateFormat: string): Date | null => {

    const valueStr = value.trim();

    if (valueStr === '') {
        return null;
    }

    const parts = valueStr.split('/');

    if (parts.length !== 3) {
        return null;
    }

    const obj = {
        dd: dateFormat === 'dd/mm/yyyy' ? parts[0] : parts[1],
        mm: dateFormat === 'dd/mm/yyyy' ? parts[1] : parts[0],
        yyyy: parts[2].length === 4 ? parts[2] : `20${parts[2]}`,
    }

    const year = Number(obj.yyyy);
    const month = Number(obj.mm) - 1;
    const day = Number(obj.dd);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
    }

    return new Date(year, month, day);
};


/**
 * Calculates the difference in days between two given dates.
 *
 * @param {Date} date1 - The first date.
 * @param {Date} date2 - The second date.
 * @return {number} The difference in days between the two dates.
 */
const compute_date_diff_in_days = (date1: Date, date2: Date): number => {
    const differenceInMilliseconds = date1.getTime() - date2.getTime();
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const differenceInDays = differenceInMilliseconds / millisecondsInADay;
    return Math.round(differenceInDays);
}

/**
 * Sorts an array of objects by a specified index.
 *
 * @param {K} index - The index to sort the array by.
 * @param {T[]} list - The array to be sorted.
 * @returns {T[]} - The sorted array.
 */
function sort_array_by<T, K extends keyof T>(index: K, list: T[]): T[] {
    return list.sort((a, b) => {
        const _a = a[index];
        const _b = b[index];
        if (_a < _b) return -1;
        if (_a > _b) return 1;
        return 0;
    });
}

/**
 * Finds the index of the smallest element in a list based on a given key.
 *
 * @param {K} index - The key to compare elements by.
 * @param {T[]} list - The list of elements to search through.
 * @return {number} - The index of the smallest element.
 */
function find_index_of_smallest<T, K extends keyof T>(index: K, list: T[]): number {
    return list.reduce((minIndex, current, currentIndex, arr) => {
        if (current[index] < arr[minIndex][index]) {
            return currentIndex;
        } else {
            return minIndex;
        }
    }, 0);
}

/**
 * Checks if two sets are equal.
 *
 * @param {Set<any>} set1 - The first set.
 * @param {Set<any>} set2 - The second set.
 * @return {boolean} Returns true if the sets are equal, false otherwise.
 */
const are_sets_equal = (set1: Set<any>, set2: Set<any>): boolean => {

    if (set1.size !== set2.size) {
        return false;
    }

    for (const item of set1) {
        if (!set2.has(item)) {
            return false;
        }
    }

    return true;
}

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const get_month_name = (month: string) => {
    const monthNumber = Number(month);
    return monthNames[monthNumber - 1];
};

const get_month_number = (month: string) => {
    return monthNames.indexOf(month) + 1;
};

const is_valide_date = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime())
}

const generate_unique_id = (
    tab: string[] = []
) => {

    let base = '';

    for (let str of tab) {
        str = str.trim().toLowerCase().replace(/[^a-z]+/g, '');
        base += (base.length > 0 ? '-' : '') + str;
    }

    const uuid = uuidv4().split('-').shift();
    return base + '-' + uuid;
}


const normalize_string = (input: string | null): string | null => {

    if (!input) {
        return null;
    }

    const trimmed = input.trim();
    const singleSpaced = trimmed.replace(/\s+/g, ' ');
    const lowercased = singleSpaced.toLowerCase();
    const normalized = lowercased.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return normalized;
}

export {
    parse_date,
    num_format,
    format_date,
    parse_amount,
    sort_array_by,
    is_valide_date,
    are_sets_equal,
    get_month_name,
    get_month_number,
    generate_unique_id,
    format_phone_number,
    find_index_of_smallest,
    compute_date_diff_in_days,
    get_time_elapsed,
    normalize_string,
}