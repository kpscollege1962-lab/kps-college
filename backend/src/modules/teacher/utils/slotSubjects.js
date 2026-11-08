const subjectsForTeacher = (slot, staffId) => {
  const picked = new Map();
  const add = (subject) => {
    if (subject) picked.set(subject.id, { id: subject.id, name: subject.name });
  };

  const hasStaff1 = slot.staff_id_1 != null;
  const hasStaff2 = slot.staff_id_2 != null;

  if (slot.staff_id_1 === staffId) {
    add(slot.subject1);
    if (!hasStaff2) add(slot.subject2);
  }
  if (slot.staff_id_2 === staffId) {
    add(slot.subject2);
    if (!hasStaff1) add(slot.subject1);
  }

  return [...picked.values()];
};

module.exports = { subjectsForTeacher };