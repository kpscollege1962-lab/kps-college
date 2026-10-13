import { Fragment } from 'react'
import { URDU_FONT } from '../constants/fonts'

const ARABIC = '\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF'
const URDU_RUN = new RegExp(`([${ARABIC}]+(?:[\\s\\u200c\\u200d]+[${ARABIC}]+)*)`)
const LEADING_ORDINAL = /^(\d+)(st|nd|rd|th)(?=\s|$)/

export default function RichText({ text, ordinal = false }) {
  const value = String(text ?? '')
  const match = ordinal ? LEADING_ORDINAL.exec(value) : null
  const rest = match ? value.slice(match[0].length) : value
  const parts = rest.split(URDU_RUN)

  return (
    <>
      {match && <>{match[1]}<sup className="normal-case">{match[2]}</sup></>}
      {parts.map((part, i) => {
        if (!part) return null
        return i % 2 === 1
          ? <span key={i} style={{ fontFamily: URDU_FONT, lineHeight: 2.1 }}>{part}</span>
          : <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}