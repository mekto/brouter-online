export function km(valueInMeters, n=1) {
  return +(valueInMeters / 1000).toFixed(n) + ' km';
}


export function indexToLetter(index) {
  return String.fromCharCode(65 + index);
}


export default { km, indexToLetter };
