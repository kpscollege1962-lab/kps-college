module.exports = (db) => {
  const {
    Campus,
    AcademicSession,
    ClassGroup,
    Section,
    Enrollment,
    User,
    FeeHead,
    FeeStructure,
    FeeChallan,
    FeeChallanItem,
    FeePayment,
  } = db;

  // ── FeeHead ───────────────────────────────────────────────────────────────
  Campus.hasMany(FeeHead, { foreignKey: 'campus_id', as: 'feeHeads' });
  FeeHead.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

  FeeHead.hasMany(FeeStructure, { foreignKey: 'fee_head_id', as: 'feeStructures' });
  FeeHead.hasMany(FeeChallanItem, { foreignKey: 'fee_head_id', as: 'challanItems' });

  // ── FeeStructure ──────────────────────────────────────────────────────────
  Campus.hasMany(FeeStructure, { foreignKey: 'campus_id', as: 'feeStructures' });
  FeeStructure.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

  AcademicSession.hasMany(FeeStructure, { foreignKey: 'session_id', as: 'feeStructures' });
  FeeStructure.belongsTo(AcademicSession, { foreignKey: 'session_id', as: 'session' });

  ClassGroup.hasMany(FeeStructure, { foreignKey: 'class_group_id', as: 'feeStructures' });
  FeeStructure.belongsTo(ClassGroup, { foreignKey: 'class_group_id', as: 'classGroup' });

  Section.hasMany(FeeStructure, { foreignKey: 'section_id', as: 'feeStructures' });
  FeeStructure.belongsTo(Section, { foreignKey: 'section_id', as: 'section' });

  FeeStructure.belongsTo(FeeHead, { foreignKey: 'fee_head_id', as: 'feeHead' });

  // ── FeeChallan ────────────────────────────────────────────────────────────
  Enrollment.hasMany(FeeChallan, { foreignKey: 'enrollment_id', as: 'feeChallans' });
  FeeChallan.belongsTo(Enrollment, { foreignKey: 'enrollment_id', as: 'enrollment' });

  Campus.hasMany(FeeChallan, { foreignKey: 'campus_id', as: 'feeChallans' });
  FeeChallan.belongsTo(Campus, { foreignKey: 'campus_id', as: 'campus' });

  AcademicSession.hasMany(FeeChallan, { foreignKey: 'session_id', as: 'feeChallans' });
  FeeChallan.belongsTo(AcademicSession, { foreignKey: 'session_id', as: 'session' });

  FeeChallan.hasMany(FeeChallanItem, { foreignKey: 'challan_id', as: 'items' });
  FeeChallanItem.belongsTo(FeeChallan, { foreignKey: 'challan_id', as: 'challan' });

  FeeChallan.hasMany(FeePayment, { foreignKey: 'challan_id', as: 'payments' });
  FeePayment.belongsTo(FeeChallan, { foreignKey: 'challan_id', as: 'challan' });

  // ── FeeChallanItem ────────────────────────────────────────────────────────
  FeeChallanItem.belongsTo(FeeHead, { foreignKey: 'fee_head_id', as: 'feeHead' });

  // ── FeePayment ────────────────────────────────────────────────────────────
  User.hasMany(FeePayment, { foreignKey: 'received_by', as: 'receivedFeePayments' });
  FeePayment.belongsTo(User, { foreignKey: 'received_by', as: 'receivedByUser' });
};