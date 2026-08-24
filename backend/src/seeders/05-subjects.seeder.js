const { Subject } = require('../models');
const deployment = require('../config/deployment');

const seedSubjects = async () => {
  for (const subj of deployment.subjects) {
    const [, created] = await Subject.findOrCreate({
      where:    { name: subj.name },
      defaults: {
        name:          subj.name,
        name_initials: subj.nameInitials ?? null,
        category:      subj.category,
      },
    });

    if (created) {
      console.log(`  ✓ Subject created: ${subj.name}`);
    } else {
      console.log(`  → Subject already exists, skipping: ${subj.name}`);
    }
  }
};

module.exports = seedSubjects;
