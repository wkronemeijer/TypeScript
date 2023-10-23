export function Date_format(date: Date) {
    const year   = date.getFullYear().toString().padStart(4, '0');
    const month  = (date.getMonth() + 1).toString().padStart(2, '0');
    const day    = date.getDate().toString().padStart(2, '0');
    const hour   = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    // Holy sh*t JS date is bad
    return `${year}-${month}-${day}T${hour}:${minute}`;
}
