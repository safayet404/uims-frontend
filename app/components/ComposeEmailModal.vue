<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50" @click.self="close">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg" role="dialog" aria-modal="true" aria-labelledby="compose-title">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 id="compose-title" class="text-lg font-semibold text-gray-900">New email</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="close">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <form class="p-6 space-y-4" @submit.prevent="send">
          <!-- Recipient: chosen from the system, or any address typed by hand -->
          <div class="relative">
            <label class="block text-xs font-medium text-gray-600 mb-1">To</label>
            <div v-if="recipient" class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ recipient.name || recipient.email }}</p>
                <p class="text-xs text-gray-500 truncate">{{ recipient.email }}<span v-if="recipient.label"> · {{ recipient.label }}</span></p>
              </div>
              <button v-if="!lockRecipient" type="button" class="text-xs text-gray-500 hover:text-gray-800 shrink-0" @click="recipient = null">Change</button>
            </div>
            <template v-else>
              <input v-model="query" type="text" autocomplete="off" placeholder="Search a person or type an email address"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                @input="search">
              <ul v-if="suggestions.length || typedEmail" class="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                <li v-if="typedEmail">
                  <button type="button" class="w-full px-3 py-2 text-left hover:bg-gray-50" @click="choose({ type: 'external', email: typedEmail, name: '' })">
                    <p class="text-sm text-gray-900">Send to <b>{{ typedEmail }}</b></p>
                    <p class="text-xs text-gray-500">Someone outside the system</p>
                  </button>
                </li>
                <li v-for="s in suggestions" :key="s.type + s.email">
                  <button type="button" class="w-full px-3 py-2 text-left hover:bg-gray-50" @click="choose(s)">
                    <p class="text-sm text-gray-900">{{ s.name }}</p>
                    <p class="text-xs text-gray-500">{{ s.email }} · {{ s.label }}</p>
                  </button>
                </li>
              </ul>
            </template>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Subject</label>
            <input v-model="subject" type="text" maxlength="200" required
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea v-model="message" rows="7" maxlength="10000" required
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y" />
          </div>
          <p class="text-xs text-gray-500">Sent in the institution's name. Replies come straight to your own email ({{ auth.user?.email }}).</p>

          <div class="flex justify-end gap-2">
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50" @click="close">Cancel</button>
            <button type="submit" :disabled="!recipient || !subject || !message || sending"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
              {{ sending ? 'Sending…' : 'Send email' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  open: { type: Boolean, default: false },
  // Optional recipient to start with: { email, name, type, user_id, label }
  to: { type: Object, default: null },
})
const emit = defineEmits(['update:open', 'sent'])

const auth = useAuthStore()
const api = useApi()
const toast = useToast()

const recipient = ref(null)
const lockRecipient = computed(() => !!props.to)
const query = ref('')
const suggestions = ref([])
const subject = ref('')
const message = ref('')
const sending = ref(false)

const typedEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query.value.trim()) ? query.value.trim() : '')

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  recipient.value = props.to ? { ...props.to } : null
  query.value = ''
  suggestions.value = []
  subject.value = ''
  message.value = ''
})

let timer
const search = () => {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (query.value.trim().length < 2) { suggestions.value = []; return }
    try { suggestions.value = (await api.get('/communications/recipients', { q: query.value.trim() })).data || [] } catch { suggestions.value = [] }
  }, 300)
}

const choose = (s) => { recipient.value = s; suggestions.value = [] }
const close = () => emit('update:open', false)

const send = async () => {
  sending.value = true
  try {
    const res = await api.post('/communications/email', {
      to: recipient.value.email,
      recipient_name: recipient.value.name || null,
      recipient_type: recipient.value.type || 'external',
      recipient_user_id: recipient.value.user_id || null,
      subject: subject.value,
      message: message.value,
    })
    toast.add({ title: res.message, description: `${res.remaining} emails left today.`, color: 'success' })
    emit('sent')
    close()
  } catch { /* useApi already shows the error */ } finally {
    sending.value = false
  }
}
</script>
