<template>
  <div class="min-h-screen flex bg-white">

    <!-- About the system (large screens) -->
    <section class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-linear-to-br from-emerald-900 via-emerald-700 to-teal-600 text-white">
      <div class="blob w-96 h-96 bg-lime-300/20 -top-24 -left-24" />
      <div class="blob blob-slow w-112 h-112 bg-teal-300/25 -bottom-32 -right-24" />
      <div class="blob blob-delay w-64 h-64 bg-emerald-300/25 top-1/3 right-1/4" />
      <div class="absolute inset-0 dots-light" />

      <div class="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
        <div class="flex items-center gap-3 fade-up">
          <div class="w-11 h-11 rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur flex items-center justify-center">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6" />
          </div>
          <span class="text-xl font-bold tracking-tight">UniCore</span>
        </div>

        <div class="max-w-lg">
          <h1 class="text-4xl xl:text-5xl font-bold leading-tight tracking-tight fade-up" style="animation-delay: 80ms">
            One platform for the whole <span class="text-lime-200">student journey</span>
          </h1>
          <p class="mt-5 text-lg text-emerald-50/90 leading-relaxed fade-up" style="animation-delay: 160ms">
            Admissions, courses, attendance, exams, fees and the library — with the right access for every office on campus.
          </p>

          <!-- Student journey -->
          <ol class="mt-10 flex items-center fade-up" style="animation-delay: 240ms">
            <template v-for="(step, i) in journey" :key="step.label">
              <li class="flex flex-col items-center gap-2 shrink-0">
                <div :class="['w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500',
                  i <= activeStep ? 'bg-white text-emerald-700 shadow-lg shadow-emerald-950/30 scale-110' : 'bg-white/10 text-white/70 ring-1 ring-white/20']">
                  <UIcon :name="step.icon" class="w-5 h-5" />
                </div>
                <span :class="['text-xs font-medium transition-colors duration-500', i <= activeStep ? 'text-white' : 'text-emerald-100/60']">
                  {{ step.label }}
                </span>
              </li>
              <li v-if="i < journey.length - 1" aria-hidden="true" class="flex-1 h-0.5 mx-2 mb-6 bg-white/15 rounded overflow-hidden">
                <div class="h-full bg-lime-200 transition-all duration-500" :style="{ width: i < activeStep ? '100%' : '0%' }" />
              </li>
            </template>
          </ol>

          <ul class="mt-12 grid grid-cols-2 gap-4">
            <li v-for="(f, i) in features" :key="f.title"
              class="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur-sm p-4 fade-up hover:bg-white/15 hover:-translate-y-0.5 transition-all"
              :style="{ animationDelay: `${320 + i * 80}ms` }">
              <span class="inline-flex w-9 h-9 rounded-lg bg-lime-200/15 items-center justify-center">
                <UIcon :name="f.icon" class="w-5 h-5 text-lime-200" />
              </span>
              <p class="mt-3 font-semibold text-sm">{{ f.title }}</p>
              <p class="mt-1 text-xs text-emerald-50/75 leading-relaxed">{{ f.text }}</p>
            </li>
          </ul>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-xs text-emerald-50/80 fade-up" style="animation-delay: 700ms">
          <span>Built with</span>
          <span v-for="t in stack" :key="t" class="px-2.5 py-1 rounded-full bg-white/10 ring-1 ring-white/15">{{ t }}</span>
        </div>
      </div>
    </section>

    <!-- Sign in -->
    <main class="flex-1 relative flex items-center justify-center p-6 sm:p-10 bg-emerald-50/40 overflow-hidden">
      <div class="absolute inset-0 dots-dark" />
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl" />

      <div class="relative w-full max-w-lg fade-up">
        <div class="flex lg:hidden items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <UIcon name="i-heroicons-academic-cap" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-bold text-gray-900 leading-tight">UniCore</p>
            <p class="text-xs text-gray-500">University Management System</p>
          </div>
        </div>

        <div class="rounded-3xl bg-white/90 backdrop-blur p-6 sm:p-10 shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/5">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
            <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5" />
            Secure sign-in
          </span>

          <h2 class="mt-5 text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back to
            <span class="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">UniCore</span>
          </h2>
          <p class="mt-2 text-gray-500">Sign in with your university account.</p>

          <UForm :schema="schema" :state="form" :validate-on="['input', 'change']" class="mt-8 space-y-5" @submit="handleLogin">
            <UFormField label="Email" name="email" :ui="fieldUi">
              <UInput v-model="form.email" type="email" placeholder="you@unicore.edu" icon="i-heroicons-envelope"
                size="xl" autocomplete="username" class="w-full" :ui="inputUi" />
            </UFormField>

            <UFormField label="Password" name="password" :ui="fieldUi">
              <template #hint>
                <NuxtLink to="/forgot-password" class="text-sm font-medium text-emerald-700 hover:underline">Forgot password?</NuxtLink>
              </template>
              <UInput v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password"
                icon="i-heroicons-lock-closed" size="xl" autocomplete="current-password" class="w-full" :ui="inputUi">
                <template #trailing>
                  <UButton color="neutral" variant="link" size="sm" class="text-gray-400 hover:text-emerald-600"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" @click="showPassword = !showPassword" />
                </template>
              </UInput>
            </UFormField>

            <UButton type="submit" block size="xl" :loading="auth.loading"
              class="group rounded-xl py-3.5 font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all">
              Sign in
              <template #trailing>
                <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </template>
            </UButton>
          </UForm>

          <template v-if="demoRoles.length">
            <div class="flex items-center gap-3 my-8">
              <div class="h-px flex-1 bg-gray-200" />
              <span class="text-xs font-medium uppercase tracking-wider text-gray-400">or explore a demo</span>
              <div class="h-px flex-1 bg-gray-200" />
            </div>

            <div class="grid grid-cols-1 min-[440px]:grid-cols-2 gap-3">
              <button v-for="role in demoRoles" :key="role" type="button" :disabled="auth.loading"
                class="group flex items-start gap-3 rounded-xl bg-white p-3 text-left ring-1 ring-gray-200 hover:ring-emerald-400 hover:bg-emerald-50/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-900/5 transition-all disabled:opacity-60 disabled:pointer-events-none"
                @click="handleDemoLogin(role)">
                <span class="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <UIcon :name="roleInfo(role).icon" class="w-5 h-5" />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm font-semibold text-gray-900 capitalize">{{ role.replace('-', ' ') }}</span>
                  <span class="block text-xs text-gray-500 sm:truncate">{{ roleInfo(role).text }}</span>
                </span>
              </button>
            </div>

            <p class="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <UIcon name="i-heroicons-eye" class="w-3.5 h-3.5" />
              Demo sessions are read-only — nothing you do is saved.
            </p>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'blank',
  middleware: 'guest',
})

