/** Phone number reduced to the digits that matter, so '099 123 456' and '+598 99 123 456' match. */
export function phoneKey(phone: string): string {
  let d = phone.replace(/\D/g, '');
  if (d.startsWith('598') && d.length > 9) d = d.slice(3);
  return d.replace(/^0+/, '');
}
