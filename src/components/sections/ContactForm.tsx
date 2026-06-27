'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { fadeUp, staggerContainer } from '@/lib/variants'

const EMAILJS_SERVICE_ID = 'service_2cfl5kk'
const EMAILJS_TEMPLATE_ID = 'template_0i3eogg'
const EMAILJS_PUBLIC_KEY = 'bfloHtDDlu5GazDMn'

type FormState = 'idle' | 'sending' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

function InputField({ label, name, type = 'text', value, onChange, required }: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative">
      <motion.label
        animate={{
          y: focused || value ? -22 : 0,
          fontSize: focused || value ? '0.65rem' : '0.82rem',
          color: focused ? '#C4962A' : 'rgba(245,240,232,0.4)',
          letterSpacing: focused || value ? '0.15em' : '0.05em',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-3 font-mono uppercase pointer-events-none"
      >
        {label}
      </motion.label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className="w-full bg-transparent pt-6 pb-2 font-sans text-[0.95rem] outline-none"
        style={{
          color: '#F5F0E8',
          borderBottom: `0.5px solid ${focused ? '#C4962A' : 'rgba(245,240,232,0.2)'}`,
          transition: 'border-color 0.2s ease',
        }}
      />
    </div>
  )
}

function TextAreaField({ label, name, value, onChange, required }: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative">
      <motion.label
        animate={{
          y: focused || value ? -22 : 0,
          fontSize: focused || value ? '0.65rem' : '0.82rem',
          color: focused ? '#C4962A' : 'rgba(245,240,232,0.4)',
          letterSpacing: focused || value ? '0.15em' : '0.05em',
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-3 font-mono uppercase pointer-events-none"
      >
        {label}
      </motion.label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={4}
        className="w-full bg-transparent pt-6 pb-2 font-sans text-[0.95rem] outline-none resize-none"
        style={{
          color: '#F5F0E8',
          borderBottom: `0.5px solid ${focused ? '#C4962A' : 'rgba(245,240,232,0.2)'}`,
          transition: 'border-color 0.2s ease',
        }}
      />
    </div>
  )
}

export function ContactForm() {
  const ref = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const inView = useInView(ref, { amount: 0.2 })
  const [formState, setFormState] = useState<FormState>('idle')
  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', subject: '', message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formRef.current) return
    setFormState('sending')
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, EMAILJS_PUBLIC_KEY)
      setFormState('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('EmailJS error:', error)
      setFormState('error')
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className="mt-20 pt-16"
      style={{ borderTop: '0.5px solid rgba(245,240,232,0.1)' }}
    >
      <motion.div variants={fadeUp} className="mb-10">
        <div className="font-mono text-[0.68rem] tracking-[0.22em] uppercase mb-4" style={{ color: 'rgba(245,240,232,0.35)' }}>
          Or send a message
        </div>
        <h3 className="font-serif font-bold leading-tight" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#F5F0E8' }}>
          Drop me a line<em className="italic" style={{ color: '#E8C97A' }}> directly.</em>
        </h3>
      </motion.div>

      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        variants={staggerContainer}
        className="grid gap-10"
        style={{ gridTemplateColumns: '1fr 1fr' }}
      >
        <motion.div variants={fadeUp}>
          <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required />
        </motion.div>

        <motion.div variants={fadeUp}>
          <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </motion.div>

        <motion.div variants={fadeUp} style={{ gridColumn: '1 / -1' }}>
          <InputField label="Subject" name="subject" value={formData.subject} onChange={handleChange} required />
        </motion.div>

        <motion.div variants={fadeUp} style={{ gridColumn: '1 / -1' }}>
          <TextAreaField label="Message" name="message" value={formData.message} onChange={handleChange} required />
        </motion.div>

        <motion.div variants={fadeUp} style={{ gridColumn: '1 / -1' }} className="flex items-center gap-6">
          <motion.button
            type="submit"
            disabled={formState === 'sending'}
            whileHover={{ scale: formState === 'sending' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            data-cursor-hover
            className="relative overflow-hidden flex items-center"
            style={{
              height: 52,
              border: '0.5px solid rgba(245,240,232,0.25)',
              borderRadius: 2,
              background: 'transparent',
              opacity: formState === 'sending' ? 0.6 : 1,
            }}
          >
            <span className="font-mono text-[0.72rem] tracking-[0.15em] uppercase px-8" style={{ color: '#F5F0E8' }}>
              {formState === 'sending' ? 'Sending...' : 'Send Message'}
            </span>
            <div className="flex items-center justify-center flex-shrink-0 bg-gold" style={{ width: 52, height: 52, fontSize: '1rem' }}>
              →
            </div>
          </motion.button>

          {formState === 'success' && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-[0.7rem] tracking-[0.1em]" style={{ color: '#C4962A' }}>
              ✓ Message sent — I'll be in touch.
            </motion.span>
          )}
          {formState === 'error' && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-[0.7rem] tracking-[0.1em]" style={{ color: '#9B4C2E' }}>
              Something went wrong. Try emailing directly.
            </motion.span>
          )}
        </motion.div>
      </motion.form>
    </motion.div>
  )
}