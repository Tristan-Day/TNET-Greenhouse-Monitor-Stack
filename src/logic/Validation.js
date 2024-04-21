// Determine if a given string is a valid Postcode
export function isValidPostcode(string)
{
  return string.match(
      /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([AZa-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/gm)
}

// Determine if a given string is a valid UUID
export function isValidIdentifier(string)
{
  return string.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
}

// Determine if a given string is a valid float
export function isValidFloat(string)
{
  return /^(0|[1-9]\d*)(\.\d+)?$/.test(string)
}