useHead({ title: 'Login — UniCore' })

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

const fieldUi = { label: 'text-gray-700 font-medium', error: 'text-red-600' }
const inputUi = {
  base: 'rounded-xl bg-gray-50/70 text-gray-900 ring-gray-200 placeholder:text-gray-400 hover:ring-emerald-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all',
  leadingIcon: 'text-emerald-600/70',
}

const journey = [
  { label: 'Admission', icon: 'i-heroicons-inbox-arrow-down' },
  { label: 'Enrollment', icon: 'i-heroicons-pencil-square' },
  { label: 'Classes', icon: 'i-heroicons-calendar' },
  { label: 'Exams', icon: 'i-heroicons-document-text' },
  { label: 'Graduation', icon: 'i-heroicons-academic-cap' },
]

const features = [
  { icon: 'i-heroicons-shield-check', title: 'Role-based access', text: 'Nine roles, each seeing only what their job needs.' },
  { icon: 'i-heroicons-chart-bar', title: 'Grades & CGPA', text: 'Faculty grade their own courses; results publish in one step.' },
  { icon: 'i-heroicons-banknotes', title: 'Fees & payments', text: 'Invoices, partial payments and defaulter tracking.' },
  { icon: 'i-heroicons-book-open', title: 'Library', text: 'Catalogue, loans, returns and overdue fines.' },
]

const stack = ['Laravel 12', 'Nuxt 4', 'PostgreSQL', 'Tailwind']

const roles = {
  'admin': { icon: 'i-heroicons-cog-6-tooth', text: 'Runs the whole system' },
  'faculty': { icon: 'i-heroicons-briefcase', text: 'Grades & attendance' },
  'student': { icon: 'i-heroicons-user', text: 'Courses & results' },
  'accountant': { icon: 'i-heroicons-banknotes', text: 'Fees & payments' },
  'librarian': { icon: 'i-heroicons-book-open', text: 'Books & loans' },
  'admission-officer': { icon: 'i-heroicons-inbox-arrow-down', text: 'Applications' },
}
const roleInfo = role => roles[role] || { icon: 'i-heroicons-user-circle', text: 'Explore this role' }

// Walk the journey steps in a loop
const activeStep = ref(0)
let journeyTimer
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    activeStep.value = journey.length - 1
    return
  }
  journeyTimer = setInterval(() => { activeStep.value = (activeStep.value + 1) % journey.length }, 1400)
})
onBeforeUnmount(() => clearInterval(journeyTimer))

const handleLogin = async () => {
  try {
    await auth.login(form.email, form.password)
    toast.add({ title: 'Welcome back!', description: `Logged in as ${auth.user?.name}`, color: 'success' })
    router.push(auth.dashboardRoute)
  } catch (err) {
    const msg = err?.data?.message || 'Login failed. Please check your credentials.'
    toast.add({ title: 'Login Failed', description: msg, color: 'error' })
  }
}

// Roles the backend offers as password-less, read-only demos (empty when the demo is off)
const demoRoles = ref([])
onMounted(async () => {
  try {
    const { $api } = useNuxtApp()
    demoRoles.value = (await $api('/auth/demo-roles')).data || []
  } catch { }
})

const handleDemoLogin = async (role) => {
  try {
    await auth.demoLogin(role)
    toast.add({ title: 'Demo mode', description: `Exploring as ${role}. Changes are disabled.`, color: 'info' })
    router.push(auth.dashboardRoute)
  } catch (err) {
    toast.add({ title: 'Demo unavailable', description: err?.data?.message || 'Please try again later.', color: 'error' })
  }
}
</script>

<style scoped>
.blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  animation: float 14s ease-in-out infinite;
}
.blob-slow { animation-duration: 20s; }
.blob-delay { animation-delay: -7s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-30px, 25px) scale(0.95); }
}

.dots-light {
  background-image: radial-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1px);
  background-size: 22px 22px;
  mask-image: linear-gradient(to bottom, black, transparent 85%);
}
.dots-dark {
  background-image: radial-gradient(rgb(6 78 59 / 0.08) 1px, transparent 1px);
  background-size: 22px 22px;
}

.fade-up {
  opacity: 0;
  animation: fade-up 0.7s ease-out forwards;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .blob { animation: none; }
  .fade-up { animation: none; opacity: 1; }
}
</style>
