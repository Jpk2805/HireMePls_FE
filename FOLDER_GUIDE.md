# Frontend Folder Structure - Complete Guide

This guide explains what each folder does and how to navigate the React codebase.

## 📂 Folder Map

### `src/`
**Root source directory. All React code goes here.**

### `src/components/`
**Reusable React components. Organized by category.**

```
components/
├── common/              # Generic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Input.tsx
│   └── Loader.tsx
├── layout/              # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MainLayout.tsx
├── forms/               # Form components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── JobForm.tsx
├── jobs/                # Job-specific components
│   ├── JobCard.tsx
│   ├── JobList.tsx
│   ├── JobDetails.tsx
│   └── JobStatus.tsx
└── README.md
```

**Rules**:
- One component per file
- Components are DUMB (accept props, return JSX)
- No API calls in components (use hooks)
- Keep components small and reusable

### `src/pages/`
**Page components. Usually tied to routes.**

```
pages/
├── auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── LogoutPage.tsx
├── jobs/
│   ├── JobsListPage.tsx       # All jobs
│   ├── JobDetailPage.tsx      # Single job
│   └── CreateJobPage.tsx      # Create job form
├── dashboard/
│   └── DashboardPage.tsx      # Main dashboard
└── NotFoundPage.tsx           # 404 page
```

**Rules**:
- Pages are SMART (fetch data, manage state)
- Pages compose smaller components
- One page per route

### `src/services/`
**API client and HTTP requests.**

```
services/
├── api.ts               # Axios setup, base client
├── auth.service.ts      # Auth API calls
├── job.service.ts       # Job API calls
└── user.service.ts      # User API calls
```

**Pattern**:
```typescript
// auth.service.ts
import { apiClient } from './api'

export const register = (email: string, password: string) => {
  return apiClient.post('/auth/register', { email, password })
}

export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password })
}
```

**Usage in components**:
```typescript
import * as authService from '@/services/auth.service'

const handleLogin = async (email, password) => {
  const { data } = await authService.login(email, password)
  setToken(data.token)
}
```

### `src/hooks/`
**Custom React hooks for logic reuse.**

```
hooks/
├── useAuth.ts           # Authentication logic
├── useJob.ts            # Job-related logic
├── useApi.ts            # Generic API hook
└── usePagination.ts     # Pagination logic
```

**Example**:
```typescript
// useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = async (email, password) => {
    const { data } = await authService.login(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }

  return { user, token, login, logout }
}
```

**Usage**:
```typescript
const { user, login } = useAuth()
```

### `src/context/`
**React Context for global state.**

```
context/
├── AuthContext.tsx      # Authentication state
├── AppContext.tsx       # App-wide state
└── ThemeContext.tsx     # Theme (light/dark mode)
```

**Example**:
```typescript
// AuthContext.tsx
export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Usage in App.tsx
<AuthProvider>
  <App />
</AuthProvider>

// Usage in component
const { user } = useContext(AuthContext)
```

### `src/utils/`
**Helper functions for common operations.**

```
utils/
├── format.ts            # Format dates, numbers
├── validation.ts        # Email, password validation
├── api.ts               # API helper functions
└── storage.ts           # LocalStorage helpers
```

**Examples**:
```typescript
// format.ts
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// validation.ts
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// storage.ts
export const getToken = () => localStorage.getItem('token')
export const setToken = (token: string) => localStorage.setItem('token', token)
```

### `src/types/`
**TypeScript interfaces and types.**

```typescript
// index.ts
export interface User {
  id: string
  email: string
  plan: 'free' | 'premium'
  createdAt: string
}

export interface Job {
  id: string
  userId: string
  type: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  payload: Record<string, any>
  result?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  token: string
  user: User
}
```

### `src/styles/`
**Global styles and theme configuration.**

```
styles/
├── globals.css          # Global styles
├── theme.ts             # Color, spacing, fonts
├── variables.css        # CSS variables
└── tailwind.config.js   # Tailwind config (if using)
```

### `src/App.tsx`
**Root component. Routes go here.**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/jobs" element={<JobsListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

### `public/`
**Static assets: images, icons, fonts**

```
public/
├── images/
├── icons/
├── fonts/
└── favicon.ico
```

---

## 🔀 Request Flow Example

**User logs in:**

