export const adminMenu = [
  {
    //quản lý người dùng
    name: 'menu.admin.manage-user',
    icon: 'fas fa-users',
    menus: [
      {
        name: 'menu.admin.crud-redux',
        link: '/system/user-redux',
      },
      {
        name: 'menu.admin.manage-doctor',
        link: '/system/manage-doctor',
      },
      {
        //Quản lý kế hoạch khám bệnh của bác sĩ
        name: 'menu.doctor.manage-schedule',
        link: '/doctor/manage-schedule',
      },
    ],
  },
  {
    //quản lý phòng khám
    name: 'menu.admin.clinic',
    icon: 'fas fa-hospital',
    menus: [
      {
        name: 'menu.admin.manage-clinic',
        link: '/system/manage-clinic',
      },
    ],
  },
  {
    //quản lý chuyên khoa
    name: 'menu.admin.specialty',
    icon: 'fas fa-microscope',
    menus: [
      {
        name: 'menu.admin.manage-specialty',
        link: '/system/manage-specialty',
      },
    ],
  },

  {
    //Xem Thống Kê
    name: 'menu.admin.Statistical',
    icon: 'fas fa-chart-bar',
    menus: [
      {
        name: 'menu.admin.ViewStatistics',
        link: '/system/view-statistics',
      },
      {
        name: 'menu.admin.DoctorStatistics',
        link: '/system/doctor-statistic',
      },
      {
        name: 'menu.admin.SpecialityClinicStatistics',
        link: '/system/speciality-clinic-statistic',
      },
    ],
  },
];

export const doctorMenu = [
  {
    name: 'menu.doctor.manage-schedule',
    icon: 'fas fa-tasks',
    menus: [
      {
        //Quản lý kế hoạch khám bệnh của bác sĩ
        name: 'menu.doctor.register-schedule',
        link: '/doctor/manage-schedule',
      },
    ],
  },
  {
    //quản lý cẩm nang
    name: 'menu.admin.handbook',
    icon: 'fas fa-book',
    menus: [
      {
        name: 'menu.admin.manage-handbook',
        link: '/doctor/manage-handbook',
      },
    ],
  },
  {
    //quản lý bệnh nhân
    name: 'menu.doctor.manage-patient',
    icon: 'fas fa-users-cog',
    menus: [
      {
        name: 'menu.doctor.manage-examination-shift',
        link: '/doctor/manage-patient',
      },
    ],
  },
];
