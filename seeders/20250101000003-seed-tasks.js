'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('tasks', [
      {
        id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
        title: 'Design Landing Page',
        description: 'Create wireframes and high-fidelity mockups for the new landing page.',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2025-07-15'),
        projectId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', // Website Redesign
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
        title: 'Implement Authentication UI',
        description: 'Build the login and registration pages with form validation.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date('2025-07-30'),
        projectId: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', // Website Redesign
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d',
        title: 'Setup React Native Project',
        description: 'Initialize the React Native project with navigation and state management.',
        status: 'Done',
        priority: 'High',
        dueDate: new Date('2025-06-01'),
        projectId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // Mobile App MVP
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e',
        title: 'Design App Screens',
        description: 'Create UI designs for the main app screens: Home, Profile, Settings.',
        status: 'Pending',
        priority: 'Low',
        dueDate: new Date('2025-08-15'),
        projectId: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', // Mobile App MVP
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tasks', null, {});
  },
};
