'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('projects', [
      {
        id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
        title: 'Website Redesign',
        description: 'Overhaul the company website with a modern design, improved UX, and responsive layout.',
        status: 'active',
        ownerId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', // John Member
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
        title: 'Mobile App MVP',
        description: 'Build the first version of the mobile application with core features.',
        status: 'on-hold',
        ownerId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', // John Member
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('projects', null, {});
  },
};