```
1. LoginPage component renders LoginForm
   ↓
2. User enters email/password, clicks "Log In"
   ↓
3. LoginForm calls handleSubmit()
   ↓
4. handleSubmit() calls authService.login(email, password)
   ↓
5. authService.login() sends POST /auth/login to API
   ↓
6. Backend returns { token, user }
   ↓
7. Component saves token to localStorage
   ↓
8. Component updates AuthContext
   ↓
9. Other components see logged-in user via useContext(AuthContext)
   ↓
10. App redirects to /jobs page
```

---

## 🎯 Quick Navigation

**"I want to..."**

| Task | File |
|------|------|
| Create new page | `src/pages/` |
| Create reusable component | `src/components/` |
| Make API call | `src/services/` |
| Share state across app | `src/context/` |
| Add custom logic hook | `src/hooks/` |
| Add helper function | `src/utils/` |
| Define types | `src/types/index.ts` |
| Configure routing | `src/App.tsx` |

---

## 📋 File Naming Conventions

| Type | Example | Notes |
|------|---------|-------|
| Component | `JobCard.tsx` | PascalCase |
| Service | `auth.service.ts` | camelCase |
| Hook | `useAuth.ts` | camelCase, starts with "use" |
| Context | `AuthContext.tsx` | PascalCase |
| Utility | `format.ts` | camelCase |
| Type | `index.ts` in types/ | PascalCase interfaces |
| Page | `JobDetailPage.tsx` | PascalCase |

---

## 🚀 Where to Start

### 1. Setup API Client
**File**: `src/services/api.ts`

```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### 2. Create Services
**File**: `src/services/auth.service.ts`

```typescript
import { apiClient } from './api'

export const register = (email: string, password: string) => {
  return apiClient.post('/auth/register', { email, password })
}

export const login = (email: string, password: string) => {
  return apiClient.post('/auth/login', { email, password })
}
```

### 3. Create Context
**File**: `src/context/AuthContext.tsx`

Set up global authentication state.

### 4. Create Pages
**File**: `src/pages/auth/LoginPage.tsx`

Build page components using services and context.

### 5. Create Components
**File**: `src/components/auth/LoginForm.tsx`

Build reusable UI components.

### 6. Setup Routing
**File**: `src/App.tsx`

Connect pages to routes.

---

## 💡 Best Practices

1. **Keep components dumb**: Components display data, don't fetch it.
   ```typescript
   // Good
   <JobCard job={job} onDelete={handleDelete} />
   
   // Bad
   const JobCard = () => {
     const job = await api.getJob() // NO!
   }
   ```

2. **Lift state up**: If multiple components need state, put it in context or parent.

3. **Use hooks for logic**: Custom hooks make code reusable and testable.

4. **API calls in services**: All HTTP requests go through `src/services/`.

5. **Props over global state**: Pass data via props when possible.

6. **Separate concerns**: Components show UI, services call API, utils have helpers.

7. **Type everything**: Use TypeScript interfaces for props and data.

8. **Error handling**: Always catch errors from API calls.
   ```typescript
   try {
     const data = await authService.login(email, password)
   } catch (error) {
     setError(error.message)
   }
   ```

---

## 🗂️ Full Example: Login Feature

**1. Type** (`src/types/index.ts`):
```typescript
export interface User { id: string; email: string }
export interface LoginResponse { token: string; user: User }
```

**2. Service** (`src/services/auth.service.ts`):
```typescript
export const login = (email, password) => {
  return apiClient.post('/auth/login', { email, password })
}
```

**3. Hook** (`src/hooks/useAuth.ts`):
```typescript
export const useAuth = () => {
  const [user, setUser] = useState(null)
  
  const login = async (email, password) => {
    const { data } = await authService.login(email, password)
    setUser(data.user)
    localStorage.setItem('token', data.token)
  }
  
  return { user, login }
}
```

**4. Component** (`src/components/auth/LoginForm.tsx`):
```typescript
export const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  
  const handleSubmit = async () => {
    await login(email, password)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input value={email} onChange={setEmail} />
      <Input type="password" value={password} onChange={setPassword} />
      <Button type="submit">Login</Button>
    </form>
  )
}
```

**5. Page** (`src/pages/auth/LoginPage.tsx`):
```typescript
export const LoginPage = () => {
  return (
    <MainLayout>
      <LoginForm />
    </MainLayout>
  )
}
```

**6. Route** (`src/App.tsx`):
```typescript
<Route path="/login" element={<LoginPage />} />
```

---

## 📚 See Also

- `README.md` - Quick start guide
- `src/components/*/README.md` - Component-specific guides
