import React from 'react'
export const LdsBreadcrumb: React.FC<{ breadcrumbs?: string[] }> = ({
  breadcrumbs,
}) => (
  <div data-testid="mock-lds-breadcrumb">{(breadcrumbs || []).join(' / ')}</div>
)
export const LdsProgressIndicator: React.FC<{ value: number }> = ({
  value,
}) => <div data-testid="mock-lds-progress">Progress: {value}</div>
export const LdsStepIndicator: React.FC<any> = () => (
  <div data-testid="mock-lds-progress">Progress: 40</div>
)
export const LdsTextField: React.FC<any> = props => (
  <input
    data-testid={props['data-testid'] || 'mock-text-field'}
    value={props.value || ''}
    onChange={e => props.onChange && props.onChange(e)}
  />
)
export const LdsTextarea: React.FC<any> = props => (
  <textarea
    data-testid={props['data-testid'] || 'mock-text-area'}
    value={props.value || ''}
    onChange={e => props.onChange && props.onChange(e)}
  />
)
export const LdsSelect: React.FC<{
  options?: any[]
  value?: any
  onChange?: any
  'data-testid'?: string
}> = ({ options = [], value, onChange, 'data-testid': dt }) => (
  <select
    data-testid={dt || 'mock-select'}
    value={value}
    onChange={e => onChange && onChange(e)}
  >
    {options.map((o: any, idx: number) => {
      const val = typeof o === 'string' ? o : o.value
      const label = typeof o === 'string' ? o : o.label
      return (
        <option key={val || idx} value={val}>
          {label}
        </option>
      )
    })}
  </select>
)
export const LdsRadioGroup: React.FC<any> = ({
  children,
  'data-testid': dt,
}) => <div data-testid={dt || 'mock-radio-group'}>{children}</div>
export const LdsRadio: React.FC<any> = ({ label, checked, onChange }) => (
  <label style={{ marginRight: 8 }}>
    <input type="radio" checked={checked} onChange={onChange} /> {label}
  </label>
)
export const LdsButton: React.FC<any> = ({
  children,
  onClick,
  disabled,
  'data-testid': dt,
}) => (
  <button
    data-testid={dt || 'mock-button'}
    onClick={disabled ? undefined : onClick}
    disabled={!!disabled}
  >
    {children}
  </button>
)
export const LdsTooltip: React.FC<{
  content?: string
  'data-testid'?: string
}> = ({ content, 'data-testid': dt }) => (
  <span data-testid={dt || 'mock-tooltip'} aria-label={content || 'Tooltip'}>
    ⓘ
  </span>
)

// Minimal mock for LdsHeader with nested Link component used in App.tsx tests
export const LdsHeader: React.FC<any> & { Link?: React.FC<any> } = (
  props: any
) => <nav data-testid="mock-lds-header">{props.children}</nav>
LdsHeader.Link = ({ href, children }: any) => (
  <a href={href} data-testid="mock-lds-header-link">
    {children}
  </a>
)
export const LdsUtilityMenuLink: React.FC<any> = ({ href, children }: any) => (
  <a href={href} data-testid="mock-lds-utility-link">
    {children}
  </a>
)
