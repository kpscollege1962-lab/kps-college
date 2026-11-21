// Courtesy titles shown before staff names everywhere: "Mr. HAIDER ALI KHAN", "Miss SADIA".
// The stored name never has a title. The Staff model adds it when the name is read and strips
// it when a name is saved, so every screen gets it by default.
const TITLES = { male: 'Mr.', female: 'Miss' };

const TITLE_AT_START = /^(mr|mrs|ms|miss)\.?\s+/i;

const stripTitle = (name) => (typeof name === 'string' ? name.replace(TITLE_AT_START, '').trim() : name);

const withTitle = (name, gender) => {
  if (!name) return name;
  const title = TITLES[gender];
  if (!title || TITLE_AT_START.test(name)) return name;
  return `${title} ${name}`;
};

module.exports = { TITLES, stripTitle, withTitle };
