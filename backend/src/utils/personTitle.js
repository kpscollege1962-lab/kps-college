// Courtesy titles before EVERY person's name, everywhere: "Mr. HAIDER ALI KHAN", "Miss SADIA".
//
// It is automatic and permanent: installPersonTitles(sequelize) runs before any model is defined,
// so ANY model (today's or a future one) that has a `gender` column gets the title on its name
// field: the first of NAME_FIELDS it has (full_name, name, first_name). Fields such as
// father_name / mother_name always get Mr. / Miss. Nothing to do per model or per screen.
//
//   - Reading the name adds the title; saving a name strips any title, so stored names are plain.
//   - The plain stored value: record.getDataValue('<field>'). `raw: true` queries return it too.
//   - Queries that pick the name but not `gender` (main query or any include) get `gender` added.
//   - A model with gender + a relationship/label column (e.g. "Father", "Mother") fills an empty
//     gender from it when saved.
//   - A person model with user_id keeps the login account's gender (users.gender) in step.
//   - Opt a model out with the define option  personTitle: false.

const { Op } = require('sequelize');

const TITLES = { male: 'Mr.', female: 'Miss' };
const NAME_FIELDS = ['full_name', 'name', 'first_name'];
const FIXED_GENDER_FIELDS = { father_name: 'male', mother_name: 'female' };
const RELATION_FIELDS = ['relationship', 'label', 'relation'];

const TITLE_AT_START = /^(mr|mrs|ms|miss)\.?\s+/i;

const MALE_RELATIONS = /^(father|abu|abbu|uncle|chacha|mamoo|mamu|brother|bhai|grand\s*father|grandpa|dada|nana|son|husband|nephew|cousin brother|male)$/i;
const FEMALE_RELATIONS = /^(mother|ammi|amma|aunt|aunty|auntie|chachi|khala|phupho|sister|behan|grand\s*mother|grandma|dadi|nani|daughter|wife|niece|cousin sister|female)$/i;

const stripTitle = (name) => (typeof name === 'string' ? name.replace(TITLE_AT_START, '').trim() : name);

const withTitle = (name, gender) => {
  if (!name) return name;
  const title = TITLES[gender];
  if (!title || TITLE_AT_START.test(name)) return name;
  return `${title} ${name}`;
};

// "Father" -> 'male', "Mother" -> 'female', anything else -> null
const genderFromRelation = (relation) => {
  const text = String(relation ?? '').trim();
  if (MALE_RELATIONS.test(text)) return 'male';
  if (FEMALE_RELATIONS.test(text)) return 'female';
  return null;
};

// Attribute options for a titled name column (genderField = column, or fixedGender = 'male' | 'female').
const titledName = (field, { genderField = 'gender', fixedGender = null } = {}) => ({
  get() {
    return withTitle(this.getDataValue(field), fixedGender ?? this.getDataValue(genderField));
  },
  set(value) {
    this.setDataValue(field, stripTitle(value));
  },
});

// modelName -> name field that carries the title (needs `gender` loaded)
const titledModels = new Map();

const addGender = (Model, attributes) => {
  const field = titledModels.get(Model?.name);
  if (field && Array.isArray(attributes) && attributes.includes(field) && !attributes.includes('gender')) {
    attributes.push('gender');
  }
};
const walkIncludes = (includes = []) => {
  for (const inc of includes) {
    addGender(inc?.model, inc?.attributes);
    if (inc?.include) walkIncludes(inc.include);
  }
};

// A column may be written as a bare type (name: DataTypes.STRING): make it an object first.
const asObject = (attributes, field) => {
  const def = attributes[field];
  if (def && (typeof def !== 'object' || !('type' in def))) attributes[field] = { type: def };
  return attributes[field];
};

const installPersonTitles = (sequelize) => {
  sequelize.addHook('beforeDefine', 'personTitles', (attributes, options) => {
    if (options.personTitle === false) return;

    for (const [field, gender] of Object.entries(FIXED_GENDER_FIELDS)) {
      if (attributes[field] && !asObject(attributes, field).get) {
        Object.assign(attributes[field], titledName(field, { fixedGender: gender }));
      }
    }

    if (!attributes.gender) return;
    const field = NAME_FIELDS.find((f) => attributes[f]);
    if (!field || asObject(attributes, field).get) return;
    Object.assign(attributes[field], titledName(field));
    titledModels.set(options.modelName, field);

    // Empty gender + a relationship / label ("Father", "Mother"): fill it in on save.
    const relationField = RELATION_FIELDS.find((f) => attributes[f]);
    const hooks = (options.hooks = options.hooks ?? {});
    if (relationField) {
      const before = hooks.beforeSave;
      hooks.beforeSave = async (instance, opts) => {
        if (before) await before(instance, opts);
        if (!instance.getDataValue('gender')) {
          const guessed = genderFromRelation(instance.getDataValue(relationField));
          if (guessed) instance.setDataValue('gender', guessed);
        }
      };
    }

    // A person linked to a login account: keep users.gender the same as the person's.
    if (attributes.user_id && options.modelName !== 'User') {
      const after = hooks.afterSave;
      hooks.afterSave = async (instance, opts) => {
        if (after) await after(instance, opts);
        const userId = instance.getDataValue('user_id');
        const gender = instance.getDataValue('gender');
        const User = sequelize.models.User;
        if (userId && gender && User?.rawAttributes?.gender) {
          await User.update({ gender }, {
            where: { id: userId, [Op.or]: [{ gender: null }, { gender: { [Op.ne]: gender } }] },
            transaction: opts?.transaction,
            hooks: false,
          });
        }
      };
    }
  });

  sequelize.addHook('beforeFindAfterExpandIncludeAll', 'personTitleGender', function personTitleGender(options) {
    addGender(this, options.attributes);
    walkIncludes(options.include);
  });
};

module.exports = {
  TITLES, NAME_FIELDS, stripTitle, withTitle, titledName, genderFromRelation, installPersonTitles,
};
