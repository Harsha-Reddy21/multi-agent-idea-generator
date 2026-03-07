import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UserProfile as UserProfileModel } from '../../core/models/user.model'
import UserProfile from './UserProfile'

describe('UserProfile', () => {
  const mockUserProfile: UserProfileModel = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'User',
    is_active: true,
    created_at: '2024-01-01',
    anyIdeasSubmitted: 'yes',
    department: 'Engineering',
    title: 'Software Engineer',
  }

  describe('Basic Rendering', () => {
    it('should render user profile container', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const profileContainer = container.querySelector('.user-profile')
      expect(profileContainer).toBeInTheDocument()
    })

    it('should render separator element', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const separator = container.querySelector('.user-profile__separator')
      expect(separator).toBeInTheDocument()
    })

    it('should render avatar element', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('should render text element', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const text = container.querySelector('.user-profile__text')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Avatar Display', () => {
    it('should display first letter of name in uppercase in avatar', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('J')
    })

    it('should display first letter in uppercase even if name starts with lowercase', () => {
      const lowercaseProfile = { ...mockUserProfile, name: 'alice smith' }
      const { container } = render(
        <UserProfile userProfile={lowercaseProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('A')
    })

    it('should have title attribute with full name on avatar', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveAttribute('title', 'John Doe')
    })

    it('should handle single character name', () => {
      const singleCharProfile = { ...mockUserProfile, name: 'X' }
      const { container } = render(
        <UserProfile userProfile={singleCharProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('X')
    })

    it('should handle name with special characters', () => {
      const specialCharProfile = { ...mockUserProfile, name: '@John' }
      const { container } = render(
        <UserProfile userProfile={specialCharProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('@')
    })

    it('should handle name with numbers', () => {
      const numberProfile = { ...mockUserProfile, name: '123 User' }
      const { container } = render(<UserProfile userProfile={numberProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('1')
    })
  })

  describe('Name Display', () => {
    it('should display full name when length is 20 or less', () => {
      const shortNameProfile = { ...mockUserProfile, name: 'John Doe' }
      render(<UserProfile userProfile={shortNameProfile} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should display full name when length is exactly 20', () => {
      const exactLengthProfile = {
        ...mockUserProfile,
        name: '12345678901234567890',
      }
      render(<UserProfile userProfile={exactLengthProfile} />)

      expect(screen.getByText('12345678901234567890')).toBeInTheDocument()
    })

    it('should truncate name when length is greater than 20', () => {
      const longNameProfile = {
        ...mockUserProfile,
        name: 'Very Long Name That Exceeds Twenty Characters',
      }
      render(<UserProfile userProfile={longNameProfile} />)

      expect(screen.getByText('Very Long Name That ...')).toBeInTheDocument()
    })

    it('should truncate name to exactly 20 characters plus ellipsis', () => {
      const longNameProfile = {
        ...mockUserProfile,
        name: 'This is a very long name that definitely exceeds the limit',
      }
      render(<UserProfile userProfile={longNameProfile} />)

      const truncatedText = screen.getByText(/This is a very long /)
      expect(truncatedText).toHaveTextContent('This is a very long ...')
    })

    it('should display name at exactly 21 characters as truncated', () => {
      const profile21Chars = {
        ...mockUserProfile,
        name: '123456789012345678901',
      } // 21 chars
      render(<UserProfile userProfile={profile21Chars} />)

      expect(screen.getByText('12345678901234567890...')).toBeInTheDocument()
    })

    it('should have title attribute with full name on text element', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const text = container.querySelector('.user-profile__text')
      expect(text).toHaveAttribute('title', 'John Doe')
    })

    it('should show full name in title even when truncated', () => {
      const longNameProfile = {
        ...mockUserProfile,
        name: 'Very Long Name That Exceeds Twenty Characters',
      }
      const { container } = render(
        <UserProfile userProfile={longNameProfile} />
      )

      const text = container.querySelector('.user-profile__text')
      expect(text).toHaveAttribute(
        'title',
        'Very Long Name That Exceeds Twenty Characters'
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string name', () => {
      const emptyNameProfile = { ...mockUserProfile, name: '' }
      const { container } = render(
        <UserProfile userProfile={emptyNameProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      // charAt(0) on empty string returns empty string, toUpperCase() on it returns empty string
      expect(avatar).toHaveTextContent('')
    })

    it('should handle name with only spaces', () => {
      const spacesProfile = { ...mockUserProfile, name: '   ' }
      const { container } = render(<UserProfile userProfile={spacesProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      // First character is a space, but HTML normalizes whitespace in textContent
      expect(avatar?.textContent).toBeTruthy()
    })

    it('should handle name with unicode characters', () => {
      const unicodeProfile = { ...mockUserProfile, name: 'José García' }
      const { container } = render(<UserProfile userProfile={unicodeProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('J')
      expect(screen.getByText('José García')).toBeInTheDocument()
    })

    it('should handle name with emojis', () => {
      const emojiProfile = { ...mockUserProfile, name: '😀 Happy User' }
      const { container } = render(<UserProfile userProfile={emojiProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      // charAt(0) on emoji returns first code unit, not the full emoji
      expect(avatar?.textContent).toBeTruthy()
      expect(avatar).toBeInTheDocument()
    })

    it('should handle very long names (more than 100 characters)', () => {
      const veryLongName = 'A'.repeat(150)
      const veryLongProfile = { ...mockUserProfile, name: veryLongName }
      const { container } = render(
        <UserProfile userProfile={veryLongProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('A')

      // Should be truncated to 20 chars + ...
      expect(screen.getByText('AAAAAAAAAAAAAAAAAAAA...')).toBeInTheDocument()
    })

    it('should handle name with leading/trailing spaces', () => {
      const spacedProfile = { ...mockUserProfile, name: '  John Doe  ' }
      const { container } = render(<UserProfile userProfile={spacedProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      // First character is a space
      expect(avatar?.textContent).toBeTruthy()
      expect(screen.getByText('John Doe', { exact: false })).toBeInTheDocument()
    })
  })

  describe('CSS Classes', () => {
    it('should apply user-profile class to container', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const profileContainer = container.querySelector('.user-profile')
      expect(profileContainer).toHaveClass('user-profile')
    })

    it('should apply user-profile__separator class', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const separator = container.querySelector('.user-profile__separator')
      expect(separator).toHaveClass('user-profile__separator')
    })

    it('should apply user-profile__avatar class', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveClass('user-profile__avatar')
    })

    it('should apply user-profile__text class', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const text = container.querySelector('.user-profile__text')
      expect(text).toHaveClass('user-profile__text')
    })
  })

  describe('Component Structure', () => {
    it('should render separator before avatar', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const separator = container.querySelector('.user-profile__separator')
      const avatar = container.querySelector('.user-profile__avatar')

      expect(separator?.nextElementSibling).toBe(avatar)
    })

    it('should render avatar before text', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      const text = container.querySelector('.user-profile__text')

      expect(avatar?.nextElementSibling).toBe(text)
    })

    it('should have exactly three child elements', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const profileContainer = container.querySelector('.user-profile')
      expect(profileContainer?.children.length).toBe(3)
    })
  })

  describe('Different User Profiles', () => {
    it('should render correctly for user with all fields populated', () => {
      const completeProfile: UserProfileModel = {
        id: 'user-001',
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        role: 'Admin',
        is_active: true,
        created_at: '2023-05-15',
        anyIdeasSubmitted: 'yes',
        department: 'Product',
        title: 'Product Manager',
      }

      const { container } = render(
        <UserProfile userProfile={completeProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('A')
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })

    it('should render correctly for inactive user', () => {
      const inactiveProfile = { ...mockUserProfile, is_active: false }
      const { container } = render(
        <UserProfile userProfile={inactiveProfile} />
      )

      const profileContainer = container.querySelector('.user-profile')
      expect(profileContainer).toBeInTheDocument()
    })

    it('should render correctly for user with minimal data', () => {
      const minimalProfile: UserProfileModel = {
        id: '',
        name: 'B',
        email: '',
        role: '',
        is_active: false,
        created_at: '',
        anyIdeasSubmitted: '',
        department: '',
        title: '',
      }

      const { container } = render(<UserProfile userProfile={minimalProfile} />)

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveTextContent('B')
      // Use getAllByText since 'B' appears in both avatar and text
      const bElements = screen.getAllByText('B')
      expect(bElements.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have title tooltips on avatar for accessibility', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      expect(avatar).toHaveAttribute('title', mockUserProfile.name)
    })

    it('should have title tooltips on text for accessibility', () => {
      const { container } = render(
        <UserProfile userProfile={mockUserProfile} />
      )

      const text = container.querySelector('.user-profile__text')
      expect(text).toHaveAttribute('title', mockUserProfile.name)
    })

    it('should provide full name in tooltip when name is truncated', () => {
      const longNameProfile = {
        ...mockUserProfile,
        name: 'Christopher Alexander Montgomery',
      }
      const { container } = render(
        <UserProfile userProfile={longNameProfile} />
      )

      const avatar = container.querySelector('.user-profile__avatar')
      const text = container.querySelector('.user-profile__text')

      expect(avatar).toHaveAttribute(
        'title',
        'Christopher Alexander Montgomery'
      )
      expect(text).toHaveAttribute('title', 'Christopher Alexander Montgomery')
    })
  })

  describe('Truncation Logic', () => {
    it('should not truncate when name length is less than 20', () => {
      const shortName = { ...mockUserProfile, name: 'Short' }
      render(<UserProfile userProfile={shortName} />)

      expect(screen.getByText('Short')).toBeInTheDocument()
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument()
    })

    it('should truncate at exactly character 20', () => {
      const longName = {
        ...mockUserProfile,
        name: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // 26 chars
      }
      render(<UserProfile userProfile={longName} />)

      // Should show first 20 chars + ...
      expect(screen.getByText('ABCDEFGHIJKLMNOPQRST...')).toBeInTheDocument()
    })

    it('should use substring method for truncation', () => {
      const name51Chars = { ...mockUserProfile, name: '1'.repeat(51) }
      render(<UserProfile userProfile={name51Chars} />)

      const expected = '1'.repeat(20) + '...'
      expect(screen.getByText(expected)).toBeInTheDocument()
    })
  })
})
