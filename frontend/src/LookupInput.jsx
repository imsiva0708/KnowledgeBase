import { forwardRef } from 'react'

const LookupInput = forwardRef(function LookupInput({ value, onChange, onSearch, placeholder = 'Enter lookup code...', onClose, className = '' }, ref) {
  // ref is forwarded to the input element
  return (
    <input
      ref={ref}
      value={value}
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSearch()
        }
        if (e.key === 'Escape' && onClose) {
          onClose()
        }
      }}
      placeholder={placeholder}
      className={"w-full rounded-lg py-4 px-6 text-2xl bg-surface-container-highest border-none placeholder:text-on-surface-variant " + className}
      aria-label="Lookup ID"
    />
  )
})

export default LookupInput
