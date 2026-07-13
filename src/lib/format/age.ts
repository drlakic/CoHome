export function getAge(birthdate: string | Date, now: Date = new Date()): number {
  const dob = typeof birthdate === "string" ? new Date(birthdate) : birthdate;
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
