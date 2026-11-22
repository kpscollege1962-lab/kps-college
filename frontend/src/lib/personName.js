// Names arrive from the server with their title ("Mr. NAME" / "Miss NAME"). Forms that edit a
// name show it without the title (the server adds it again; saving strips any title anyway).
const TITLE_AT_START = /^(mr|mrs|ms|miss)\.?\s+/i

export const stripNameTitle = (name) => (typeof name === 'string' ? name.replace(TITLE_AT_START, '') : name)
