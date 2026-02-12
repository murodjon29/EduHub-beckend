enum AdminRoles {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
}

enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

enum GroupStudentStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  BLOCKED = 'BLOCKED',
}

enum Role {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  LEARNING_CENTER = 'LEARNING_CENTER',
}

export { AdminRoles, AttendanceStatus, GroupStudentStatus, Role };
