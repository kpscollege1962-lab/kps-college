export const DEFAULT_QUOTE = 'It is impossible for a man to learn what he thinks he already knows.'

export const QUOTES = [
  DEFAULT_QUOTE,
  'Education is the most powerful weapon which you can use to change the world.',
  'An investment in knowledge pays the best interest.',
  'Learning never exhausts the mind.',
  'It does not matter how slowly you go as long as you do not stop.',
  'Education is not the filling of a pail, but the lighting of a fire.',
  'Live as if you were to die tomorrow. Learn as if you were to live forever.',
  'The expert in anything was once a beginner.',
  'Success is the sum of small efforts, repeated day in and day out.',
  'The beautiful thing about learning is that no one can take it away from you.',
  'The roots of education are bitter, but the fruit is sweet.',
  'Tell me and I forget. Teach me and I remember. Involve me and I learn.',
  'A person who never made a mistake never tried anything new.',
  'The future belongs to those who prepare for it today.',
  'Mistakes are proof that you are trying.',
  'Believe you can and you are halfway there.',
  "Don't watch the clock; do what it does. Keep going.",
  'Practice makes progress.',
  'Small steps every day lead to big results.',
  'The only person who is educated is the one who has learned how to learn and change.',
]

export const pickRandomQuote = (current) => {
  const pool = QUOTES.filter((q) => q !== current)
  return pool[Math.floor(Math.random() * pool.length)]
}