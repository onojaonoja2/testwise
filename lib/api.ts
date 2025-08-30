type RegisterData = {
  name: string
  email: string
  password: string
}

type TestData = {
  title: string
  description?: string
  duration: number
  type: string
  startDate: string
  endDate: string
}

export async function registerUser(data: RegisterData) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to register')
  }

  return response.json()
}

export async function createTest(data: TestData) {
  const response = await fetch('/api/tests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create test')
  }

  return response.json()
}

export async function getTests() {
  const response = await fetch('/api/tests')

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch tests')
  }

  return response.json()
}

export async function getTest(testId: string) {
  const response = await fetch(`/api/tests/${testId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to fetch test')
  }

  return response.json()
}

export async function updateTest(testId: string, data: TestData) {
  const response = await fetch(`/api/tests/${testId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update test')
  }

  return response.json()
}

export async function deleteTest(testId: string) {
  const response = await fetch(`/api/tests/${testId}`, {
    method: 'DELETE'
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete test')
  }

  return response.json()
}