<template>
  <div class="nf-form-cont" aria-live="polite" role="form">
    <div class="nf-form-layout">
      <form novalidate @submit.prevent="submit">
        <div class="nf-form-content">
          <div v-if="variant === 'kontakt'" class="nf-field-container textbox-container label-hidden">
            <div class="nf-field">
              <div class="textbox-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <label class="lea-field-label" :for="`${uid}-name`">Name *</label>
                  <input
                    :id="`${uid}-name`"
                    v-model="fields.name"
                    type="text"
                    name="name"
                    class="ninja-forms-field nf-element"
                    :class="{ 'lea-invalid': errors.name }"
                    autocomplete="name"
                    required
                    @input="errors.name = ''"
                  >
                  <p v-if="errors.name" class="lea-field-error">{{ errors.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="nf-field-container email-container label-hidden">
            <div class="nf-field">
              <div class="email-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <label class="lea-field-label" :for="`${uid}-email`">E-Mail-Adresse *</label>
                  <input
                    :id="`${uid}-email`"
                    v-model="fields.email"
                    type="email"
                    name="email"
                    class="ninja-forms-field nf-element"
                    :class="{ 'lea-invalid': errors.email }"
                    autocomplete="email"
                    required
                    @input="errors.email = ''"
                  >
                  <p v-if="errors.email" class="lea-field-error">{{ errors.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="variant === 'kontakt'" class="nf-field-container textbox-container label-hidden">
            <div class="nf-field">
              <div class="textbox-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <label class="lea-field-label" :for="`${uid}-telefon`">Telefon (optional)</label>
                  <input
                    :id="`${uid}-telefon`"
                    v-model="fields.telefon"
                    type="tel"
                    name="telefon"
                    class="ninja-forms-field nf-element"
                    autocomplete="tel"
                  >
                </div>
              </div>
            </div>
          </div>

          <div v-if="variant === 'footer'" class="nf-field-container listcheckbox-container label-hidden list-checkbox-wrap">
            <div class="nf-field">
              <div class="listcheckbox-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <ul>
                    <li>
                      <input
                        :id="`${uid}-newsletter`"
                        v-model="fields.newsletter"
                        type="checkbox"
                        class="ninja-forms-field nf-element"
                      >
                      <label :for="`${uid}-newsletter`">
                        Gerne informieren wir Sie in unregelmässigem Abstand über Neuigkeiten.
                        Melden Sie sich für unseren Newsletter an.
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="nf-field-container textarea-container label-hidden">
            <div class="nf-field">
              <div class="textarea-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <label class="lea-field-label" :for="`${uid}-nachricht`">
                    {{ variant === 'kontakt' ? 'Anliegen / Nachricht *' : 'Ihre Nachricht *' }}
                  </label>
                  <textarea
                    :id="`${uid}-nachricht`"
                    v-model="fields.nachricht"
                    name="nachricht"
                    class="ninja-forms-field nf-element"
                    :class="{ 'lea-invalid': errors.nachricht }"
                    required
                    @input="errors.nachricht = ''"
                  ></textarea>
                  <p v-if="errors.nachricht" class="lea-field-error">{{ errors.nachricht }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="nf-field-container submit-container label-hidden">
            <div class="nf-field">
              <div class="submit-wrap field-wrap nf-field-element-wrap">
                <div class="nf-field-element">
                  <input
                    type="submit"
                    class="ninja-forms-field nf-element"
                    :value="sending ? 'Wird gesendet…' : submitLabel"
                    :disabled="sending"
                  >
                </div>
              </div>
            </div>
          </div>

          <div v-if="status === 'ok'" class="nf-response-msg">
            <p>Vielen Dank für Ihre Nachricht! Wir melden uns so rasch wie möglich.</p>
          </div>
          <div v-else-if="status === 'error'" class="nf-error-msg nf-response-msg">
            <p>Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie an info@leantris.ch.</p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

// Formspree-Endpoint: nach dem Anlegen des Formulars unter https://formspree.io
// die ID hier eintragen (z. B. https://formspree.io/f/abcdwxyz)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_FORM_ID'

const props = defineProps({
  variant: { type: String, default: 'footer' }, // 'footer' | 'kontakt'
})

const uid = `nf-${Math.random().toString(36).slice(2, 8)}`
const fields = reactive({ name: '', email: '', telefon: '', newsletter: false, nachricht: '' })
const errors = reactive({ name: '', email: '', nachricht: '' })
const sending = ref(false)
const status = ref('')

const submitLabel = computed(() => (props.variant === 'kontakt' ? 'Nachricht senden' : 'Senden'))

function validate() {
  let ok = true
  if (props.variant === 'kontakt' && !fields.name.trim()) {
    errors.name = 'Bitte geben Sie Ihren Namen an.'
    ok = false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.'
    ok = false
  }
  if (!fields.nachricht.trim()) {
    errors.nachricht = 'Bitte beschreiben Sie kurz Ihr Anliegen.'
    ok = false
  }
  return ok
}

async function submit() {
  if (sending.value) return
  if (!validate()) return
  sending.value = true
  status.value = ''
  try {
    const payload = {
      email: fields.email,
      nachricht: fields.nachricht,
    }
    if (props.variant === 'kontakt') {
      payload.name = fields.name
      if (fields.telefon) payload.telefon = fields.telefon
    } else {
      payload.newsletter = fields.newsletter ? 'ja' : 'nein'
    }
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    status.value = 'ok'
    fields.name = fields.email = fields.telefon = fields.nachricht = ''
    fields.newsletter = false
  } catch {
    status.value = 'error'
  } finally {
    sending.value = false
  }
}
</script>
