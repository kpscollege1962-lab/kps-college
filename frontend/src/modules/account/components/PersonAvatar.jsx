import { stripNameTitle } from '@/lib/personName'
import { cn } from '@/lib/utils'

// Photo if there is one, else initials (the name title is skipped: "Mr. ABNE AMIN" -> "AA").
export default function PersonAvatar({ user, className }) {
  const first = stripNameTitle(user?.first_name ?? '')
  const initials = `${first[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
  return user?.profile_photo ? (
    <img src={user.profile_photo} alt="" className={cn('rounded-full object-cover', className)} />
  ) : (
    <span className={cn('flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground', className)}>
      {initials}
    </span>
  )
}
