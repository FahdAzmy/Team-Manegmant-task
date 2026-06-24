'use strict';

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const salt = await bcrypt.genSalt(10);

    await queryInterface.bulkInsert('users', [
      {
        id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin@123', salt),
        role: 'admin',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
        name: 'John Member',
        email: 'member@example.com',
        password: await bcrypt.hash('Member@123', salt),
        role: 'member',
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
