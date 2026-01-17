const date = '2026-05-20';
const time = '14:00';
const combined = `${date}T${time}`;
const d = new Date(combined);
console.log(`Parsing "${combined}":`, d.toString(), 'Current Time:', d.getTime());
console.log('Is NaN?', isNaN(d.getTime()));
