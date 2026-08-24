// Usage in any portal component:
//
// Imperative check (hooks, conditions, nav config):
//   import { useAbility } from '@casl/react'
//   import { AbilityContext } from '@/casl/AbilityProvider'
//   const ability = useAbility(AbilityContext)
//   ability.can('manage', 'all')      // SUPER_ADMIN
//   ability.can('read', 'Student')    // any role with this rule
//
// JSX gating (show/hide components):
//   import { Can } from '@/casl/AbilityProvider'
//   <Can I="read" a="Student">
//     <StudentList />
//   </Can>
//
// Note: manage/all covers every can() check,
// so SUPER_ADMIN never needs special casing.

// rules come from Redux (persisted, serializable).
// Ability is reconstructed here via useMemo so it
// updates reactively when rules change (e.g. on
// context switch). AbilityContext from @casl/react
// is used directly so components can use
// useAbility() and <Can> from @casl/react with no
// extra wiring.

import { createContext, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { createMongoAbility } from '@casl/ability'
import { createContextualCan } from '@casl/react'

// AbilityContext and Can are created here and re-exported so every component
// imports from this single file rather than from @casl/react directly.
// @casl/react does not export AbilityContext — it must be created by the app.
export const AbilityContext = createContext()
export const Can = createContextualCan(AbilityContext.Consumer)

export default function AbilityProvider({ children }) {
  const rules = useSelector((state) => state.roleContext.rules)

  const ability = useMemo(
    () => createMongoAbility(rules ?? []),
    [rules]
  )

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  )
}
