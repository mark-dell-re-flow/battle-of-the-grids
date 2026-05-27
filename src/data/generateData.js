const FIRST_NAMES = [
  'Alice','Bob','Carol','David','Eve','Frank','Grace','Hank','Ivy','Jack',
  'Karen','Liam','Mia','Noah','Olivia','Paul','Quinn','Rosa','Sam','Tara',
  'Uma','Victor','Wendy','Xander','Yara','Zoe','Aaron','Beth','Chris','Diana',
]
const LAST_NAMES = [
  'Smith','Jones','Williams','Brown','Taylor','Davies','Evans','Wilson','Thomas','Roberts',
  'Johnson','White','Martin','Anderson','Thompson','Garcia','Martinez','Robinson','Clark','Lewis',
]
const DEPARTMENTS = ['Engineering','Sales','Marketing','Finance','HR','Operations','Legal','Design','Product','Support']
const COUNTRIES = ['United States','United Kingdom','Germany','France','Canada','Australia','Japan','India','Brazil','Netherlands']
const STATUSES = ['Active','On Leave','Remote','Contractor']
const PERFORMANCE = ['Exceeds Expectations','Meets Expectations','Needs Improvement','Outstanding']

function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)]
}

function randomDate(rand, startYear = 2000, endYear = 2024) {
  const year = startYear + Math.floor(rand() * (endYear - startYear))
  const month = String(Math.floor(rand() * 12) + 1).padStart(2, '0')
  const day = String(Math.floor(rand() * 28) + 1).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateEmployees(count = 100_000) {
  const rand = seededRandom(42)
  const rows = []
  for (let i = 1; i <= count; i++) {
    rows.push({
      id: i,
      name: `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`,
      department: pick(DEPARTMENTS, rand),
      country: pick(COUNTRIES, rand),
      salary: Math.round(30_000 + rand() * 170_000),
      startDate: randomDate(rand),
      performance: pick(PERFORMANCE, rand),
      status: pick(STATUSES, rand),
      yearsExperience: Math.floor(rand() * 30),
      age: Math.floor(22 + rand() * 43),
    })
  }
  return rows
}
